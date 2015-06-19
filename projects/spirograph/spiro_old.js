function Spirograph() {
    var spiroCanvas = document.getElementById("spiroCanvas");
    var infoCanvas = document.getElementById("infoCanvas");
    this.spiroCtx = spiroCanvas.getContext("2d");
    this.infoCtx = infoCanvas.getContext("2d");
    
    scaleCanvas(spiroCanvas, this.spiroCtx);
    scaleCanvas(infoCanvas, this.infoCtx);
    
    this.circles = [
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
    this.iterations = 100;
    this.speed = 5.0;
    this.paused = true;
    
    var speedinput = document.getElementById("speedinput");
    var iterinput = document.getElementById("iterinput");
    var sccheck = document.getElementById("showcircles");
    var srcheck = document.getElementById("showradii");
    var uccheck = document.getElementById("usecolor");
    var pausebtn = document.getElementById("pausebtn");
    var resetbtn = document.getElementById("resetbtn");
    var circlediv = document.getElementById("circles");
    var saveBtn = document.getElementById("savebtn");
	var saveImg = document.getElementById("saveimg");
    
    var self = this;
    
    speedinput.value = this.speed;
    iterinput.value = this.iterations;
    
    pausebtn.addEventListener("click", function() {self.setPaused(!self.paused);});
    resetbtn.addEventListener("click", function() {self.reset();});
    speedinput.addEventListener("change", function() {self.updateSpeed();});
    iterinput.addEventListener("change", function() {self.updateIterations();});
    sccheck.addEventListener("click", function() {self.draw();});
    srcheck.addEventListener("click", function() {self.draw();});
    saveBtn.addEventListener("click", function() {saveImg.src = spiroCanvas.toDataURL();});
    
    function eachCircle(eachCallback, doneCallback) {
        var unit = spiroCanvas.clientWidth / 2;
        var x = unit;
        var y = unit;
        var realangle = 0.0;
        var relangle = 0.0;
        var lastRadius = 1.0;
        
        for (var i=0; i < self.circles.length; i++) {
            relangle = realangle - self.circles[i].angle;
            realangle += ((lastRadius / self.circles[i].radius) - 1) * self.circles[i].angle;
            
            // center the first circle
            if (i > 0) {
                x += unit * (lastRadius - self.circles[i].radius) * Math.cos(relangle);
                y += unit * (lastRadius - self.circles[i].radius) * Math.sin(relangle);
            }
            
            self.circles[i].x = x;
            self.circles[i].y = y;
            self.circles[i].realangle = realangle % (2 * Math.PI);
            self.circles[i].realradius = self.circles[i].radius * unit;
            
            if (eachCallback)
                eachCallback(self.circles[i]);
            
            lastRadius = self.circles[i].radius;
        }
        
        if (doneCallback)
            doneCallback(self.circles[i-1]);
    }
    
    function getColor(val) {
        if (!uccheck.checked) {
            return "#000000";
        }
        
        var i = Math.floor(val * 6);
        var f = ((val * 6 - i) + 1) % 1;
        var q = ("0" + Math.round(255 * (1 - f)).toString(16)).slice(-2);
        var t = ("0" + Math.round(255 * f).toString(16)).slice(-2);
        switch ((i + 6) % 6) {
            case 0: return "#FF" + t + "00";
            case 1: return "#" + q + "FF00";
            case 2: return "#00FF" + t;
            case 3: return "#00" + q + "FF";
            case 4: return "#" + t + "00FF";
            case 5: return "#FF00" + q;
        }
    }
    
    this.draw = function() {
        var ctx = this.infoCtx;
        
        ctx.clearRect(0, 0, infoCanvas.clientWidth, infoCanvas.clientHeight);
        
        if (sccheck.checked || srcheck.checked) {
            eachCircle(function(c) {
                if (sccheck.checked) {
                    ctx.strokeStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, Math.abs(c.realradius), 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.stroke();
                }
                
                if (srcheck.checked) {
                    ctx.strokeStyle = "#00FF00";
                    ctx.beginPath();
                    ctx.moveTo(c.x, c.y);
                    ctx.lineTo(c.x + Math.cos(c.realangle)*c.realradius, c.y + Math.sin(c.realangle)*c.realradius);
                    ctx.closePath();
                    ctx.stroke();
                }
            });
        }
    };
    
    this.update = function(dt) {
        var oldx, oldy, newx, newy, angle;
        
        eachCircle(null, function(c) {
            oldx = c.x;
            oldy = c.y;
        });
        
        var idt = dt / this.iterations;
        var upd = function(c) {
            c.angle += self.speed * c.speed * idt;
        };
        var calc = function(c) {
            newx = c.x;
            newy = c.y;
            angle = c.realangle;
        };
        for (var i=0; i < this.iterations; i++) {
            this.circles.forEach(upd);
            eachCircle(null, calc); // calculate the new center point
            
            this.spiroCtx.strokeStyle = getColor(angle / (2 * Math.PI));
            this.spiroCtx.beginPath();
            this.spiroCtx.moveTo(oldx, oldy);
            this.spiroCtx.lineTo(newx, newy);
            this.spiroCtx.closePath();
            this.spiroCtx.stroke();
            
            oldx = newx;
            oldy = newy;
        }
        
        this.draw();
    };
    
    this.setSpeed = function(speed) {
        if (speed <= 0)
            return;
        this.speed = speed;
        speedinput.value = speed;
    };
    
    this.updateSpeed = function() {
        this.speed = speedinput.valueAsNumber;
    };
    
    this.setIterations = function(iterations) {
        if (iterations <= 0)
            return;
        this.iterations = iterations;
        iterinput.value = iterations;
    };
    
    this.updateIterations = function() {
        this.iterations = iterinput.valueAsNumber;
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
        pausebtn.innerHTML = paused ? "Resume" : "Pause";
    };
    
    this.reset = function() {
        this.circles.forEach(function(c) {c.angle = 0;});
        this.spiroCtx.clearRect(0, 0, spiroCanvas.clientWidth, spiroCanvas.clientHeight);
        this.draw();
    };
    
    this.buildCircleHTML = function() {
        while (circlediv.firstChild) {
            circlediv.removeChild(circlediv.firstChild);
        }
        
        var changeRadiusFunc = function(c, el) {
            c.radius = el.valueAsNumber;
            this.draw();
        };
        
        var changeSpeedFunc = function(c, el) {
            c.speed = el.valueAsNumber;
            this.draw();
        };
        
        var remCircleFunc = function(c) {
            var index = this.circles.indexOf(c);
            this.circles.splice(index, 1);
            this.buildCircleHTML();
            this.draw();
        };
        
        var addCircleFunc = function(index) {
            var newradius = index > 0 ? this.circles[index - 1].radius / 2 : 1;
            var newspeed = index > 0 ? (this.circles[index - 1].speed / 2) || 1 : 0;
            var newcircle = {
                radius: newradius,
                angle: 0,
                speed: newspeed
            };
            this.circles.splice(index, 0, newcircle);
            this.buildCircleHTML();
            this.draw();
        };
        
        var addbtn;
        
        for (var i=0; i < this.circles.length; i++) {
            var cir = this.circles[i];
            
            addbtn = document.createElement("button");
                addbtn.innerHTML = "+";
                addbtn.addEventListener("click", addCircleFunc.bind(this, i));
                addbtn.style.width = "100%";
            
            if (!cir.div) {
                var newdiv = document.createElement("div");
                
                var titlediv = document.createElement("div");
                    titlediv.innerHTML = "Circle " + i + ":";
                    titlediv.style.textAlign = "center";
                
                var radiusdiv = document.createElement("div");
                    var radiusp = document.createElement("input");
                        radiusp.setAttribute("type", "number");
                        radiusp.setAttribute("step", "0.05");
                        radiusp.setAttribute("value", cir.radius);
                        radiusp.addEventListener("change", changeRadiusFunc.bind(this, cir, radiusp));
                        radiusp.style.float = "right";
                    var br = document.createElement("br");
                        br.style.clear = "right";
                    radiusdiv.innerHTML = "Radius: ";
                    radiusdiv.appendChild(radiusp);
                    radiusdiv.appendChild(br);
                
                var speeddiv = document.createElement("div");
                    var speedp = document.createElement("input");
                        speedp.setAttribute("type", "number");
                        speedp.setAttribute("step", "0.01");
                        speedp.setAttribute("value", cir.speed);
                        speedp.addEventListener("change", changeSpeedFunc.bind(this, cir, speedp));
                        speedp.style.float = "right";
                    br = document.createElement("br");
                        br.style.clear = "right";
                    speeddiv.innerHTML = "Speed: ";
                    speeddiv.appendChild(speedp);
                    speeddiv.appendChild(br);
                
                var rembtn = document.createElement("button");
                    rembtn.innerHTML = "delete";
                    rembtn.addEventListener("click", remCircleFunc.bind(this, cir));
                    rembtn.style.width = "100%";
                
                newdiv.appendChild(titlediv);
                newdiv.appendChild(radiusdiv);
                newdiv.appendChild(speeddiv);
                newdiv.appendChild(rembtn);
                newdiv.style.border = "2px solid black";
                newdiv.style.padding = "4px";
                newdiv.style.margin = "10px";
                
                cir.div = newdiv;
            } else {
                cir.div.getElementsByTagName('div')[0].innerHTML = "Circle " + i + ":";
            }
            
            circlediv.appendChild(addbtn);
            circlediv.appendChild(cir.div);
        }
        
        addbtn = document.createElement("button");
            addbtn.innerHTML = "+";
            addbtn.addEventListener("click", addCircleFunc.bind(this, this.circles.length));
            addbtn.style.width = "100%";
        
        circlediv.appendChild(addbtn);
    };
    
    this.buildCircleHTML();
    
    window.addEventListener("keydown", function(evt) {
        console.log(evt.keyCode);
        switch (evt.keyCode) {
            case 32:
                self.setPaused(!self.paused);
                break;
            case 39:
                self.setSpeed(self.speed * 1.1);
                break;
            case 37:
                self.setSpeed(self.speed / 1.1);
                break;
            case 187:
                self.setIterations(self.iterations + 10);
                break;
            case 189:
                self.setIterations(self.iterations - 10);
                break;
            case 13:
                self.reset();
                break;
        }
    });
}

window.onload = function() {
    var spiro = new Spirograph();
    spiro.setPaused(false);
};