window.onload = function() {
	var drawCanvas = document.getElementById("drawCanvas");
	var traceCanvas = document.getElementById("traceCanvas");
	var drawContext = drawCanvas.getContext("2d");
	var traceContext = traceCanvas.getContext("2d");
	
	var particles = [];
	var paused = true;
	var runInterval;
	
	var options = {
		bounce: true,
		trace: true,
		gravity: 20.0,
		decay: 0,
		groupSize: 40,
		groupRadius: 8,
		mouseDensity: 50,
		particleRadius: 1,
		particleDensity: 1,
		fixedParticles: false
	};
	
	var inputs = {
		bocheck: document.getElementById("bounce"),
		trcheck: document.getElementById("trace"),
		gravInput: document.getElementById("gravity"),
		decayInput: document.getElementById("decay"),
		groupSizeInput: document.getElementById("groupsize"),
		groupRadiusInput: document.getElementById("groupradius"),
		mouseDensityInput: document.getElementById("mousedensity"),
		particleRadiusInput: document.getElementById("particleradius"),
		particleDensityInput: document.getElementById("particledensity"),
		fpcheck: document.getElementById("fixedparticles"),
		clearBtn: document.getElementById("clear"),
		pauseBtn: document.getElementById("pause"),
		clearTraceBtn: document.getElementById("cleartrace"),
		saveBtn: document.getElementById("savebtn"),
		saveImg: document.getElementById("saveimg")
	};
	
	var width = drawCanvas.clientWidth;
	var height = drawCanvas.clientHeight;
	
	var mouseparticle = null;
	var newgroup = null;
	var groupvel = null;
	
	init();
	
	function init() {
		scaleCanvas(drawCanvas, drawContext);
		scaleCanvas(traceCanvas, traceContext);
		
		inputs.bocheck.checked = options.bounce;
		inputs.trcheck.checked = options.trace;
		inputs.gravInput.valueAsNumber = options.gravity;
		inputs.decayInput.valueAsNumber = options.decay;
		inputs.groupSizeInput.valueAsNumber = options.groupSize;
		inputs.groupRadiusInput.valueAsNumber = options.groupRadius;
		inputs.mouseDensityInput.valueAsNumber = options.mouseDensity;
		inputs.particleRadiusInput.valueAsNumber = options.particleRadius;
		inputs.particleDensityInput.valueAsNumber = options.particleDensity;
		inputs.fpcheck.checked = options.fixedParticles;
		
		inputs.bocheck.addEventListener("click", function() {options.bounce = inputs.bocheck.checked;});
		inputs.trcheck.addEventListener("click", function() {options.trace = inputs.trcheck.checked;});
		inputs.gravInput.addEventListener("change", function() {options.gravity = inputs.gravInput.valueAsNumber || 0;});
		inputs.decayInput.addEventListener("change", function() {options.decay = inputs.decayInput.valueAsNumber || 0;});
		inputs.groupSizeInput.addEventListener("change", function() {options.groupSize = inputs.groupSizeInput.valueAsNumber || 0;});
		inputs.groupRadiusInput.addEventListener("change", function() {options.groupRadius = inputs.groupRadiusInput.valueAsNumber || 0;});
		inputs.mouseDensityInput.addEventListener("change", function() {options.mouseDensity = inputs.mouseDensityInput.valueAsNumber || 0;});
		inputs.particleRadiusInput.addEventListener("change", function() {options.particleRadius = inputs.particleRadiusInput.valueAsNumber || 0;});
		inputs.particleDensityInput.addEventListener("change", function() {options.particleDensity = inputs.particleDensityInput.valueAsNumber || 0;});
		inputs.fpcheck.addEventListener("click", function() {options.fixedParticles = inputs.fpcheck.checked;});
		inputs.pauseBtn.addEventListener("click", function() {setPaused(!paused);});
		inputs.clearBtn.addEventListener("click", function() {clear();});
		inputs.clearTraceBtn.addEventListener("click", function() {clearTrace();});
		inputs.saveBtn.addEventListener("click", function() {inputs.saveImg.src = traceCanvas.toDataURL();});
		
		drawCanvas.addEventListener("mousedown", mouseDown);
		drawCanvas.addEventListener("touchstart", mouseDown);
		drawCanvas.addEventListener("mousemove", mouseMove);
		drawCanvas.addEventListener("touchmove", mouseMove);
		drawCanvas.addEventListener("mouseup", mouseUp);
		drawCanvas.addEventListener("touchend", mouseUp);
		drawCanvas.addEventListener("mouseleave", mouseUp);
		window.addEventListener("keydown", keyFunc);
		
		addGroup(drawCanvas.clientWidth / 2, drawCanvas.clientHeight / 2);
		setPaused(false);
	}
	
	function Particle(x, y, r, d, c, trace, fixed) {
		this.x = x;
		this.y = y;
		this.radius = r;
		this.mass = r * r * Math.PI * d;
		this.color = c;
		this.trace = trace || false;
		this.fixed = fixed || false;
	}
	
	Particle.prototype.vx = 0;
	Particle.prototype.vy = 0;
	Particle.prototype.mx = 0;
	Particle.prototype.my = 0;
	
	Particle.prototype.update = function(time) {
		this.vx = this.mx + this.vx * (1 - options.decay);
		this.vy = this.my + this.vy * (1 - options.decay);
		
		if (options.bounce) {
			if ((this.x < this.radius && this.vx < 0) || (this.x > width - this.radius && this.vx > 0)) {
				this.vx = -this.vx;
			}
			if ((this.y < this.radius && this.vy < 0) || (this.y > height - this.radius && this.vy > 0)) {
				this.vy = -this.vy;
			}
		}
		
		if (!options.fixed) {
			this.x += this.vx*time;
			this.y += this.vy*time;
		}
		
		if (this.mass === 0) {
			console.log(Math.sqrt(this.mx*this.mx + this.my*this.my));
		}
		
		this.mx = 0;
		this.my = 0;
	};
	
	Particle.prototype.attract = function(p, time) {
		var dx = this.x - p.x;
		var dy = this.y - p.y;
		var dsq = dx*dx + dy*dy;
		if (dsq === 0) return;

		var dr = this.radius + p.radius;
		var drsq = dr*dr;
		if (dsq <= drsq) dsq = drsq;

		var e = options.gravity * time / dsq;
		var rx = dx * e;
		var ry = dy * e;
		
		p.mx += rx * this.mass;
		p.my += ry * this.mass;
		
		this.mx -= rx * p.mass;
		this.my -= ry * p.mass;
	};
	
	function addGroup(x, y) {
		particles = particles.concat(newGroup(x, y));
	}
	
	function newGroup(x, y) {
		if (x === undefined) {
			x = Math.random() * width;
		}
		if (y === undefined) {
			y = Math.random() * height;
		}
		
		var color = randomColor();
		var group = [];
		
		for (var i=0; i < options.groupSize; i++) {
			var d = options.groupRadius*i/options.groupSize;
			var px = x + d*Math.cos(i); 
			var py = y + d*Math.sin(i);
			group[group.length] = new Particle(px, py, options.particleRadius, options.particleDensity, color, options.trace, options.fixedParticles);
		}
		
		return group;
	}
	
	function draw() {
		drawContext.clearRect(0, 0, drawCanvas.clientWidth, drawCanvas.clientHeight);
		
		function drawParticle(ctx, p) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.radius, 0, 2*Math.PI);
			ctx.closePath();
			ctx.fillStyle = p.color;
			ctx.fill();
		}
		
		for (var i=0; i < particles.length; i++) {
			drawParticle(drawContext, particles[i]);
			drawContext.strokeStyle = "#000000";
			drawContext.lineWidth = 0.5;
			drawContext.stroke();
			
			if (particles[i].trace) {
				drawParticle(traceContext, particles[i]);
			}
		}
		
		if (mouseparticle) {
			drawParticle(drawContext, mouseparticle);
		}
		
		if (newgroup) {
			for (var i=0; i < newgroup.length; i++) {
				drawParticle(drawContext, newgroup[i]);
			}
		}
		
		if (groupvel) {
			drawContext.beginPath();
			drawContext.moveTo(groupvel.ox, groupvel.oy);
			drawContext.lineTo(groupvel.ox + groupvel.x, groupvel.oy + groupvel.y);
			drawContext.closePath();
			drawContext.strokeStyle = "#00FF00";
			drawContext.stroke();
		}
	}
	
	function update(time) {
		for (var i=0; i < particles.length; i++) {
			for (var j=i+1; j < particles.length; j++) {
				particles[i].attract(particles[j], time);
			}
			
			if (mouseparticle) {
				particles[i].attract(mouseparticle, time);
			}
			
			particles[i].update(time);
		}
		
		draw();
	}
	
	function clear() {
		particles = [];
		draw();
	}
	
	function clearTrace() {
		traceContext.clearRect(0, 0, traceCanvas.clientWidth, traceCanvas.clientHeight);
	}
	
	function setPaused(p) {
        if (p && !paused) {
            clearInterval(runInterval);
        } else if (paused) {
            runInterval = setInterval(function() {
                update(0.015);
            }, 15);
        }
        
        paused = p;
		inputs.pauseBtn.innerHTML = p ? "Resume" : "Pause";
    }
	
	function mouseDown(evt) {
		var mousepos = getRelativeCoord(drawCanvas, evt);
		
		if (evt.ctrlKey || evt.metaKey) {
			newgroup = newGroup(mousepos.x, mousepos.y);
			groupvel = {ox: mousepos.x, oy: mousepos.y, x: 0, y: 0}
		} else {
			mouseparticle = new Particle(mousepos.x, mousepos.y, 1, options.mouseDensity, "#FFFF00", false, false);
		}
		
		draw();
	}
	
	function mouseUp(evt) {
		if (newgroup) {
			newgroup.forEach(function (p) {p.vx = groupvel.x; p.vy = groupvel.y;});
			groupvel = null;
			particles = particles.concat(newgroup);
			newgroup = null;
		}
		
		mouseparticle = null;
		draw();
	}
	
	function mouseMove(evt) {
		var mousepos = getRelativeCoord(drawCanvas, evt);
		
		if (groupvel) {
			groupvel.x = mousepos.x - groupvel.ox;
			groupvel.y = mousepos.y - groupvel.oy;
		}
		
		if (mouseparticle) {
			mouseparticle.x = mousepos.x;
			mouseparticle.y = mousepos.y;
		}
		
		draw();
	}
	
	function keyFunc(evt) {
		switch (evt.keyCode) {
			case 13:
				clear();
				break;
		}
	}
};