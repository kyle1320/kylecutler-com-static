function Cloth(canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.points = [];
	this.paused = true;
	
	scaleCanvas(this.canvas, this.context);
	
	var width = canvas.clientWidth;
	var height = canvas.clientHeight;
	
	var cl = this;
	
	var gravity = 400.0;
	var correction = 1.0;
	var dampen = 0.01;
	var iterations = 3;
	var interactiondist = 20;
	var interactionforce = 2000;
	var padding = 50;
	
	var mouse = null;
	var mousemov = null;
	
	var pauseBtn = document.getElementById("pause");
	var resetBtn = document.getElementById("reset");
	
	pauseBtn.addEventListener("click", function() {cl.setPaused(!cl.paused);});
	resetBtn.addEventListener("click", function() {cl.reset();});
	
	function Point(x, y, pinned, px, py) {
		this.x = x;
		this.y = y;
		this.lx = x;
		this.ly = y;
		this.ax = 0;
		this.ay = 0;
		
		this.pinned = pinned || false;
		this.px = px === undefined ? x : px;
		this.py = py === undefined ? y : py;
		
		this.links = [];
		
		this.update = function(time) {
			this.interaction();
			this.applyForce(0, gravity);
			
			var mx = (this.x - this.lx) * (1.0 - dampen);
			var my = (this.y - this.ly) * (1.0 - dampen);
			
			this.lx = this.x;
			this.ly = this.y;
			
			this.x += mx + 0.5 * this.ax * time * time;
			this.y += my + 0.5 * this.ay * time * time;
			
			this.ax = 0;
			this.ay = 0;
		};
		
		this.applyForce = function(fx, fy) {
			this.ax += fx;
			this.ay += fy;
		};
		
		this.interaction = function() {
			if (mouse && mousemov) {
				var dx = mouse.x - this.x;
				var dy = mouse.y - this.y;
				var dist = Math.sqrt(dx*dx + dy*dy);

				if (dist < interactiondist) {
					this.applyForce(mousemov.x*interactionforce, mousemov.y*interactionforce);
				}
			}
		};
		
		this.constraints = function() {
			for (var i=0; i < this.links.length; i++) {
				this.links[i].solve();
				if (this.links[i].broken) {
					this.links.splice(i, 1);
				}
			}

			if (this.x < padding) {
				this.x = padding;
			}
			if (this.x > width - padding) {
				this.x = width - padding;
			}
			if (this.y < padding) {
				this.y = padding;
			}
			if (this.y > height - padding) {
				this.y = height - padding;
			}

			if (pinned) {
				this.x = this.px;
				this.y = this.py;
			}
		};
		
		this.attachTo = function(p, restingDist, strength) {
			this.links[this.links.length] = new Link(this, p, restingDist, strength);
		};
	}
	
	function Link(a, b, restingDist, strength) {
		if (restingDist === undefined) {
			var dx = a.x - b.x;
			var dy = a.y - b.y;
			restingDist = Math.sqrt(dx*dx + dy*dy);
		}
		
		if (strength === undefined) {
			strength = 1;
		}
		
		this.a = a;
		this.b = b;
		this.restingDist = restingDist;
		this.tearDist = restingDist * (strength + 1);
		this.broken = false;
		
		this.solve = function() {
			var dx = this.a.x - this.b.x;
			var dy = this.a.y - this.b.y;
			var d = Math.sqrt(dx*dx + dy*dy);

			var difference = (this.restingDist - d) / d;

			//pull = (d - restingDist) / (tearDist - restingDist);

			if (d > this.tearDist) 
				this.broken = true;

			var tx = dx * correction/2.0 * difference;
			var ty = dy * correction/2.0 * difference;
			
			a.x += tx;
			a.y += ty;
			
			b.x -= tx;
			b.y -= ty;
		};
	}
	
	this.setPaused = function(paused) {
        if (paused && !this.paused) {
            clearInterval(this.runInterval);
        } else if (this.paused) {
            this.runInterval = setInterval(function() {
                cl.update(0.015);
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
	
	this.draw = function() {
		this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
		
		for (var i=0; i < this.points.length; i++) {
			for (var j=0; j < this.points[i].links.length; j++) {
				this.context.beginPath();
				this.context.moveTo(this.points[i].links[j].a.x, this.points[i].links[j].a.y);
				this.context.lineTo(this.points[i].links[j].b.x, this.points[i].links[j].b.y);
				this.context.closePath();
				this.context.strokeStyle = "#000000";
				this.context.stroke();
			}
			
			this.context.beginPath();
			this.context.arc(this.points[i].x, this.points[i].y, 2, 0, 2 * Math.PI);
			this.context.closePath();
			this.context.fillStyle = "#000000";
			this.context.fill();
		}
		
		if (mouse) {
			this.context.globalAlpha = 0.2;
			this.context.beginPath();
			this.context.arc(mouse.x, mouse.y, interactiondist, 0, 2 * Math.PI);
			this.context.closePath();
			this.context.fillStyle = "#0000FF";
			this.context.fill();
			this.context.globalAlpha = 1.0;
		}
	};
	
	this.update = function(time) {
		for (var i=0; i < iterations; i++) {
			for (var j=0; j < this.points.length; j++) {
				this.points[j].constraints();
			}
		}
		
		this.points.forEach(function (p) {p.update(time);});
		this.draw();
	};
	
	this.reset = function() {
		this.points = [];
		this.initializePoints();
	};
	
	this.initializePoints = function() {
		var width = 40;
		var height = 40;
		var stepx = 8;
		var stepy = 8;
		
		var i=0;
		for (var y=0; y < height; y++) {
			for (var x=0; x < width; x++) {
				this.points[i] = new Point(x * stepx + padding, y * stepy + padding, y == 0);
				if (x > 0) this.points[i].attachTo(this.points[i-1]);
				if (y > 0) this.points[i].attachTo(this.points[i-width]);
				//if (x > 0 && y > 0) this.points[i].attachTo(this.points[i-width-1]);
				//if (x < width - 1 && y > 0) this.points[i].attachTo(this.points[i-width+1]);
				i++;
			}
		}
	};
	
	this.initializePoints();
	
	canvas.addEventListener("mousedown", function(e) {
		var newmouse = cl.getRelativeCoord(e);
		if (mouse) mousemov = {x: newmouse.x - mouse.x, y: newmouse.y - mouse.y};
		mouse = newmouse;
	});
	canvas.addEventListener("mousemove", function(e) {
		if (mouse) {
			var newmouse = cl.getRelativeCoord(e);
			mousemov = {x: newmouse.x - mouse.x, y: newmouse.y - mouse.y};
			mouse = newmouse;
		}
	});
	canvas.addEventListener("mouseup", function(e) {mouse = mousemov = null;});
	canvas.addEventListener("mouseleave", function(e) {mouse = mousemov = null;});
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

var cloth;
window.onload = function() {
	var canvas = document.getElementById("drawCanvas");
	
	cloth = new Cloth(canvas);
	cloth.setPaused(false);
};