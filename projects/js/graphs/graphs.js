function Node(x, y) {
    this.x = x;
    this.y = y;
}

Node.prototype.distance = function(coord) {
    var dx = coord.x - this.x;
    var dy = coord.y - this.y;

    return Math.sqrt(dx*dx + dy*dy);
};

Node.prototype.nearby = function(coord, dist) {
    var dx = coord.x - this.x;
    var dy = coord.y - this.y;

    return dx*dx + dy*dy < dist*dist;
};

Node.prototype.move = function(coord) {
    this.x = coord.x;
    this.y = coord.y;
};

function Edge(a, b, color) {
    this.a = a;
    this.b = b;
    this.color = color;
}

Edge.prototype.distance = function(p) {
    var tx = this.b.x - this.a.x;
    var ty = this.b.y - this.a.y;
    var l2 = tx*tx + ty*ty;

    var dax = p.x - this.a.x;
    var day = p.y - this.a.y;

    var dbx = p.x - this.b.x;
    var dby = p.y - this.b.y;

    var t = tx*dax + ty*day;

    if (t <= 0) {
        return Math.sqrt(dax*dax + day*day);
    } else if (t >= l2) {
        return Math.sqrt(dbx*dbx + dby*dby);
    } else {
        return Math.sqrt(dax*dax + day*day - (t * t) / l2);
    }
};

function Graph(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
}

