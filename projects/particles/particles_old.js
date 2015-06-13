function Particles(drawCanvas, traceCanvas) {
	this.drawCanvas = drawCanvas;
	this.traceCanvas = traceCanvas;
	this.drawContext = drawCanvas.getContext("2d");
	this.traceContext = traceCanvas.getContext("2d");
	this.particles = [];
	this.paused = true;
	
	this.options = {
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
	
	this.width = drawCanvas.clientWidth;
	this.height = drawCanvas.clientHeight;
	
	var mouseparticle = null;
	var newgroup = null;
	var groupvel = null;
	
	var self = this;
	
	function Particle(x, y, r, d, c, fixed) {
		this.x = x;
		this.y = y;
		this.radius = r;
		this.mass = r * r * Math.PI * d;
		this.color = c;
		this.fixed = fixed || false;
	}
	
	Particle.prototype.vx = 0;
	Particle.prototype.vy = 0;
	Particle.prototype.mx = 0;
	Particle.prototype.my = 0;
	
	Particle.prototype.update = function(time) {
		this.vx = this.mx + this.vx * (1 - self.options.decay);
		this.vy = this.my + this.vy * (1 - self.options.decay);
		
		if (self.options.bounce) {
			if ((this.x < this.radius && this.vx < 0) || (this.x > self.width - this.radius && this.vx > 0)) {
				this.vx = -this.vx;
			}
			if ((this.y < this.radius && this.vy < 0) || (this.y > self.height - this.radius && this.vy > 0)) {
				this.vy = -this.vy;
			}
		}
		
		if (!self.options.fixed) {
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

		var e = self.options.gravity * time / dsq;
		var rx = dx * e;
		var ry = dy * e;
		
		p.mx += rx * this.mass;
		p.my += ry * this.mass;
		
		this.mx -= rx * p.mass;
		this.my -= ry * p.mass;
	};
	
	this.addGroup = function(x, y) {
		this.particles = this.particles.concat(this.newGroup(x, y));
	};
	
	this.newGroup = function(x, y) {
		if (x === undefined) {
			x = Math.random() * this.width;
		}
		if (y === undefined) {
			y = Math.random() * this.height;
		}
		
		var color = randomColor();
		var group = [];
		
		for (var i=0; i < this.options.groupSize; i++) {
			var d = this.options.groupRadius*i/this.options.groupSize;
			var px = x + d*Math.cos(i); 
			var py = y + d*Math.sin(i);
			group[group.length] = new Particle(px, py, this.options.particleRadius, this.options.particleDensity, color, this.options.fixedParticles);
		}
		
		return group;
	};
	
	this.draw = function() {
		this.drawContext.clearRect(0, 0, this.drawCanvas.clientWidth, this.drawCanvas.clientHeight);
		
		if (!this.options.trace) {
			this.traceContext.clearRect(0, 0, this.traceCanvas.clientWidth, this.traceCanvas.clientHeight);
		}
		
		function drawParticle(ctx, p) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.radius, 0, 2*Math.PI);
			ctx.closePath();
			ctx.fillStyle = p.color;
			ctx.fill();
		}
		
		for (var i=0; i < this.particles.length; i++) {
			drawParticle(this.drawContext, this.particles[i]);
			
			if (this.options.trace) {
				this.drawContext.strokeStyle = "#000000";
				this.drawContext.stroke();
				
				drawParticle(this.traceContext, this.particles[i]);
			}
		}
		
		if (mouseparticle) {
			drawParticle(this.drawContext, mouseparticle);
		}
		
		if (newgroup) {
			for (var i=0; i < newgroup.length; i++) {
				drawParticle(this.drawContext, newgroup[i]);
			}
		}
		
		if (groupvel) {
			this.drawContext.beginPath();
			this.drawContext.moveTo(groupvel.ox, groupvel.oy);
			this.drawContext.lineTo(groupvel.ox + groupvel.x, groupvel.oy + groupvel.y);
			this.drawContext.closePath();
			this.drawContext.strokeStyle = "#00FF00";
			this.drawContext.stroke();
		}
	};
	
	this.update = function(time) {
		for (var i=0; i < this.particles.length; i++) {
			for (var j=i+1; j < this.particles.length; j++) {
				this.particles[i].attract(this.particles[j], time);
			}
			
			if (mouseparticle) {
				this.particles[i].attract(mouseparticle, time);
			}
			
			this.particles[i].update(time);
		}
		
		this.draw();
	};
	
	this.clear = function() {
		this.particles = [];
		this.draw();
	};
	
	this.clearTrace = function() {
		this.traceContext.clearRect(0, 0, this.traceCanvas.clientWidth, this.traceCanvas.clientHeight);
	};
	
	this.setPaused = function(paused) {
        if (paused && !this.paused) {
            clearInterval(this.runInterval);
        } else if (this.paused) {
            this.runInterval = setInterval(function() {
                self.update(0.015);
            }, 15);
        }
        
        this.paused = paused;
		this.inputs.pauseBtn.innerHTML = paused ? "Resume" : "Pause";
    };
	
	this.mouseDown = function(evt) {
		var mousepos = getRelativeCoord(self.drawCanvas, evt);
		
		if (evt.ctrlKey || evt.metaKey) {
			newgroup = self.newGroup(mousepos.x, mousepos.y);
			groupvel = {ox: mousepos.x, oy: mousepos.y, x: 0, y: 0};
		} else {
			mouseparticle = new Particle(mousepos.x, mousepos.y, 1, self.options.mouseDensity, "#FFFF00", false);
		}
		
		self.draw();
	};
	
	this.mouseUp = function(evt) {
		if (newgroup) {
			newgroup.forEach(function (p) {p.vx = groupvel.x; p.vy = groupvel.y;});
			groupvel = null;
			self.particles = self.particles.concat(newgroup);
			newgroup = null;
		}
		
		mouseparticle = null;
		self.draw();
	};
	
	this.mouseMove = function(evt) {
		var mousepos = getRelativeCoord(self.drawCanvas, evt);
		
		if (groupvel) {
			groupvel.x = mousepos.x - groupvel.ox;
			groupvel.y = mousepos.y - groupvel.oy;
		}
		
		if (mouseparticle) {
			mouseparticle.x = mousepos.x;
			mouseparticle.y = mousepos.y;
		}
		
		self.draw();
	};
	
	this.keyFunc = function(evt) {
		switch (evt.keyCode) {
			case 13:
				self.clear();
				break;
		}
	};
	
	this.init();
}

