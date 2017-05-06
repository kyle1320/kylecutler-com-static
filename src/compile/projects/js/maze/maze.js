window.onload = function() {
	var drawCanvas = $('draw-canvas');
	var drawContext = drawCanvas.getContext('2d');

	var paused = true;
	var drawInterval;

	var width, height;
	var img;

	var visited, edge, path, origin = {x: 0, y: 0};

	init();

	function init() {
		scaleCanvas(drawCanvas, drawContext);
		fitElement(drawCanvas);

		visited = new Set(); visited.add(origin);
		edge = getNeighbors(origin);
		path = new Set();

		reset();
		setPaused(false);
	}

	function reset() {
		width = drawCanvas.width;
		height = drawCanvas.height;
		img = drawContext.createImageData(width, height);

		drawContext.clearRect(0, 0, width, height);
	}

	function update() {
		if (edge) {
			var cell = random.choice(list(edge))
			var neighbors = getNeighbors(cell)
			var previous = random.choice(list(visited & neighbors))
			neighbors = neighbors - visited

			join(previous, cell)
			edge.discard(cell)
			visited.add(cell)

			/*while neighbors and random.random() > 0.05:
				previous, cell = cell, random.choice(list(neighbors))
				edge |= neighbors
				join(previous, cell)
				edge.discard(cell)
				visited.add(cell)
				neighbors = getNeighbors(cell) - visited*/
		}
	}

	function join(cellA, cellB) {
		path.add((cellA.x+cellB.x, cellA.y+cellB.y))
	}

	function getNeighbors(cell) {
		var neighbors = new Set()
		if (cell.x > 0)          neighbors.add({x:cell.x-1, y:cell.y})
		if (cell.x < width - 1)  neighbors.add({x:cell.x+1, y:cell.y})
		if (cell.y > 0)          neighbors.add({x:cell.x, y:cell.y-1})
		if (cell.y < height - 1) neighbors.add({x:cell.x, y:cell.y+1})
		return neighbors
	}

	function draw() {
		drawContext.putImageData(img, 0, 0);
	}

	function setPaused(p) {
		if (p && !paused) {
			paused = p;
			clearInterval(drawInterval);
		} else if (!p && paused) {
			paused = p;
			drawInterval = setInterval(draw, 50);
			update();
		}

		inputs.pauseBtn.innerHTML = paused ? 'Resume' : 'Pause';
	}

	function setSize(w, h) {
		drawCanvas.width = width = w;
		drawCanvas.height = height = h;
		reset();
	}
};