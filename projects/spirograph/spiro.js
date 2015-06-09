function Spirograph(spiroCanvas, infoCanvas) {
    this.spiroCanvas = spiroCanvas;
    this.infoCanvas = infoCanvas;
    this.spiroCtx = spiroCanvas.getContext("2d");
    this.infoCtx = infoCanvas.getContext("2d");
    
    scaleCanvas(spiroCanvas, this.spiroCtx);
    scaleCanvas(infoCanvas, this.infoCtx);
    
    this.circles = [
        {
            x: 0,
            y: 0,
            realangle: 0,
            realradius: 0,
            radius: 1,
            angle: 0,
            speed: 0
        },
        {
            x: 0,
            y: 0,
            realangle: 0,
            realradius: 0,
            radius: 0.5,
            angle: 0,
            speed: 1.0
        },
        {
            x: 0,
            y: 0,
            realangle: 0,
            realradius: 0,
            radius: 0.25,
            angle: 0,
            speed: 1.0/Math.PI
        }
    ];
    this.iterations = 100;
    this.speed = 5.0;
    this.paused = true;
    
    var speedinput = document.getElementById("speedinput");
    var iterinput = document.getElementById("iterinput");
    
    speedinput.value = this.speed;
    iterinput.value = this.iterations;
    
    var sccheck = document.getElementById("showcircles");
    var srcheck = document.getElementById("showradii");
    var sp = this;
    
    function eachCircle(eachCallback, doneCallback) {
        var unit = spiroCanvas.clientWidth / 2;
        var x = unit;
        var y = unit;
        var angle = 0.0;
        var lastRadius = 1.0;
        
        for (var i=0; i < sp.circles.length; i++) {
            angle += sp.circles[i].angle;
            
            x += unit * (lastRadius - sp.circles[i].radius) * Math.cos(angle);
            y += unit * (lastRadius - sp.circles[i].radius) * Math.sin(angle);
            
            sp.circles[i].x = x;
            sp.circles[i].y = y;
            sp.circles[i].realangle = angle % (2 * Math.PI);
            sp.circles[i].realradius = sp.circles[i].radius * unit;
            
            if (eachCallback)
                eachCallback(sp.circles[i]);
            
            lastRadius = sp.circles[i].radius;
        }
        
        if (doneCallback)
            doneCallback(sp.circles[i-1]);
    }
    
    function getColor(val) {
        var i = Math.floor(val * 6);
        var f = val * 6 - i;
        var q = ("0" + Math.round(255 * (1 - f)).toString(16)).slice(-2);
        var t = ("0" + Math.round(255 * f).toString(16)).slice(-2);
        switch (i % 6) {
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
        
        ctx.clearRect(0, 0, this.infoCanvas.clientWidth, this.infoCanvas.clientHeight);
        
        if (sccheck.checked || srcheck.checked) {
            eachCircle(function(c) {
                if (sccheck.checked) {
                    ctx.strokeStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, c.realradius, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.stroke();
                }
                
                if (srcheck.checked) {
                    ctx.strokeStyle = "#00FF00";
                    ctx.beginPath();
                    ctx.moveTo(c.x, c.y);
                    ctx.lineTo(c.x + Math.cos(-c.realangle)*c.realradius, c.y + Math.sin(-c.realangle)*c.realradius);
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
            c.angle += sp.speed * c.speed * idt;
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
                sp.update(0.015);
            }, 15);
        }
        
        this.paused = paused;
    }
    
    window.addEventListener("keydown", function(evt) {
        console.log(evt.keyCode);
        switch (evt.keyCode) {
            case 32:
                sp.setPaused(!spiro.paused);
                break;
            case 39:
                sp.setSpeed(sp.speed * 1.1);
                break;
            case 37:
                sp.setSpeed(sp.speed / 1.1);
                break;
            case 187:
                sp.setIterations(sp.iterations + 10);
                break;
            case 189:
                sp.setIterations(sp.iterations - 10);
                break;
            case 13:
                sp.spiroCtx.clearRect(0, 0, sp.spiroCanvas.clientWidth, sp.spiroCanvas.clientHeight);
                break;
        }
    });
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


var spiro;
window.onload = function() {
    var spiroCanvas = document.getElementById("spiroCanvas");
    var infoCanvas = document.getElementById("infoCanvas");
    
    spiro = new Spirograph(spiroCanvas, infoCanvas);
    
    document.getElementById("speedinput").setAttribute("onchange", "spiro.updateSpeed()");
    document.getElementById("iterinput").setAttribute("onchange", "spiro.updateIterations()");
    
    document.getElementById("showcircles").setAttribute("onclick", "spiro.draw()");
    document.getElementById("showradii").setAttribute("onclick", "spiro.draw()");
    
    spiro.setPaused(false);
};