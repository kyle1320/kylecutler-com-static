'use strict';

window.onload = function () {
	var drawCanvas = $('draw-canvas');
	var infoCanvas = $('info-canvas');
	var drawContext = drawCanvas.getContext('2d');
	var infoContext = infoCanvas.getContext('2d');

	var paused = true;
	var drawInterval;

	var cells = [];
	var CellTypes = {
		black: { id: "black", color: "#000000", rules: [] },
		red: { id: "red", color: "#FF0000", rules: [] },
		orange: { id: "orange", color: "#FF9900", rules: [] },
		yellow: { id: "yellow", color: "#FFFF00", rules: [] },
		green: { id: "green", color: "#00FF00", rules: [] },
		cyan: { id: "cyan", color: "#00FFFF", rules: [] },
		blue: { id: "blue", color: "#0000FF", rules: [] },
		magenta: { id: "magenta", color: "#FF00FF", rules: [] },
		order: ["black", "red", "orange", "yellow", "green", "cyan", "blue", "magenta"]
	};

	var width, height;

	var mouse = { x: 0, y: 0, pressed: false, dragged: false };

	// contains variables that can be changed by the user
	var options = {
		delay: 0

	};

	// contains references to HTML elements
	// that are used to change options or perform actions
	var inputs = {};

	init();

	// set everything up
	function init() {

		// scale the canvases to the actual screen resolution
		scaleCanvas(drawCanvas, drawContext);

		// make sure the main canvas fits inside the screen
		fitElement(drawCanvas);
		/*
  		// add mouse event listeners
  		infoCanvas.addEventListener('mousedown', mouseDown);
  		infoCanvas.addEventListener('mousemove', mouseMove);
  		infoCanvas.addEventListener('mouseup', mouseUp);
  		infoCanvas.addEventListener('mouseleave', mouseExit);
  
  		// add touch event listeners
  		infoCanvas.addEventListener('touchstart', touchDown);
  		infoCanvas.addEventListener('touchmove', touchMove);
  		infoCanvas.addEventListener('touchend', touchUp);
  */
		// some extra setup

		// run it
		reset();
		resetRules();
		setPaused(false);
	}

	function Cell(x, y, t) {
		return { x: x, y: y, type: t };
	}

	function toKey(x, y) {
		return x + "," + y;
	}

	function reset() {}

	function resetRules() {
		CellTypes.black.rules = [{
			cells: {
				"0,-1": { type: "black", optional: true },
				"0,0": { type: "black", optional: false },
				"0,1": { type: "black", optional: true },
				"-1,-1": { type: "black", optional: true },
				"-1,0": { type: "black", optional: true },
				"-1,1": { type: "black", optional: true },
				"1,-1": { type: "black", optional: true },
				"1,0": { type: "black", optional: true },
				"1,1": { type: "black", optional: true }
			},
			optionalcount: [2, 3]
		}, {
			cells: {
				"0,-1": { type: "black", optional: true },
				"0,0": { type: "none", optional: false },
				"0,1": { type: "black", optional: true },
				"-1,-1": { type: "black", optional: true },
				"-1,0": { type: "black", optional: true },
				"-1,1": { type: "black", optional: true },
				"1,-1": { type: "black", optional: true },
				"1,0": { type: "black", optional: true },
				"1,1": { type: "black", optional: true }
			},
			optionalcount: [2]
		}];

		for (var i = 1; i < CellTypes.length; i++) {
			CellTypes[i].rules = [];
		}

		drawRules();
	}

	function drawRules() {
		var currx = 0,
		    curry = 0,
		    newx,
		    newy,
		    oldx,
		    oldy;
		var order = CellTypes.order;

		for (var i = 0; i < order.length; i++) {
			var type = CellTypes[order[i]];
			newx = (i + 1) * infoCanvas.drawWidth / order.length;
			newy = 20;

			infoContext.fillStyle = type.color;
			infoContext.fillRect(currx + 1, curry + 1, newx - 1, newy - 1);

			curry = newy + 1;

			var rules = type.rules;
			for (var j = 0; j < rules.length; j++) {
				var cellx = 0,
				    celly = 0,
				    cellw = newx - currx;

				for (var y = 0; y < 3; y++) {
					celly = (y + 1) * cellw / 3;

					for (var x = 0; x < 3; x++) {
						cellx = (x + 1) * cellw / 3;

						var cell = rules[j].cells[toKey(x - 1, y - 1)];
						if (cell !== undefined) {
							infoContext.fillStyle = CellTypes[cell.type].color;
							infoContext.fillRect(currx + cellx + 1, curry + celly + 1, currx, newy - 1);
						} else {}
					}
				}
			}
		}
	}

	function update() {
		// schedule another update
		if (!paused) setTimeout(update, options.delay);
	}

	function draw() {}

	function setPaused(p) {
		if (p && !paused) {
			paused = p;
			clearInterval(drawInterval);
		} else if (!p && paused) {
			paused = p;
			drawInterval = setInterval(draw, 15);
			update();
		}

		//inputs.pauseBtn.innerHTML = paused ? 'Resume' : 'Pause';
	}
};