function Particles(drawCanvas, traceCanvas) {
	this.drawCanvas = drawCanvas;
	this.traceCanvas = traceCanvas;
	this.drawContext = drawCanvas.getContext("2d");
	this.traceContext = traceCanvas.getContext("2d");
	this.particles = [];
	this.paused = true;
	
	scaleCanvas(this.drawCanvas, this.drawContext);
	scaleCanvas(this.traceCanvas, this.traceContext);
	
	var width = drawCanvas.clientWidth;
	var height = drawCanvas.clientHeight;
	
	var mouseparticle = null;
	var newgroup = null;
	var groupvel = null;
	
	var bounce = true;
	var trace = true;
	var gravity = 20.0;
	var decay = 0;
	var groupSize = 40;
	var groupRadius = 8;
	var mouseDensity = 50;
	var particleRadius = 1;
	var particleDensity = 1;
	var fixedParticles = false;
	
	var pa = this;
	
	var bocheck = document.getElementById("bounce");
	var trcheck = document.getElementById("trace");
	var gravInput = document.getElementById("gravity");
	var decayInput = document.getElementById("decay");
	var groupSizeInput = document.getElementById("groupsize");
	var groupRadiusInput = document.getElementById("groupradius");
	var mouseDensityInput = document.getElementById("mousedensity");
	var particleRadiusInput = document.getElementById("particleradius");
	var particleDensityInput = document.getElementById("particledensity");
	var fpcheck = document.getElementById("fixedparticles");
	var clearBtn = document.getElementById("clear");
	var pauseBtn = document.getElementById("pause");
	var clearTraceBtn = document.getElementById("cleartrace");
	
	bocheck.checked = bounce;
	trcheck.checked = trace;
	gravInput.value = gravity;
	decayInput.value = decay;
	groupSizeInput.value = groupSize;
	groupRadiusInput.value = groupRadius;
	mouseDensityInput.value = mouseDensity;
	particleRadiusInput.value = particleRadius;
	particleDensityInput.value = particleDensity;
	fpcheck.checked = fixedParticles;
	
	bocheck.addEventListener("click", function() {bounce = bocheck.checked;});
	trcheck.addEventListener("click", function() {trace = trcheck.checked;});
	gravInput.addEventListener("change", function() {gravity = gravInput.valueAsNumber;});
	decayInput.addEventListener("change", function() {decay = decayInput.valueAsNumber;});
	groupSizeInput.addEventListener("change", function() {groupSize = groupSizeInput.valueAsNumber;});
	groupRadiusInput.addEventListener("change", function() {groupRadius = groupRadiusInput.valueAsNumber;});
	mouseDensityInput.addEventListener("change", function() {mouseDensity = mouseDensityInput.valueAsNumber;});
	particleRadiusInput.addEventListener("change", function() {particleRadius = particleRadiusInput.valueAsNumber;});
	particleDensityInput.addEventListener("change", function() {particleDensity = particleDensityInput.valueAsNumber;});
	fpcheck.addEventListener("click", function() {fixedParticles = fpcheck.checked;});
	pauseBtn.addEventListener("click", function() {pa.setPaused(!pa.paused);});
	clearBtn.addEventListener("click", function() {pa.clear();});
	clearTraceBtn.addEventListener("click", function() {pa.clearTrace();});
	
	function Particle(x, y, r, d, c, fixed) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.mx = 0;
		this.my = 0;
		this.radius = r;
		this.mass = r * r * Math.PI * d;
		this.color = c;
		this.fixed = fixed || false;
		
		this.update = function(time) {
			this.vx = this.mx + this.vx * (1 - decay);
			this.vy = this.my + this.vy * (1 - decay);
			
			if (bounce) {
				if ((this.x < this.radius && this.vx < 0) || (this.x > width - this.radius && this.vx > 0)) {
					this.vx = -this.vx;
				}
				if ((this.y < this.radius && this.vy < 0) || (this.y > height - this.radius && this.vy > 0)) {
					this.vy = -this.vy;
				}
			}
			
			if (!fixed) {
				this.x += this.vx*time;
				this.y += this.vy*time;
			}
			
			if (this.mass == 0) {
				console.log(Math.sqrt(this.mx*this.mx + this.my*this.my));
			}
			
			this.mx = 0;
			this.my = 0;
		};
		
		this.attract = function(p, time) {
			var dx = this.x - p.x;
			var dy = this.y - p.y;
			var dsq = dx*dx + dy*dy;
			if (dsq == 0) return;

			var dr = this.radius + p.radius;
			var drsq = dr*dr;
			if (dsq <= drsq) dsq = drsq;

			var e = gravity * time / dsq;
			var rx = dx * e;
			var ry = dy * e;
			
			p.mx += rx * this.mass;
			p.my += ry * this.mass;
			
			this.mx -= rx * p.mass;
			this.my -= ry * p.mass;
		};
	}
	
	this.addGroup = function(x, y) {
		this.particles = this.particles.concat(this.newGroup(x, y));
	}
	
	this.newGroup = function(x, y) {
		if (x === undefined) {
			x = Math.random() * width;
		}
		if (y === undefined) {
			y = Math.random() * height;
		}
		
		var color = randomColor();
		var group = [];
		
		for (var i=0; i < groupSize; i++) {
			var d = groupRadius*i/groupSize;
			var px = x + d*Math.cos(i); 
			var py = y + d*Math.sin(i);
			group[group.length] = new Particle(px, py, particleRadius, particleDensity, color, fixedParticles);
		}
		
		return group;
	};
	
	this.draw = function() {
		this.drawContext.clearRect(0, 0, this.drawCanvas.clientWidth, this.drawCanvas.clientHeight);
		
		if (!trace) {
			this.traceContext.clearRect(0, 0, this.traceCanvas.clientWidth, this.traceCanvas.clientHeight);
		}
		
		for (var i=0; i < this.particles.length; i++) {
			this.drawContext.beginPath();
			this.drawContext.arc(this.particles[i].x, this.particles[i].y, this.particles[i].radius, 0, 2*Math.PI);
			this.drawContext.closePath();
			this.drawContext.fillStyle = this.particles[i].color;
			this.drawContext.fill();
			
			if (trace) {
				this.drawContext.strokeStyle = "#000000";
				this.drawContext.stroke();
				this.traceContext.beginPath();
				this.traceContext.arc(this.particles[i].x, this.particles[i].y, this.particles[i].radius, 0, 2*Math.PI);
				this.traceContext.closePath();
				this.traceContext.fillStyle = this.particles[i].color;
				this.traceContext.fill();
			}
		}
		
		if (mouseparticle) {
			this.drawContext.beginPath();
			this.drawContext.arc(mouseparticle.x, mouseparticle.y, mouseparticle.radius, 0, 2*Math.PI);
			this.drawContext.closePath();
			this.drawContext.fillStyle = mouseparticle.color;
			this.drawContext.fill();
		}
		
		if (newgroup) {
			for (var i=0; i < newgroup.length; i++) {
				this.drawContext.beginPath();
				this.drawContext.arc(newgroup[i].x, newgroup[i].y, newgroup[i].radius, 0, 2*Math.PI);
				this.drawContext.closePath();
				this.drawContext.fillStyle = newgroup[i].color;
				this.drawContext.fill();
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
	
	this.setPaused = function(paused) {
        if (paused && !this.paused) {
            clearInterval(this.runInterval);
        } else if (this.paused) {
            this.runInterval = setInterval(function() {
                pa.update(0.015);
            }, 15);
        }
        
        this.paused = paused;
		pauseBtn.innerHTML = paused ? "Resume" : "Pause";
    };
	
	this.getRelativeCoord = function(evt) {
        var rect = drawCanvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };
	
	this.clear = function() {
		this.particles = [];
		this.draw();
	};
	
	this.clearTrace = function() {
		this.traceContext.clearRect(0, 0, this.traceCanvas.clientWidth, this.traceCanvas.clientHeight);
	};
	
	var mouseDown = function(evt) {
		var mousepos = pa.getRelativeCoord(evt);
		
		if (evt.ctrlKey || evt.metaKey) {
			newgroup = pa.newGroup(mousepos.x, mousepos.y);
			groupvel = {ox: mousepos.x, oy: mousepos.y, x: 0, y: 0};
		} else {
			mouseparticle = new Particle(mousepos.x, mousepos.y, 1, mouseDensity, "#FFFF00", false);
		}
		
		pa.draw();
	};
	
	var mouseUp = function(evt) {
		if (newgroup) {
			newgroup.forEach(function (p) {p.vx = groupvel.x; p.vy = groupvel.y;});
			groupvel = null;
			pa.particles = pa.particles.concat(newgroup);
			newgroup = null;
		}
		
		mouseparticle = null;
		pa.draw();
	};
	
	var mouseMove = function(evt) {
		var mousepos = pa.getRelativeCoord(evt);
		
		if (groupvel) {
			groupvel.x = mousepos.x - groupvel.ox;
			groupvel.y = mousepos.y - groupvel.oy;
		}
		
		if (mouseparticle) {
			mouseparticle.x = mousepos.x;
			mouseparticle.y = mousepos.y;
		}
		
		pa.draw();
	};
	
	var keyFunc = function(evt) {
		switch (evt.keyCode) {
			case 13:
				pa.clear();
				break;
		}
	};
	
	drawCanvas.addEventListener("mousedown", mouseDown);
	drawCanvas.addEventListener("touchstart", mouseDown);
	drawCanvas.addEventListener("mousemove", mouseMove);
	drawCanvas.addEventListener("touchmove", mouseMove);
	drawCanvas.addEventListener("mouseup", mouseUp);
	drawCanvas.addEventListener("touchend", mouseUp);
	drawCanvas.addEventListener("mouseleave", mouseUp);
	window.addEventListener("keydown", keyFunc);
}

function randomColor() {
    return '#'+('00000'+(Math.floor(Math.random()*16777216)).toString(16)).slice(-6);
}

function scaleCanvas(drawCanvas, drawContext) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = drawContext.webkitBackingStorePixelRatio ||
        drawContext.mozBackingStorePixelRatio ||
        drawContext.msBackingStorePixelRatio ||
        drawContext.oBackingStorePixelRatio ||
        drawContext.backingStorePixelRatio || 1;

    var scale = devicePixelRatio / backingStoreRatio;

    drawCanvas.style.width = drawCanvas.width + "px";
    drawCanvas.style.height = drawCanvas.height + "px";
    drawCanvas.width *= scale;
    drawCanvas.height *= scale;
    drawContext.scale(scale, scale);
}

var particles;
window.onload = function() {
	var drawCanvas = document.getElementById("drawCanvas");
	var traceCanvas = document.getElementById("traceCanvas");
	
	particles = new Particles(drawCanvas, traceCanvas);
	particles.addGroup(drawCanvas.clientWidth / 2, drawCanvas.clientHeight / 2);
	particles.setPaused(false);
};