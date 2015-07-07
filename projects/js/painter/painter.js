window.onload = function() {
	var drawCanvas = $('draw-canvas');
	var neighborCanvas = $('neighbor-canvas');
	var drawContext = drawCanvas.getContext('2d');
	var neighborContext = neighborCanvas.getContext('2d');

	var paused = true;
	var drawInterval;

	var cells = null;
	var edges = null;
	var width, height;
	var img;

	var mouse = {x: 0, y: 0, pressed: false, dragged: false};
	var selected = null;
	var dragged = false;

	var neighborData = {
		offsetX: 0.0,
		offsetY: 0.0,
		width: 0,
		height: 0,
		scale: 11,
		padding: 1
	};

	var options = {
		get width() {return drawCanvas.width;},
		get height() {return drawCanvas.height;},
		set width(w) {setSize(w, height);},
		set height(h) {setSize(width, h);},

		pattern: 'center',
		neighbors: [],
		baseRGB: [255, 165, 0],
		goalRGB: [255, 100, 100],
		//drawRGB: [255, 255, 255],
		deviation: 5,
		reliance: 1.0,
		tendency: 0.002,
		delay: 0,
		initialDeviation: 50,
		numPoints: 10,
		size: 100,
		hexAngle: 60
	};

	var inputs = {
		relianceInput: $('reliance'),
		deviationInput: $('deviation'),
		colorInput: $('color'),
		goalColorInput: $('goal-color'),
		//drawColorInput: $('draw-color'),
		tendencyInput: $('tendency'),
		delayInput: $('delay'),
		widthInput: $('width'),
		heightInput: $('height'),
		patternSelect: $('pattern'),
		initDeviationInput: $('init-deviation'),
		numPointsInput: $('num-points'),
		sizeInput: $('size'),
		hexAngleInput: $('hex-angle'),
		neighborsZoomInBtn: $('neighbors-zoom-in'),
		neighborsZoomOutBtn: $('neighbors-zoom-out'),
		neighborsCenterBtn: $('neighbors-center'),
		neighborsResetBtn: $('neighbors-reset'),
		pauseBtn: $('pause'),
		resetBtn: $('reset'),
		saveBtn: $('save-btn'),
		saveImg: $('save-img')
	};

	init();

	function init() {
		scaleCanvas(drawCanvas, drawContext);
		scaleCanvas(neighborCanvas, neighborContext);

		linkInputToNumber(inputs.relianceInput, options, 'reliance');
		linkInputToNumber(inputs.deviationInput, options, 'deviation');
		linkInputToNumber(inputs.tendencyInput, options, 'tendency');
		linkInputToNumber(inputs.delayInput, options, 'delay');
		linkInputToNumber(inputs.widthInput, options, 'width', null, false);
		linkInputToNumber(inputs.heightInput, options, 'height', null, false);
		linkInputToNumber(inputs.initDeviationInput, options, 'initialDeviation');
		linkInputToNumber(inputs.numPointsInput, options, 'numPoints');
		linkInputToNumber(inputs.sizeInput, options, 'size');
		linkInputToNumber(inputs.hexAngleInput, options, 'hexAngle');

		linkSelectToString(inputs.patternSelect, options, 'pattern', hideOptionals);

		linkColorChooserToValues(inputs.colorInput, options, 'baseRGB');
		linkColorChooserToValues(inputs.goalColorInput, options, 'goalRGB');
		//linkColorChooserToValues(inputs.drawColorInput, options, 'drawRGB');

		inputs.pauseBtn.addEventListener('click', function() {setPaused(!paused);});
		inputs.resetBtn.addEventListener('click', reset);
		inputs.saveBtn.addEventListener('click', function() {inputs.saveImg.src = drawCanvas.toDataURL();});
		inputs.neighborsZoomInBtn.addEventListener('click', function() {neighborData.scale++; drawNeighbors()});
		inputs.neighborsZoomOutBtn.addEventListener('click', function() {
			if (neighborData.scale > 1) {
				neighborData.scale--;
				drawNeighbors();
			}
		});
		inputs.neighborsCenterBtn.addEventListener('click', centerNeighbors);
		inputs.neighborsResetBtn.addEventListener('click', resetNeighbors);

		neighborCanvas.addEventListener('mousedown', neighborsMouseDown);
		neighborCanvas.addEventListener('touchstart', neighborsMouseDown);
		neighborCanvas.addEventListener('mousemove', neighborsMouseMove);
		neighborCanvas.addEventListener('touchmove', neighborsMouseMove);
		neighborCanvas.addEventListener('mouseup', neighborsMouseUp);
		neighborCanvas.addEventListener('touchend', neighborsMouseUp);
		neighborCanvas.addEventListener('mouseleave', neighborsMouseUp);

		hideOptionals();
		neighborData.width = neighborCanvas.clientWidth;
		neighborData.height = neighborCanvas.clientHeight;
		resetNeighbors();

		reset();
		setPaused(false);
	}

	function reset() {
		width = drawCanvas.width;
		height = drawCanvas.height;
		img = drawContext.createImageData(width, height);

		delete cells;

		cells = new Array(height);
		for (var y=0; y < height; y++) {
			cells[y] = new Array(width);
		}
		edges = null;

		var i, x, y, cell;
		switch(options.pattern) {
			default:
			case 'center':
				add({
					x: width / 2,
					y: height / 2,
					r: options.baseRGB[0],
					g: options.baseRGB[1],
					b: options.baseRGB[2],
					n: 0
				});
				break;
			case 'vertical':
				for (x = 0; x < width; x++) {
					cell = {
						x: x,
						y: 0,
						r: options.baseRGB[0],
						g: options.baseRGB[1],
						b: options.baseRGB[2],
						n: 0
					};
					deviate(cell, options.initialDeviation);
					add(cell);
				}
				break;
			case 'random':
				for (i = 0; i < options.numPoints; i++) {
					cell = {
						x: Math.floor(Math.random() * width),
						y: Math.floor(Math.random() * height),
						r: options.baseRGB[0],
						g: options.baseRGB[1],
						b: options.baseRGB[2],
						n: 0
					}
					deviate(cell, options.initialDeviation);
					add(cell);
				}
				break;
			case 'hex':
				var a = options.hexAngle * Math.PI / 180;
				var cos = Math.cos(a);
				var sin = Math.sin(a);
				var cot = 1.0 / Math.tan(a);
				var size = options.size;

				for (x = options.size/2; x < width + (width * cot); x += size) {
					for (y = options.size/2; y < height / sin; y += size) {
						var ry = Math.floor(y * sin);
						var rx = Math.floor(x - y * cos);

						if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
							cell = {
								x: rx,
								y: ry,
								r: options.baseRGB[0],
								g: options.baseRGB[1],
								b: options.baseRGB[2],
								n: 0
							};
							deviate(cell, options.initialDeviation);
							add(cell);
						}
					}
				}
				break;
		}

		drawContext.clearRect(0, 0, width, height);
	}

	function update() {
		var curr = edges;

		while (curr) {
			var c = curr.cell;

			if (randomChance(c)) {
				c.r /= c.n;
				c.g /= c.n;
				c.b /= c.n;
				deviate(c, options.deviation);

				if (curr.prev) {
					curr.prev.next = curr.next;
				} else {
					edges = curr.next
				}
				if (curr.next) {
					curr.next.prev = curr.prev;
				}

				add(c);
			}

			curr = curr.next;
		}

		if (!paused) setTimeout(update, options.delay);
	}

	function deviate(c, dev) {
		c.r = Math.clamp(((c.r + options.goalRGB[0]*options.tendency) / (1 + options.tendency)) + Math.random()*dev*2 - dev, 0, 255);
		c.g = Math.clamp(((c.g + options.goalRGB[1]*options.tendency) / (1 + options.tendency)) + Math.random()*dev*2 - dev, 0, 255);
		c.b = Math.clamp(((c.b + options.goalRGB[2]*options.tendency) / (1 + options.tendency)) + Math.random()*dev*2 - dev, 0, 255);
	}

	function randomChance(c) {
		return Math.random() < (Math.pow(c.n, options.reliance) / Math.pow(options.neighbors.length, options.reliance));
	}

	function draw() {
		drawContext.putImageData(img, 0, 0);
	}

	function add(c) {
		var i = options.neighbors.length;

		while (i--) {
			var n = options.neighbors[i];
			var nx = n.x + c.x;
			var ny = n.y + c.y;

			if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
				var nc = cells[ny][nx];

				if (!nc) {
					nc = cells[ny][nx] = {x: nx, y: ny, r: 0, g: 0, b: 0, n: 0};
					edges = {cell: nc, next: edges, prev: null};
					if (edges.next) edges.next.prev = edges;
				}

				nc.r += c.r;
				nc.g += c.g;
				nc.b += c.b;
				nc.n++;
			}
		}

		var index = (c.y * width + c.x) * 4;
		img.data[index+0] = c.r;
		img.data[index+1] = c.g;
		img.data[index+2] = c.b;
		img.data[index+3] = 255;
	}

	function setPaused(p) {
		if (p && !paused) {
			paused = p;
			clearInterval(drawInterval);
		} else if (!p && paused) {
			paused = p;
			drawInterval = setInterval(draw, 15);
			update();
		}

		inputs.pauseBtn.innerHTML = paused ? 'Resume' : 'Pause';
	}

	function setSize(w, h) {
		drawCanvas.width = width = w;
		drawCanvas.height = height = h;
		reset();
	}

	function hideOptionals() {
		var optionals = document.querySelectorAll('.optional');
		var i = optionals.length;
		while (i--) optionals[i].style.display='none';

		optionals = document.querySelectorAll('.optional.'+options.pattern);
		i = optionals.length;
		while (i--) optionals[i].style.display='block';
	}

	function drawNeighbors() {
		neighborContext.clearRect(0, 0, neighborCanvas.width, neighborCanvas.height);
		var skip = neighborData.scale + neighborData.padding;

		var alignY = (neighborData.offsetY % 1) * skip;
		var alignX;

		if (alignY > 0) alignY -= skip;

		for (var y = Math.floor(-neighborData.offsetY); alignY < neighborData.height; y++, alignY += skip) {
			alignX = (neighborData.offsetX % 1) * skip;
			if (alignX > 0) alignX -= skip;

			for (var x = Math.floor(-neighborData.offsetX); alignX < neighborData.width; x++, alignX += skip) {
				if (y === 0 && x === 0) {
					neighborContext.fillStyle = '#00FF00'
					neighborContext.strokeRect(alignX + neighborData.padding, alignY + neighborData.padding, neighborData.scale, neighborData.scale);
				} else if (selected && selected.y == y && selected.x == x) {
					neighborContext.fillStyle = "#CCCCFF";
				} else {
					neighborContext.fillStyle = "#BBBBBB";
				}
				neighborContext.fillRect(alignX + neighborData.padding, alignY + neighborData.padding, neighborData.scale, neighborData.scale);
			}
		}

		var i = options.neighbors.length;

		while (i--) {
			var n = options.neighbors[i];
			if (selected && selected.x == n.x && selected.y == n.y) {
				neighborContext.fillStyle = "#666699";
			} else {
				neighborContext.fillStyle = "#555555";
			}
			neighborContext.fillRect(
				skip * (n.x + neighborData.offsetX) + neighborData.padding,
				skip * (n.y + neighborData.offsetY) + neighborData.padding,
				neighborData.scale,
				neighborData.scale
			);
		}
	}

	function toggleNeighbor() {
		var i = options.neighbors.length;

		while (i--) {
			var n = options.neighbors[i];
			if (n.x == selected.x && n.y == selected.y) {
				options.neighbors.splice(i, 1);
				return;
			}
		}

		if (selected.x || selected.y)
			options.neighbors[options.neighbors.length] = selected;

		drawNeighbors();
	}

	function centerNeighbors() {
		neighborData.offsetX = (neighborData.width / (2 * (neighborData.scale + neighborData.padding))) - 0.5;
		neighborData.offsetY = (neighborData.height / (2 * (neighborData.scale + neighborData.padding))) - 0.5;
		drawNeighbors();
	}

	function resetNeighbors() {
		options.neighbors = [{x:0, y:1}, {x:1, y:1}, {x:1, y:0}, {x:1, y:-1}, {x:0, y:-1}, {x:-1, y:-1}, {x:-1, y:0}, {x:-1, y:1}];
		centerNeighbors();
	}

	function neighborsMouseDown(evt) {
		var mousepos = getRelativeCoord(neighborCanvas, evt);

		mouse.x = mousepos.x;
		mouse.y = mousepos.y;
		mouse.pressed = true;
	}

	function neighborsMouseMove(evt) {
		var mousepos = getRelativeCoord(neighborCanvas, evt);

		if (mouse.pressed) { //dragging
			mouse.dragged = true;
			neighborData.offsetX += (mousepos.x - mouse.x) / (neighborData.scale + neighborData.padding);
			neighborData.offsetY += (mousepos.y - mouse.y) / (neighborData.scale + neighborData.padding);
		} else {
			selected = {
				x: Math.floor(mousepos.x / (neighborData.scale + neighborData.padding) - neighborData.offsetX),
				y: Math.floor(mousepos.y / (neighborData.scale + neighborData.padding) - neighborData.offsetY),
			};
		}

		mouse.x = mousepos.x;
		mouse.y = mousepos.y;
		drawNeighbors();
	}

	function neighborsMouseUp(evt) {
		if (mouse.pressed && !mouse.dragged) toggleNeighbor();

		neighborsMouseMove(evt);

		mouse.pressed = false;
		mouse.dragged = false;
	}
};