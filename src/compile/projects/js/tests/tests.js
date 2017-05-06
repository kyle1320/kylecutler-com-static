window.onload = function() {
    var drawCanvas = $('draw-canvas');
    var drawContext = drawCanvas.getContext('2d');

    var paused = true;
    // var drawInterval;

    var tree;
    var inactive;
    var points;
    var currlevel;
    var prevmax;
    var currmax;

    var densitysamples;
    var currsample;
    var density;
    var progress;

    var options = {
        width: 3000,
        height: 3000,
        samples: 30,
        padding: 12,
        min_r: 6,
        max_r: 300,
        // padding: 4,
        // min_r: 2,
        // max_r: 300,
        maxlevel: -1,
        inactivity: 100,
        pattern: "alternate",
        bgcolor: null,//"#000000",//"#F36E21",
        maincolor: null,//"#513127",
    };

    // contains references to HTML elements
    // that are used to change options or perform actions
    var inputs = {
        pauseBtn: $('pause'),
        resetBtn: $('reset'),
        saveBtn: $('save-btn'),
        saveImg: $('save-img'),
        width: $('width'),
        height: $('height'),
        samples: $('samples'),
        padding: $('padding'),
        min_r: $('min-rad'),
        max_r: $('max-rad'),
        maxlevel: $('max-level'),
        bgcolor: $('bg-color'),
        pattern: $('pattern'),
    };

    var outputs = {
        status: $('status'),
        level: $('level'),
        points: $('points'),
        progress: $('progress'),
    };

    // set everything up
    function init() {
        // scale the canvases to the actual screen resolution
        scaleCanvas(drawCanvas, drawContext);

        fitElement(drawCanvas);

        // setup button events
        inputs.pauseBtn.addEventListener('click', function() {setPaused(!paused);});
        inputs.resetBtn.addEventListener('click', reset);
        inputs.saveBtn.addEventListener('click', function() {inputs.saveImg.src = drawCanvas.toDataURL();});

        // link numerical options to their html inputs
        linkInputToNumber(inputs.width, options, 'width', resize, false);
        linkInputToNumber(inputs.height, options, 'height', resize, false);
        linkInputToNumber(inputs.samples, options, 'samples', reset, false);
        linkInputToNumber(inputs.padding, options, 'padding', reset, false);
        linkInputToNumber(inputs.min_r, options, 'min_r', reset, false);
        linkInputToNumber(inputs.max_r, options, 'max_r', reset, false);
        linkInputToNumber(inputs.maxlevel, options, 'maxlevel', reset, false);

        linkColorChooserToHexString(inputs.bgcolor, options, 'bgcolor', reset);

        linkSelectToString(inputs.pattern, options, 'pattern', reset);

        // run it
        resize();
        setPaused(false);
    }

    function resize() {
        resizeCanvas(drawCanvas, drawContext, options.width, options.height, false);
        reset();
    }

    // reset everything
    function reset() {
        if (options.bgcolor) {
            drawContext.fillStyle = options.bgcolor;
            drawContext.fillRect(0, 0, drawCanvas.drawWidth, drawCanvas.drawHeight);
        } else {
            drawContext.clearRect(0, 0, drawCanvas.drawWidth, drawCanvas.drawHeight);
        }

        tree = new QuadTree(0, 0, drawCanvas.drawWidth, drawCanvas.drawHeight);
        inactive = 0;
        points = 0;
        currlevel = 1;
        prevmax = 2 * options.max_r + options.padding;
        currmax = 0;

        densitysamples = new Array(options.inactivity * 10);
        currsample = 0;
        density = 0;
        progress = 0;

        outputs.status.innerHTML = "Running";
        outputs.level.innerHTML = currlevel;
    }

    function setColor() {
        if (options.pattern == "alternate") {
            if (bestp % 2) {
                if (options.bgcolor) {
                    drawContext.fillStyle = options.bgcolor;
                } else {
                    drawContext.globalCompositeOperation = "destination-out";
                }
            } else {
                if (options.maincolor) {
                    drawContext.fillStyle = options.maincolor;
                } else {
                    drawContext.fillStyle = randomColor();
                }
            }
        } else if (options.pattern == "rainbow") {
            drawContext.fillStyle = getSaturatedColor(bestp / 6);
        }
    }

    // var mintime = Math.floor(Date.now() / 500);
    // var currtime = mintime;

    // update what's running
    function update() {
        if (inactive < options.inactivity) {
            var best = -Infinity, bestx, besty;

            // do 30 random points before we give up
            for (var k = 0; k < options.samples; k++) {

                var px = Math.random() * drawCanvas.drawWidth;
                var py = Math.random() * drawCanvas.drawHeight;
                var level = 0;

                // get points close to the newly created one
                var nearby = tree.inRegion(px-prevmax, py-prevmax, px+prevmax, py+prevmax);

                var min = Infinity;
                var minin = Infinity;

                for (var j = 0; j < nearby.length; j++) {
                    var dx = px - nearby[j].x;
                    var dy = py - nearby[j].y;
                    var d_ = Math.sqrt(dx*dx + dy*dy) - nearby[j].r;
                    var d = Math.abs(d_);

                    if (d_ < 0 && nearby[j].r < minin) {
                        level = nearby[j].p + 1;
                        minin = nearby[j].r;
                    }

                    if (d < min) {
                        min = d;
                    }
                }

                if (level == currlevel-1 && min > best) {
                    best = min;
                    bestx = px;
                    besty = py;
                    bestp = level;
                }
            }

            // if there are no neighbors that are too close, and we are in bounds
            if (best > options.min_r + options.padding) {
                drawContext.beginPath();
                drawContext.arc(bestx, besty, Math.min(options.max_r, best-options.padding), 0, 2*Math.PI);
                drawContext.closePath();
                setColor();
                drawContext.fill();
                drawContext.globalCompositeOperation = "source-over";

                var newpt = {x: bestx, y: besty, r: Math.min(options.max_r, best-options.padding), p: bestp,
                             color: randomColor()};

                // insert into the tree and the active points list
                if (newpt.r > currmax) currmax = newpt.r;
                tree.insert(newpt);
                inactive = 0;

                outputs.points.innerHTML = (++points);
            } else {
                inactive++;
            }

            var oldsample = densitysamples[currsample];
            densitysamples[currsample] = (inactive ? 1 : 0);
            if (oldsample) density -= oldsample;
            density += densitysamples[currsample];
            currsample = (currsample + 1) % densitysamples.length;
            var x = density / densitysamples.length;
            progress = Math.clamp(Math.floor(130*Math.sqrt(x)/Math.sqrt(26-25*x)), progress, 99);

            // if (currtime != (currtime = Math.floor(Date.now() / 500))) {
            //     drawContext.beginPath();
            //     drawContext.rect(((currtime - mintime) * 10)%(drawCanvas.drawWidth-10), 0, 10, density*3);
            //     drawContext.closePath();
            //     drawContext.fillStyle="#FFFFFF";
            //     drawContext.fill();
            //     drawContext.strokeStyle="#000000";
            //     drawContext.stroke();
            // }

            outputs.progress.innerHTML = progress + "%";
        } else {
            if (currlevel != options.maxlevel && currmax > 0) {
                currlevel++;
                inactive = 0;
                prevmax = currmax;
                currmax = 0;

                densitysamples = new Array(1000);
                currsample = 0;
                density = 0.0;
                progress = 0;

                outputs.status.innerHTML = "Running";
                outputs.level.innerHTML = currlevel;

            } else {
                outputs.status.innerHTML = "Done";
                outputs.progress.innerHTML = "100%";

                // setPaused(true);
            }
        }

        // schedule another update
        if (!paused) setTimeout(update, 0);
    }

    // draw to the canvas
    // function draw() {
    //
    // }

    // pause / resume
    function setPaused(p) {
        if (p && !paused) {
            paused = p;
            // clearInterval(drawInterval);
        } else if (!p && paused) {
            paused = p;
            // drawInterval = setInterval(draw, 15);
            update();
        }

        inputs.pauseBtn.innerHTML = paused ? 'Resume' : 'Pause';
    }

    init();
};