Particles.prototype.init = function() {
	var self = this;
	
	scaleCanvas(this.drawCanvas, this.drawContext);
	scaleCanvas(this.traceCanvas, this.traceContext);
	
	this.inputs = {
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
	
	this.inputs.bocheck.checked = this.options.bounce;
	this.inputs.trcheck.checked = this.options.trace;
	this.inputs.gravInput.value = this.options.gravity;
	this.inputs.decayInput.value = this.options.decay;
	this.inputs.groupSizeInput.value = this.options.groupSize;
	this.inputs.groupRadiusInput.value = this.options.groupRadius;
	this.inputs.mouseDensityInput.value = this.options.mouseDensity;
	this.inputs.particleRadiusInput.value = this.options.particleRadius;
	this.inputs.particleDensityInput.value = this.options.particleDensity;
	this.inputs.fpcheck.checked = this.options.fixedParticles;
	
	this.inputs.bocheck.addEventListener("click", function() {self.options.bounce = self.inputs.bocheck.checked;});
	this.inputs.trcheck.addEventListener("click", function() {self.options.trace = self.inputs.trcheck.checked;});
	this.inputs.gravInput.addEventListener("change", function() {self.options.gravity = self.inputs.gravInput.valueAsNumber;});
	this.inputs.decayInput.addEventListener("change", function() {self.options.decay = self.inputs.decayInput.valueAsNumber;});
	this.inputs.groupSizeInput.addEventListener("change", function() {self.options.groupSize = self.inputs.groupSizeInput.valueAsNumber;});
	this.inputs.groupRadiusInput.addEventListener("change", function() {self.options.groupRadius = self.inputs.groupRadiusInput.valueAsNumber;});
	this.inputs.mouseDensityInput.addEventListener("change", function() {self.options.mouseDensity = self.inputs.mouseDensityInput.valueAsNumber;});
	this.inputs.particleRadiusInput.addEventListener("change", function() {self.options.particleRadius = self.inputs.particleRadiusInput.valueAsNumber;});
	this.inputs.particleDensityInput.addEventListener("change", function() {self.options.particleDensity = self.inputs.particleDensityInput.valueAsNumber;});
	this.inputs.fpcheck.addEventListener("click", function() {self.options.fixedParticles = self.inputs.fpcheck.checked;});
	this.inputs.pauseBtn.addEventListener("click", function() {self.setPaused(!self.paused);});
	this.inputs.clearBtn.addEventListener("click", function() {self.clear();});
	this.inputs.clearTraceBtn.addEventListener("click", function() {self.clearTrace();});
	this.inputs.saveBtn.addEventListener("click", function() {self.inputs.saveImg.src = self.traceCanvas.toDataURL();});
	
	this.drawCanvas.addEventListener("mousedown", this.mouseDown);
	this.drawCanvas.addEventListener("touchstart", this.mouseDown);
	this.drawCanvas.addEventListener("mousemove", this.mouseMove);
	this.drawCanvas.addEventListener("touchmove", this.mouseMove);
	this.drawCanvas.addEventListener("mouseup", this.mouseUp);
	this.drawCanvas.addEventListener("touchend", this.mouseUp);
	this.drawCanvas.addEventListener("mouseleave", this.mouseUp);
	window.addEventListener("keydown", this.keyFunc);
};

window.onload = function() {
	var drawCanvas = document.getElementById("drawCanvas");
	var traceCanvas = document.getElementById("traceCanvas");
	
	var particles = new Particles(drawCanvas, traceCanvas);
	particles.addGroup(drawCanvas.clientWidth / 2, drawCanvas.clientHeight / 2);
	particles.setPaused(false);
};