function Particles(canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.particles = [];
	this.paused = true;
	
	scaleCanvas(this.canvas, this.context);
	
	var width = canvas.clientWidth;
	var height = canvas.clientHeight;
	
	var mouseparticle = null;
	var newgroup = null;
	var groupvel = null;
	
	var bounce = true;
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
	
	bocheck.checked = bounce;
	gravInput.value = gravity;
	decayInput.value = decay;
	groupSizeInput.value = groupSize;
	groupRadiusInput.value = groupRadius;
	mouseDensityInput.value = mouseDensity;
	particleRadiusInput.value = particleRadius;
	particleDensityInput.value = particleDensity;
	fpcheck.checked = fixedParticles;
	
	bocheck.addEventListener("click", function() {bounce = bocheck.checked;});
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
		this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
		
		for (var i=0; i < this.particles.length; i++) {
			this.context.beginPath();
			this.context.arc(this.particles[i].x, this.particles[i].y, this.particles[i].radius, 0, 2*Math.PI);
			this.context.closePath();
			this.context.fillStyle = this.particles[i].color;
			this.context.fill();
		}
		
		if (mouseparticle) {
			this.context.beginPath();
			this.context.arc(mouseparticle.x, mouseparticle.y, mouseparticle.radius, 0, 2*Math.PI);
			this.context.closePath();
			this.context.fillStyle = mouseparticle.color;
			this.context.fill();
		}
		
		if (newgroup) {
			for (var i=0; i < newgroup.length; i++) {
				this.context.beginPath();
				this.context.arc(newgroup[i].x, newgroup[i].y, newgroup[i].radius, 0, 2*Math.PI);
				this.context.closePath();
				this.context.fillStyle = newgroup[i].color;
				this.context.fill();
			}
		}
		
		if (groupvel) {
			this.context.beginPath();
			this.context.moveTo(groupvel.ox, groupvel.oy);
			this.context.lineTo(groupvel.ox + groupvel.x, groupvel.oy + groupvel.y);
			this.context.closePath();
			this.context.strokeStyle = "#00FF00";
			this.context.stroke();
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
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };
	
	this.clear = function() {
		this.particles = [];
		this.draw();
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
	
	canvas.addEventListener("mousedown", mouseDown);
	canvas.addEventListener("mousemove", mouseMove);
	canvas.addEventListener("mouseup", mouseUp);
	canvas.addEventListener("mouseleave", mouseUp);
	window.addEventListener("keydown", keyFunc);
}

function randomColor() {
    return '#'+('00000'+(Math.floor(Math.random()*16777216)).toString(16)).slice(-6);
}

function scaleCanvas(canvas, context) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;

    var scale = devicePixelRatio / backingStoreRatio;

    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
    canvas.width *= scale;
    canvas.height *= scale;
    context.scale(scale, scale);
}

var particles;
window.onload = function() {
	var canvas = document.getElementById("drawCanvas");
	
	particles = new Particles(canvas);
	particles.addGroup(canvas.clientWidth / 2, canvas.clientHeight / 2);
	particles.setPaused(false);
};