function DrawableGraph(graph, canvas) {
    this.graph = graph;
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    scaleCanvas(canvas, this.context);

    // used in redrawing to determine what has changed and needs to be updated.
    var updates = {
        mouseMotion  : false,
        mousePress   : false,
        mouseRelease : false,
        mouseEnter   : false,
        mouseLeave   : false,
        nodesChanged : false,
        edgesChanged : false,
        orderChanged : false,
        selection    : false,
        deselection  : false,

        setAll : function(b) {
            this.mouseMotion = this.mousePress = this.mouseRelease =
            this.mouseEnter = this.mouseLeave = this.nodesChanged =
            this.edgesChanged = this.orderChanged = this.selection =
            this.deselection = b;
        }
    };

    // we want to update te first time we draw, so just... update everything
    updates.setAll(true);

    var bgimage = null;
    var nearestNode = null;
    var selectedNode = null;
    var createdEdge = null;
    var mouse = {x: 0, y: 0};
    var mouseinside = false;
    var order = 0;

    var self = this;

    var nodeSize = 10;
    var edgeWidth = 1;

    var orderinput = document.getElementById("orderinput");
    var bgcheck = document.getElementById("background");
    var edcheck = document.getElementById("edgedists");
    var hlcheck = document.getElementById("highlight");
    var upcheck = document.getElementById("updates");
    var sncheck = document.getElementById("shownodes");
    var secheck = document.getElementById("showedges");

    this.draw = function() {
        // we will update the background if:
        //  - we are drawing the background
        //  - the graph edges have changed, or we have deselected a node,
        //    implying that the edges may have changed
        //  - constant updates are turned on, or the update is not due to
        //    mouse motion or pressing. So we update on mouse release, and
        //    on any other updates (key press, checkbox, etc.)
        //  - or, if the order changed
        var bgchanged = bgcheck.checked
                        && (
                            ((updates.edgesChanged || updates.deselection)
                                && (upcheck.checked
                                    || (!updates.mouseMotion && !updates.mousePress)
                                )
                            )
                            || updates.orderChanged
                        );

        // we need to redraw any time the graph itself changes
        var graphchanged = updates.nodesChanged || updates.edgesChanged;

        // we ned to redraw if we are drawing edge distances,
        // and the mouse moved, entered, or exited the canvas
        var distschanged = edcheck.checked
                           && (
                               updates.mouseMotion
                               || updates.mouseEnter
                               || updates.mouseLeave
                           );

        // we need to update the order label if the order changed
        if (updates.orderChanged) {
            orderinput.valueAsNumber = order;
        }

        // reset the updates
        updates.setAll(false);

        // if anything changed, we need to redraw
        if (bgchanged || graphchanged || distschanged) {
            this.context.clearRect(0, 0, canvas.drawWidth, canvas.drawHeight);

            // only draw the background if the option is checked
            if (bgcheck.checked) {
                if (bgchanged) {
                    bgimage = this.getDataImage();
                }

                if (bgimage) {
                    this.context.putImageData(bgimage, 0, 0);
                }
            }

            var ctx = this.context;

            // draw the edges first, so they don't overlap the nodes
            if (secheck.checked) {
                this.graph.edges.forEach(function(edge) {
                    ctx.beginPath();
                    ctx.moveTo(edge.a.x, edge.a.y);
                    ctx.lineTo(edge.b.x, edge.b.y);
                    ctx.closePath();

                    ctx.strokeStyle = edge.color;
                    ctx.lineWidth = edgeWidth;
                    ctx.stroke();
                });
            }

            // now draw the nodes
            if (sncheck.checked) {
                this.graph.nodes.forEach(function(node) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeSize, 0, 2*Math.PI);
                    ctx.closePath();

                    // black fill, white stroke
                    ctx.fillStyle = "#000000";
                    ctx.strokeStyle = "#FFFFFF";
                    ctx.lineWidth = 1;
                    ctx.fill();
                    ctx.stroke();
                });
            }

            // draw the edge distances only if the mouse is inside the canvas
            if (edcheck.checked && mouseinside) {
                for (var i=0; i < graph.edges.length; i++) {
                    var ldist = graph.edges[i].distance(mouse);

                    ctx.beginPath();
                    ctx.arc(mouse.x, mouse.y, ldist, 0, 2*Math.PI);
                    ctx.closePath();

                    ctx.strokeStyle = graph.edges[i].color;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    };

    this.getDataImage = function() {
        var imgData = this.context.createImageData(this.canvas.width, this.canvas.height);

        if (graph.edges.length - order < 2) {
            return null;
        }

        function sort(a, b) {return b > a ? -1 : b == a ? 0 : 1;};
        // go over the entire image
        for (var x=0; x < imgData.width; x++) {
            for (var y=0; y < imgData.height; y++) {

                // get the image data index
                var i = (y * this.canvas.width + x) * 4;

                // calculate the edge distances
                var dists = [];
                for (var j=0; j < graph.edges.length; j++) {
                    dists[j] = graph.edges[j].distance({
                        x: (x * this.canvas.drawWidth) / this.canvas.width,
                        y: (y * this.canvas.drawHeight) / this.canvas.height
                    });
                }

                // sort the distances
                dists.sort(sort);

                // get the nth order differences between the edge distances
                var values = dists;
                var newvalues;
                for (var o = 0; o < order; o++) {
                    newvalues = [];

                    for (j=0; j < values.length - 1; j++) {
                        newvalues[j] = values[j+1] - values[j];
                    }

                    values = newvalues;
                }

                // find the standard deviation of the differences
                var sumsq = 0.0;
                var sqsum = 0.0;
                for (j=0; j < values.length; j++) {
                    sumsq += values[j];
                    sqsum += values[j] * values[j];
                }
                sumsq = (sumsq * sumsq) / values.length;

                var stdev = Math.sqrt((sqsum - sumsq) / (values.length - 1));

                // a standard deviation of 0 should be white, or 255
                stdev = 255 - stdev;
                if (stdev < 0) stdev = 0;

                // if we are highlighting, determine whether or not the pixel
                // should be red based on the order and standard deviation
                var threshold = 253 - order*3;
                var fade = 255 * ((255 - stdev) / (255 - threshold));
                var val = hlcheck.checked && stdev > threshold ? fade : stdev;

                // set the pixel
                imgData.data[i+0] = stdev;
                imgData.data[i+1] = val;
                imgData.data[i+2] = val;
                imgData.data[i+3] = 255;
            }
        }

        return imgData;
    };

    this.forceRedraw = function() {
        updates.setAll(true);
        this.draw();
    };

    this.findNearestNode = function() {
        var minDist = Number.POSITIVE_INFINITY;
        var dist;
        for (var i=0; i < graph.nodes.length; i++) {
            dist = graph.nodes[i].distance(mouse);

            if (dist < minDist) {
                minDist = dist;
                nearestNode = graph.nodes[i];
            }
        }
    };

    this.updateOrder = function() {
        order = orderinput.valueAsNumber;
        updates.orderChanged = true;
        this.draw();
    };

    var mousedown = function(evt) {

        // select a node if we are over it
        if (nearestNode.nearby(mouse, nodeSize)) {
            selectedNode = nearestNode;

            updates.selection = true;
        }

        // if we ctrl clicked, create a node or edge
        if (evt.ctrlKey || evt.metaKey) {

            // we are not over an existing node, so we will create a new node
            if (selectedNode === null) {
                nearestNode = new Node(mouse.x, mouse.y, 10);
                graph.nodes.push(nearestNode);

                updates.nodesChanged = true;

            // we will create an edge from the existing node
            } else {
                var node = new Node(mouse.x, mouse.y, 10);
                createdEdge = new Edge(node, selectedNode, randomColor());

                // we select the new node, but don't add it to the nodes list,
                // because we don't actually know if we want to add it yet.
                // we may just connect this edge to an existing node instead.
                selectedNode = node;

                graph.edges.push(createdEdge);

                updates.edgesChanged = true;
            }
        }

        updates.mousePress = true;

        self.draw();
    };

    var mouseup = function(evt) {

        // if we were creating an edge, finish it
        if (createdEdge !== null) {

            // if we are over an existing node, connect the edge to that node
            if (nearestNode.nearby(mouse, nodeSize)) {
                createdEdge.a = nearestNode;

                updates.edgesChanged = true;

            // otherwise, place a "new" node down that connects to the edge
            } else {
                graph.nodes.push(selectedNode);
                nearestNode = selectedNode;

                updates.nodesChanged = true;
            }

            createdEdge = null;
        }

        if (selectedNode !== null) {
            updates.deselection = true;
        }

        updates.mouseRelease = true;

        // release the selected node
        selectedNode = null;
        self.draw();
    };

    var mousemove = function(evt) {
        mouse = getRelativeCoord(self.canvas, evt);

        self.findNearestNode();

        // if we are dragging a node, move it
        if (selectedNode !== null) {
            selectedNode.move(mouse);

            updates.nodesChanged = true;
            updates.edgesChanged = true;
        }

        updates.mouseMotion = true;

        self.draw();
    };

    var keydown = function(evt) {
        if (evt.keyCode == 81) { // 'q'

            // delete a node if we are over it
            if (nearestNode.nearby(mouse, nodeSize)) {
                var index = graph.nodes.indexOf(nearestNode);
                graph.nodes.splice(index, 1);
                updates.nodesChanged = true;

                // delete any edges connected to the node
                for (var i=0; i < graph.edges.length; i++) {
                    var edge = graph.edges[i];

                    if (edge.a == nearestNode || edge.b == nearestNode) {
                        graph.edges.splice(i, 1);
                        updates.edgesChanged = true;
                        i--;
                    }
                }

                self.findNearestNode();

                self.needsRedraw = true;

            // we are not over a node, look for edges
            } else {
                for (var i=0; i < graph.edges.length; i++) {
                    var ldist = graph.edges[i].distance(mouse);

                    // if we are within 4 pixels, delete the edge
                    if (ldist < 4) {
                        graph.edges.splice(i, 1);
                        updates.edgesChanged = true;
                        self.needsRedraw = true;
                        break;
                    }
                }
            }
        } else if (evt.keyCode == 39) { // right arrow
            order++;
            updates.orderChanged = true;
        } else if (evt.keyCode == 37) { // left arrow
            if (order > 0) {
                order--;
                updates.orderChanged = true;
            }
        }

        self.draw();
    };

    var mouseenter = function(evt) {
        mouseinside = true;

        updates.mouseEnter = true;

        self.draw();
    };

    var mouseleave = function(evt) {
        mouseinside = false;

        updates.mouseLeave = true;

        mouseup(evt);
    };

    canvas.addEventListener('mousedown',  mousedown,  false);
    canvas.addEventListener('mouseup',    mouseup,    false);
    canvas.addEventListener('mouseenter', mouseenter, false);
    canvas.addEventListener('mouseleave', mouseleave, false);
    canvas.addEventListener('mousemove',  mousemove,  false);

    window.addEventListener('keydown',    keydown,   false);
}

function connectedGraph(width, height, n) {
    var nodes = [];
    var edges = [];

    for (var i=0; i < n; i++) {
        var node = new Node(
            width / 2 + Math.sin(2*Math.PI*i / n)*(width / 4),
            height / 2 + Math.cos(2*Math.PI*i / n)*(height / 4), 10);
        nodes[i] = node;
        for (var j=0; j < i; j++) {
            edges[edges.length] = new Edge(node, nodes[j], randomColor());
        }
    }

    return new Graph(nodes, edges);
}

var draw;
window.onload = function() {
    var canvas = document.getElementById("drawCanvas");

    document.getElementById("background").setAttribute('onclick','draw.forceRedraw();');
    document.getElementById("highlight").setAttribute('onclick','draw.forceRedraw();');
    document.getElementById("shownodes").setAttribute('onclick', 'draw.forceRedraw();');
    document.getElementById("showedges").setAttribute('onclick', 'draw.forceRedraw();');
    document.getElementById("orderinput").setAttribute('onchange', 'draw.updateOrder();');

    var graph = connectedGraph(canvas.width, canvas.height, 4);//new Graph(nodes, edges);
    draw = new DrawableGraph(graph, canvas);

    draw.draw();
};