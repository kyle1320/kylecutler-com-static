window.onload = function() {
	var drawCanvas = $('draw-canvas');
	var glCanvas = $('gl-canvas');
	var drawContext = drawCanvas.getContext('2d');
	var gl = getGL(glCanvas);

	var nodes, edges;

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
		selection	 : false,
		deselection  : false,
		graph        : false,
		background   : false,

		setAll : function(b) {
			this.mouseMotion = this.mousePress = this.mouseRelease =
			this.mouseEnter = this.mouseLeave = this.nodesChanged =
			this.edgesChanged = this.orderChanged = this.selection =
			this.deselection = this.graph = this.background = b;
		}
	};

	var positionAttrib;
	var bgbuffer;
	var uniforms = {
		edges: [],
		nEdges: null,
		order: null,
		highlight: null,
		scale: null
	}
	var glReady = false;

	var nearestNode;
	var selectedNode;
	var createdEdge;
	var mouse;

	var options = {
		nodeSize: 10,
		edgeWidth: 1,
		order: 0,
		showNodes: true,
		showEdges: true,
		background: false,
		edgeDists: false,
		highlight: false,
		constantUpdates: false
	}

	var inputs = {
		orderinput: $('orderinput'),
		sncheck: $('shownodes'),
		secheck: $('showedges'),
		bgcheck: $('background'),
		edcheck: $('edgedists'),
		hlcheck: $('highlight'),
		upcheck: $('updates'),
	};

	init();

	function init() {
		scaleCanvas(drawCanvas, drawContext);
		var scale = scaleCanvas(glCanvas, gl);

		var canvases = $('canvases');
		fitElement(canvases, canvases.clientWidth, canvases.clientHeight, function(el) {
			drawCanvas.style.width = glCanvas.style.width = canvases.style.width;
			drawCanvas.style.height = glCanvas.style.height = canvases.style.height;
		});

		var graph = connectedGraph(drawCanvas.drawWidth, drawCanvas.drawHeight, 4);
		nodes = graph.nodes;
		edges = graph.edges;

		// webGL setup for background drawing

		loadFiles(['shader.vert', 'shader.frag'], function(files) {
			var program = getGLProgram(gl, files[0], files[1]);
			gl.useProgram(program);

			positionAttrib = gl.getAttribLocation(program, 'position');

			for (var i=0; i < 16; i++) { // MAX_EDGES is 16 in shader.frag
				uniforms.edges[i] = gl.getUniformLocation(program, 'edges['+i+']');
			}

			uniforms.nEdges = gl.getUniformLocation(program, 'num_edges');
			uniforms.order = gl.getUniformLocation(program, 'order');
			uniforms.highlight = gl.getUniformLocation(program, 'highlight');

			uniforms.scale = gl.getUniformLocation(program, 'scale');
			gl.uniform1f(uniforms.scale, scale);

			glReady = true;
			redrawBackground();
		}, function(url) {
			console.log("Couldn't find file: " + url);
		});

		bgbuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bgbuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([
				-1.0, -1.0,
				 1.0, -1.0,
				-1.0,  1.0,
				-1.0,  1.0,
				 1.0, -1.0,
				 1.0,  1.0
			]),
			gl.STATIC_DRAW
		);

		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);

		console.log(gl);

		// we want to update te first time we draw, so just... update everything
		updates.setAll(true);

		nearestNode = null;
		selectedNode = null;
		createdEdge = null;
		mouse = {x: 0, y: 0, inside: false};

		linkInputToNumber(inputs.orderinput, options, 'order', redrawBackground, false);

		linkCheckboxToBoolean(inputs.sncheck, options, 'showNodes', redrawGraph);
		linkCheckboxToBoolean(inputs.secheck, options, 'showEdges', redrawGraph);
		linkCheckboxToBoolean(inputs.bgcheck, options, 'background', redrawBackground);
		linkCheckboxToBoolean(inputs.edcheck, options, 'edgeDists');
		linkCheckboxToBoolean(inputs.hlcheck, options, 'highlight', redrawBackground);
		linkCheckboxToBoolean(inputs.upcheck, options, 'constantUpdates');

		drawCanvas.addEventListener('mousedown',  mousedown,  false);
		drawCanvas.addEventListener('mouseup',    mouseup,    false);
		drawCanvas.addEventListener('mouseenter', mouseenter, false);
		drawCanvas.addEventListener('mouseleave', mouseleave, false);
		drawCanvas.addEventListener('mousemove',  mousemove,  false);

		drawCanvas.addEventListener('touchstart', mousedown,  false);
		drawCanvas.addEventListener('touchend',   mouseleave, false);
		drawCanvas.addEventListener('touchmove',  mousemove,  false);

		window.addEventListener('keydown', keydown, false);

		draw();
	}

	function draw() {
		// we will update the background if:
		//  - we are drawing the background
		//  - the graph edges have changed, or we have deselected a node,
		//	implying that the edges may have changed
		//  - constant updates are turned on, or the update is not due to
		//	mouse motion or pressing. So we update on mouse release, and
		//	on any other updates (key press, checkbox, etc.)
		//  - or, if the order changed
		var bgchanged = options.background
						&& (
							updates.background
							|| ((updates.edgesChanged || updates.deselection)
								&& (options.constantUpdates
									|| (!updates.mouseMotion && !updates.mousePress)
								)
							)
							|| updates.orderChanged
						);

		// we need to redraw any time the graph itself changes
		var graphchanged = updates.graph || updates.nodesChanged || updates.edgesChanged;

		// we ned to redraw if we are drawing edge distances,
		// and the mouse moved, entered, or exited the canvas
		var distschanged = options.edgeDists
						   && (
						       updates.mouseMotion
						       || updates.mouseEnter
						       || updates.mouseLeave
						   );

		// reset the updates
		updates.setAll(false);

		// if the background changed, we need to redraw the webgl canvas
		if (bgchanged && glReady && edges.length <= 16) {
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.uniform1i(uniforms.nEdges, edges.length);
			gl.uniform1i(uniforms.order, options.order);
			gl.uniform1f(uniforms.highlight, options.highlight);

			for (var i=0; i < edges.length; i++) {
				var edge = edges[i];
				gl.uniform4f(
					uniforms.edges[i],
					edge.a.x,
					drawCanvas.drawHeight - edge.a.y,
					edge.b.x,
					drawCanvas.drawHeight - edge.b.y
				);
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, bgbuffer);
			gl.enableVertexAttribArray(positionAttrib);
			gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

			gl.drawArrays(gl.TRIANGLES, 0, 6);
		} else if (!options.background) {
			gl.clear(gl.COLOR_BUFFER_BIT);
		}

		// if the graph or edges changed, we need to redraw the 2d canvas
		if (graphchanged || distschanged) {
			drawContext.clearRect(0, 0, drawCanvas.drawWidth, drawCanvas.drawHeight);

			// draw the edges first, so they don't overlap the nodes
			if (options.showEdges) {
				edges.forEach(function(edge) {
					drawContext.beginPath();
					drawContext.moveTo(edge.a.x, edge.a.y);
					drawContext.lineTo(edge.b.x, edge.b.y);
					drawContext.closePath();

					drawContext.strokeStyle = edge.color;
					drawContext.lineWidth = options.edgeWidth;
					drawContext.stroke();
				});
			}

			// now draw the nodes
			if (options.showNodes) {
				nodes.forEach(function(node) {
					drawContext.beginPath();
					drawContext.arc(node.x, node.y, options.nodeSize, 0, 2*Math.PI);
					drawContext.closePath();

					// black fill, white stroke
					drawContext.fillStyle = '#000000';
					drawContext.strokeStyle = '#FFFFFF';
					drawContext.lineWidth = 1;
					drawContext.fill();
					drawContext.stroke();
				});
			}

			// draw the edge distances only if the mouse is inside the canvas
			if (options.edgeDists && mouse.inside) {
				for (var i=0; i < edges.length; i++) {
					var ldist = edges[i].distance(mouse);

					drawContext.beginPath();
					drawContext.arc(mouse.x, mouse.y, ldist, 0, 2*Math.PI);
					drawContext.closePath();

					drawContext.strokeStyle = edges[i].color;
					drawContext.lineWidth = 1;
					drawContext.stroke();
				}
			}
		}
	}

	function changeOrder(order) {
		if (options.order != order) {
			options.order = order;
			inputs.orderinput.valueAsNumber = order;
			redrawBackground();
		}
	}

	function redrawGraph() {
		updates.graph = true;
		draw();
	}

	function redrawBackground() {
		updates.background = true;
		draw();
	}

	function findNearestNode() {
		var minDist = Number.POSITIVE_INFINITY;
		var dist;
		for (var i=0; i < nodes.length; i++) {
			dist = nodes[i].distance(mouse);

			if (dist < minDist) {
				minDist = dist;
				nearestNode = nodes[i];
			}
		}
	}

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

	function mousedown(evt) {
		takeTouchFocus(evt);

		var mousepos = getRelativeCoord(drawCanvas, evt);
		mouse.x = mousepos.x;
		mouse.y = mousepos.y;

		// select a node if we are over it
		if (nearestNode.nearby(mouse, options.nodeSize)) {
			selectedNode = nearestNode;

			updates.selection = true;
		}

		// if we ctrl clicked, create a node or edge
		if (evt.ctrlKey || evt.metaKey) {

			// we are not over an existing node, so we will create a new node
			if (selectedNode === null) {
				nearestNode = new Node(mouse.x, mouse.y, 10);
				nodes.push(nearestNode);

				updates.nodesChanged = true;

			// we will create an edge from the existing node
			} else {
				var node = new Node(mouse.x, mouse.y, 10);
				createdEdge = new Edge(node, selectedNode, randomColor());

				// we select the new node, but don't add it to the nodes list,
				// because we don't actually know if we want to add it yet.
				// we may just connect this edge to an existing node instead.
				selectedNode = node;

				edges.push(createdEdge);

				updates.edgesChanged = true;
			}
		}

		updates.mousePress = true;

		draw();
	}

	function mouseup(evt) {
		takeTouchFocus(evt);

		// if we were creating an edge, finish it
		if (createdEdge !== null) {

			// if we are over an existing node, connect the edge to that node
			if (nearestNode.nearby(mouse, options.nodeSize)) {
				createdEdge.a = nearestNode;

				updates.edgesChanged = true;

			// otherwise, place a 'new' node down that connects to the edge
			} else {
				nodes.push(selectedNode);
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
		draw();
	}

	function mousemove(evt) {
		takeTouchFocus(evt);

		var mousepos = getRelativeCoord(drawCanvas, evt);
		mouse.x = mousepos.x;
		mouse.y = mousepos.y;

		findNearestNode();

		// if we are dragging a node, move it
		if (selectedNode !== null) {
			selectedNode.move(mouse);

			updates.nodesChanged = true;
			updates.edgesChanged = true;
		}

		updates.mouseMotion = true;

		draw();
	}

	function keydown(evt) {
		if (evt.keyCode == 81) { // 'q'

			// delete a node if we are over it
			if (nearestNode.nearby(mouse, options.nodeSize)) {
				var index = nodes.indexOf(nearestNode);
				nodes.splice(index, 1);
				updates.nodesChanged = true;

				// delete any edges connected to the node
				for (var i=0; i < edges.length; i++) {
					var edge = edges[i];

					if (edge.a == nearestNode || edge.b == nearestNode) {
						edges.splice(i, 1);
						updates.edgesChanged = true;
						i--;
					}
				}

				findNearestNode();

			// we are not over a node, look for edges
			} else {
				for (var i=0; i < edges.length; i++) {
					var ldist = edges[i].distance(mouse);

					// if we are within 4 pixels, delete the edge
					if (ldist < 4) {
						edges.splice(i, 1);
						updates.edgesChanged = true;
						break;
					}
				}
			}
		} else if (evt.keyCode == 39) { // right arrow
			changeOrder(options.order + 1);
			updates.orderChanged = true;
		} else if (evt.keyCode == 37) { // left arrow
			if (options.order > 0) {
				changeOrder(options.order - 1);
				updates.orderChanged = true;
			}
		}

		draw();
	}

	function mouseenter(evt) {
		mouse.inside = true;

		updates.mouseEnter = true;

		draw();
	};

	function mouseleave(evt) {
		mouse.inside = false;

		updates.mouseLeave = true;

		mouseup(evt);
	};

	function connectedGraph(width, height, n) {
		var nodes = [];
		var edges = [];

		for (var i=0; i < n; i++) {
			var node = new Node(
				width / 2 + Math.sin(2*Math.PI*i / n)*(width / 4),
				height / 2 + Math.cos(2*Math.PI*i / n)*(height / 4), 10
			);
			nodes[i] = node;
			for (var j=0; j < i; j++) {
				edges[edges.length] = new Edge(node, nodes[j], randomColor());
			}
		}

		return {nodes: nodes, edges: edges};
	}
};

/*this.getDataImage = function() {
	if (!bgimage) bgimage = this.context.createImageData(this.canvas.width, this.canvas.height);

	if (graph.edges.length - order < 2) {
		return null;
	}

	// go over the entire image
	for (var x=0; x < bgimage.width; x++) {
		for (var y=0; y < bgimage.height; y++) {

			// get the image data index
			var i = (y * this.canvas.width + x) * 4;

			// calculate the edge distances
			// insert them into the list in sorted order
			var dists = [];
			for (var j=0; j < graph.edges.length; j++) {
				var val = graph.edges[j].distance({
					x: (x * this.canvas.drawWidth) / this.canvas.width,
					y: (y * this.canvas.drawHeight) / this.canvas.height
				});

				var k = j;
				while (k > 0 && dists[k-1] > val) {
					dists[k] = dists[k-1];
					k--;
				}
				dists[k] = val;
			}

			// get the nth order differences between the edge distances
			var len = dists.length;
			for (var o = 0; o < order; o++) {
				len--;

				for (j=0; j < len; j++) {
					dists[j] = dists[j+1] - dists[j];
				}
			}

			// find the standard deviation of the differences
			var sumsq = 0.0;
			var sqsum = 0.0;
			for (j=0; j < len; j++) {
				sumsq += dists[j];
				sqsum += dists[j] * dists[j];
			}
			sumsq = (sumsq * sumsq) / len;

			var stdev = Math.sqrt((sqsum - sumsq) / (len - 1));

			// a standard deviation of 0 should be white, or 255
			stdev = 255 - stdev;
			if (stdev < 0) stdev = 0;

			// if we are highlighting, determine whether or not the pixel
			// should be red based on the order and standard deviation
			var threshold = 253 - order*3;
			var fade = 255 * ((255 - stdev) / (255 - threshold));
			var val = hlcheck.checked && stdev > threshold ? fade : stdev;

			// set the pixel
			bgimage.data[i+0] = stdev;
			bgimage.data[i+1] = val;
			bgimage.data[i+2] = val;
			bgimage.data[i+3] = 255;
		}
	}
};*/