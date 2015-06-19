window.onload = function() {
	var spiroCanvas = $('spiro-canvas');
	var infoCanvas = $('info-canvas');
	var spiroCtx = spiroCanvas.getContext('2d');
	var infoCtx = infoCanvas.getContext('2d');
	
	var circles = [
		{
			radius: 1,
			angle: 0,
			speed: 0
		},
		{
			radius: 0.5,
			angle: 0,
			speed: 1.0
		},
		{
			radius: 0.25,
			angle: 0,
			speed: 1.0 / Math.PI
		}
	];
	var paused = true;
	var runInterval;
	
	var options = {
		iterations: 100,
		speed: 5.0,
		penDist: 0,
		showCircles: true,
		showRadii: false,
		showPen: true,
		useColor: true
	};
	
	var inputs = {
		speedInput: $('speed-input'),
		iterInput: $('iter-input'),
		penDistInput: $('pendist-input'),
		sccheck: $('show-circles'),
		srcheck: $('show-radii'),
		spcheck: $('show-pen'),
		uccheck: $('use-color'),
		pauseBtn: $('pause-btn'),
		resetBtn: $('reset-btn'),
		circleDiv: $('circles'),
		saveBtn: $('save-btn'),
		saveImg: $('save-img'),
	};
	
	init();
	
	function init() {
		scaleCanvas(spiroCanvas, spiroCtx);
		scaleCanvas(infoCanvas, infoCtx);
	
		linkInputToNumber(inputs.speedInput, options, 'speed');
		linkInputToNumber(inputs.iterInput, options, 'iterations');
		linkInputToNumber(inputs.penDistInput, options, 'penDist', draw);
		
		linkCheckboxToBoolean(inputs.sccheck, options, 'showCircles', draw);
		linkCheckboxToBoolean(inputs.srcheck, options, 'showRadii', draw);
		linkCheckboxToBoolean(inputs.spcheck, options, 'showPen', draw);
		linkCheckboxToBoolean(inputs.uccheck, options, 'useColor');
		
		inputs.pauseBtn.addEventListener('click', function() {setPaused(!paused);});
		inputs.resetBtn.addEventListener('click', function() {reset();});
		inputs.saveBtn.addEventListener('click', function() {inputs.saveImg.src = spiroCanvas.toDataURL();});
		
		window.addEventListener('keydown', function(evt) {
			//console.log(evt.keyCode);
			switch (evt.keyCode) {
				case 32:
					setPaused(!paused);
					break;
				case 39:
					setSpeed(options.speed * 1.1);
					break;
				case 37:
					setSpeed(options.speed / 1.1);
					break;
				case 187:
					setIterations(options.iterations + 10);
					break;
				case 189:
					setIterations(options.iterations - 10);
					break;
				case 13:
					reset();
					break;
			}
		});
		
		buildCircleHTML();
		setPaused(false);
	}
	
	function eachCircle(eachCallback, doneCallback) {
		eachCallback = eachCallback || function() {};
		doneCallback = doneCallback || function() {};
		
		var unit = spiroCanvas.clientWidth / 2;
		var x = unit;
		var y = unit;
		var realangle = 0.0;
		var relangle = 0.0;
		var lastRadius = 1.0;
		var cir;
		
		for (var i=0; i < circles.length; i++) {
			cir = circles[i];
			
			relangle = realangle - cir.angle;
			realangle += ((lastRadius / cir.radius) - 1) * cir.angle;
			
			// center the first circle
			if (i > 0) {
				x += unit * (lastRadius - cir.radius) * Math.cos(relangle);
				y += unit * (lastRadius - cir.radius) * Math.sin(relangle);
			}
			
			// find the pen location on the last circle
			if (i == circles.length - 1) {
				cir.penx = x + cir.radius * unit * options.penDist * Math.cos(realangle);
				cir.peny = y + cir.radius * unit * options.penDist * Math.sin(realangle);
			}
			
			cir.x = x;
			cir.y = y;
			cir.realangle = realangle % (2 * Math.PI);
			cir.realradius = cir.radius * unit;
			
			eachCallback(cir);
			
			lastRadius = cir.radius;
		}
		
		doneCallback(circles[i-1]);
	}
	
	function draw() {
		infoCtx.clearRect(0, 0, infoCanvas.clientWidth, infoCanvas.clientHeight);
		
		if (options.showCircles || options.showRadii || options.showPen) {
			eachCircle(function(c) {
				if (options.showCircles) {
					infoCtx.strokeStyle = '#000000';
					infoCtx.beginPath();
					infoCtx.arc(c.x, c.y, Math.abs(c.realradius), 0, 2 * Math.PI);
					infoCtx.closePath();
					infoCtx.stroke();
				}
				
				if (options.showRadii) {
					infoCtx.strokeStyle = '#00FF00';
					infoCtx.beginPath();
					infoCtx.moveTo(c.x, c.y);
					infoCtx.lineTo(c.x + Math.cos(c.realangle)*c.realradius, c.y + Math.sin(c.realangle)*c.realradius);
					infoCtx.closePath();
					infoCtx.stroke();
				}
			}, function(c) {
				if(options.showPen) {
					infoCtx.fillStyle="#FF0000";
					infoCtx.beginPath();
					infoCtx.arc(c.penx, c.peny, 2, 0, 360);
					infoCtx.closePath();
					infoCtx.fill();
				}
			});
		}
	};
	
	var update = (function() {
		var oldx, oldy, newx, newy, radius, angle, idt;
		
		var position = function(c) {
			oldx = c.penx;
			oldy = c.peny;
		};
		
		var update = function(c) {
			c.angle += options.speed * c.speed * idt;
		};
		
		var calculate = function(c) {
			newx = c.penx;
			newy = c.peny;
			radius = c.realradius;
			angle = c.realangle;
		};
		
		return function(dt) {
			idt = dt / options.iterations;
			eachCircle(null, position);
			
			for (var i=0; i < options.iterations; i++) {
				circles.forEach(update);
				eachCircle(null, calculate); // calculate the new center point
				
				spiroCtx.strokeStyle = options.useColor ? getSaturatedColor(angle / (2 * Math.PI)) : "#000000";
				spiroCtx.beginPath();
				spiroCtx.moveTo(oldx, oldy);
				spiroCtx.lineTo(newx, newy);
				spiroCtx.closePath();
				spiroCtx.stroke();
				
				oldx = newx;
				oldy = newy;
			}
			
			draw();
		};
		
	})();
	
	function setSpeed(speed) {
		if (speed <= 0) return;
		
		options.speed = speed;
		inputs.speedInput.valueAsNumber = speed;
	};
	
	function setIterations(iterations) {
		if (iterations <= 0) return;
		
		options.iterations = iterations;
		inputs.iterInput.valueAsNumber = iterations;
	};
	
	function setPaused(p) {
		if (p && !paused) {
			clearInterval(runInterval);
		} else if (paused) {
			runInterval = setInterval(function() {
				update(0.015);
			}, 15);
		}
		
		paused = p;
		inputs.pauseBtn.innerHTML = p ? 'Resume' : 'Pause';
	}
	
	function reset() {
		circles.forEach(function(c) {c.angle = 0;});
		spiroCtx.clearRect(0, 0, spiroCanvas.clientWidth, spiroCanvas.clientHeight);
		draw();
	}
	
	function remCircle(c) {
		var index = circles.indexOf(c);
		circles.splice(index, 1);
		buildCircleHTML();
		draw();
	}
	
	function addCircle(index) {
		var newradius = index > 0 ? circles[index - 1].radius / 2 : 1;
		var newspeed = index > 0 ? (circles[index - 1].speed / 2) || 1 : 0;
		var newcircle = {
			radius: newradius,
			angle: 0,
			speed: newspeed
		};
	
		circles.splice(index, 0, newcircle);
		buildCircleHTML();
		draw();
	}
	
	function buildCircleHTML() {
		while (inputs.circleDiv.firstChild) {
			inputs.circleDiv.removeChild(inputs.circleDiv.firstChild);
		}
		
		var addbtn;
		
		for (var i=0; i < circles.length; i++) {
			var cir = circles[i];
			
			addbtn = document.createElement('button');
				addbtn.innerHTML = '+';
				addbtn.addEventListener('click', addCircle.bind(null, i));
				addbtn.style.width = '100%';
			
			if (!cir.div) {
				var newdiv = document.createElement('div');
				
				var titlediv = document.createElement('div');
					titlediv.innerHTML = 'Circle ' + i + ':';
					titlediv.style.textAlign = 'center';
				
				var radiusdiv = document.createElement('div');
					var radiusp = document.createElement('input');
						radiusp.setAttribute('type', 'number');
						radiusp.setAttribute('step', '0.05');
						radiusp.style.float = 'right';
						
						linkInputToNumber(radiusp, cir, "radius", draw);
					var br = document.createElement('br');
						br.style.clear = 'right';
					radiusdiv.innerHTML = 'Radius: ';
					radiusdiv.appendChild(radiusp);
					radiusdiv.appendChild(br);
				
				var speeddiv = document.createElement('div');
					var speedp = document.createElement('input');
						speedp.setAttribute('type', 'number');
						speedp.setAttribute('step', '0.01');
						speedp.style.float = 'right';
						
						linkInputToNumber(speedp, cir, "speed", draw);
					br = document.createElement('br');
						br.style.clear = 'right';
					speeddiv.innerHTML = 'Speed: ';
					speeddiv.appendChild(speedp);
					speeddiv.appendChild(br);
				
				var rembtn = document.createElement('button');
					rembtn.innerHTML = 'delete';
					rembtn.addEventListener('click', remCircle.bind(null, cir));
					rembtn.style.width = '100%';
				
				newdiv.appendChild(titlediv);
				newdiv.appendChild(radiusdiv);
				newdiv.appendChild(speeddiv);
				newdiv.appendChild(rembtn);
				newdiv.style.border = '2px solid black';
				newdiv.style.padding = '4px';
				newdiv.style.margin = '10px';
				
				cir.div = newdiv;
			} else {
				cir.div.getElementsByTagName('div')[0].innerHTML = 'Circle ' + i + ':';
			}
			
			inputs.circleDiv.appendChild(addbtn);
			inputs.circleDiv.appendChild(cir.div);
		}
		
		addbtn = document.createElement('button');
			addbtn.innerHTML = '+';
			addbtn.addEventListener('click', addCircle.bind(null, circles.length));
			addbtn.style.width = '100%';
		
		inputs.circleDiv.appendChild(addbtn);
	}
};