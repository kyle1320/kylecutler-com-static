'use strict';

window.onload = function () {
	var drawCanvas = $('draw-canvas');
	var gl = getGL(drawCanvas, { preserveDrawingBuffer: true });

	if (!gl) return;

	var paused = true;
	var buffer;
	var program;

	var startTime = new Date().getTime();

	var positionAttrib;
	var timeUniform;

	init();

	function init() {
		scaleCanvas(drawCanvas, gl);

		loadFiles(['shader.vert', 'shader.frag'], function (files) {
			program = getGLProgram(gl, files[0], files[1]);
			gl.useProgram(program);

			positionAttrib = gl.getAttribLocation(program, 'position');
			timeUniform = gl.getUniformLocation(program, 'time');

			setPaused(false);
		}, function (url) {
			console.log("Couldn't find file: " + url);
		});

		buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);

		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		$('save-btn').addEventListener('click', function () {
			$('save-img').src = drawCanvas.toDataURL('image/png');
		});
	}

	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.uniform1f(timeUniform, (new Date().getTime() - startTime) / 1000.0);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(positionAttrib);
		gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		if (!paused) {
			window.requestAnimFrame(render);
		}
	}

	function setPaused(p) {
		paused = p;

		if (!paused) {
			render();
		}
	}
};