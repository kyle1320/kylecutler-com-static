function getGL(canvas, attributes) {
	var gl = null;

	try {
		gl = canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
	} catch (e) {}

	if (!gl) {
		console.log("Couldn't get webGL");
	}

	return gl;
}

function getGLProgram(gl, vertSource, fragSource) {
	var program = null;
	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

	try {
		gl.shaderSource(vertShader, vertSource);
		gl.shaderSource(fragShader, fragSource);

		gl.compileShader(vertShader);
		gl.compileShader(fragShader);

		if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
			throw 'Could not compile vertex shader:\n\n' + gl.getShaderInfoLog(vertShader);
		}

		if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
			throw 'Could not compile fragment shader:\n\n' + gl.getShaderInfoLog(fragShader);
		}

		program = gl.createProgram();

		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);

		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			gl.deleteProgram(program);
			program = null;

			throw 'Could not compile program:\n\n' + gl.getProgramInfoLog(program);
		}
	} catch (e) {
		console.log(e);
	} finally {
		// we can (and should) delete the shaders
		// even if the shaders compiled and the program linked
		gl.deleteShader(vertShader);
		gl.deleteShader(fragShader);
	}

	return program;
}
