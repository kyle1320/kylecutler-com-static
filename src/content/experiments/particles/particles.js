import 'jscolor-picker';
import {
  $,
  scaleCanvas,
  fitElement,
  link,
  takeTouchFocus,
  getRelativeCoord } from '../util';
import { randomColor } from 'utils';

window.onload = function () {
  var drawCanvas = $('draw-canvas');
  var traceCanvas = $('trace-canvas');
  var drawContext = drawCanvas.getContext('2d');
  var traceContext = traceCanvas.getContext('2d');

  var particles = [];
  var paused = true;
  var runInterval;

  var doubletap = false;
  var mouseparticle = null;
  var newgroup = null;
  var groupvel = null;

  var width, height;

  var options = {
    bounce: true,
    trace: true,
    gravity: 20.0,
    decay: 0,
    groupSize: 40,
    groupRadius: 8,
    groupColor: null,
    mouseDensity: 50,
    particleRadius: 1,
    particleDensity: 1,
    fixedParticles: false,
    traceNew: true
  };

  var inputs = {
    gravInput: $('gravity'),
    decayInput: $('decay'),
    groupSizeInput: $('group-size'),
    groupRadiusInput: $('group-radius'),
    groupColorInput: $('group-color'),
    mouseDensityInput: $('mouse-density'),
    particleRadiusInput: $('particle-radius'),
    particleDensityInput: $('particle-density'),
    fpcheck: $('fixed-particles'),
    tpcheck: $('trace-particles'),
    bocheck: $('bounce'),
    trcheck: $('trace'),
    pauseBtn: $('pause'),
    clearBtn: $('clear'),
    clearTraceBtn: $('clear-trace'),
    saveBtn: $('save-btn'),
    saveImg: $('save-img')
  };

  init();

  function init() {
    scaleCanvas(drawCanvas, drawContext);
    scaleCanvas(traceCanvas, traceContext);

    var canvases = $('canvases');
    fitElement(canvases, 500, 500, function (el) {
      drawCanvas.style.width
        = traceCanvas.style.width
        = canvases.style.width;
      drawCanvas.style.height
        = traceCanvas.style.height
        = canvases.style.height;
    });

    width = drawCanvas.drawWidth;
    height = drawCanvas.drawHeight;

    link(inputs.gravInput, options, 'gravity');
    link(inputs.decayInput, options, 'decay');
    link(inputs.groupSizeInput, options, 'groupSize');
    link(inputs.groupRadiusInput, options, 'groupRadius');
    link(inputs.groupColorInput, options, 'groupColor');
    link(inputs.mouseDensityInput, options, 'mouseDensity');
    link(inputs.particleRadiusInput, options, 'particleRadius');
    link(inputs.particleDensityInput, options, 'particleDensity');
    link(inputs.fpcheck, options, 'fixedParticles');
    link(inputs.tpcheck, options, 'traceNew');
    link(inputs.bocheck, options, 'bounce');
    link(inputs.trcheck, options, 'trace');

    inputs.pauseBtn.addEventListener('click', function () {
      setPaused(!paused);
    });
    inputs.clearBtn.addEventListener('click', clear);
    inputs.clearTraceBtn.addEventListener('click', clearTrace);
    inputs.saveBtn.addEventListener('click', function () {
      inputs.saveImg.src = traceCanvas.toDataURL();
    });

    drawCanvas.addEventListener('mousedown', mouseDown);
    drawCanvas.addEventListener('mousemove', mouseMove);
    drawCanvas.addEventListener('mouseup', mouseUp);
    drawCanvas.addEventListener('mouseleave', mouseUp);
    window.addEventListener('keydown', keyFunc);

    drawCanvas.addEventListener('touchstart', touchDown);
    drawCanvas.addEventListener('touchmove', touchMove);
    drawCanvas.addEventListener('touchend', touchUp);

    addGroup(drawCanvas.drawWidth / 2, drawCanvas.drawHeight / 2);
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

  Particle.prototype.update = function (time) {
    this.vx = this.mx + this.vx * (1 - options.decay);
    this.vy = this.my + this.vy * (1 - options.decay);

    if (options.bounce) {
      /* if (this.x < this.radius && this.vx < 0) {
        this.x = this.radius*2 - this.x;
        this.vx = -this.vx;
      } else if (this.x > width - this.radius && this.vx > 0) {
        this.x = width*2 - this.x;
        this.vx = -this.vx;
      }

      if (this.y < this.radius && this.vy < 0) {
        this.y = this.radius*2 - this.y;
        this.vy = -this.vy;
      } else if (this.y > height - this.radius && this.vy > 0) {
        this.y = height*2 - this.y;
        this.vy = -this.vy;
      } */
      if (
        (this.x < this.radius && this.vx < 0) ||
        (this.x > width - this.radius && this.vx > 0)
      ) {
        this.vx = -this.vx;
      }
      if (
        (this.y < this.radius && this.vy < 0) ||
        (this.y > height - this.radius && this.vy > 0)
      ) {
        this.vy = -this.vy;
      }
    }

    if (!this.fixed) {
      this.x += this.vx*time;
      this.y += this.vy*time;
    }

    // if (this.mass === 0) console.log(Math.sqrt(this.mx*this.mx + this.my*this.my));

    this.mx = 0;
    this.my = 0;
  };

  Particle.prototype.attract = function (p, time) {
    var dx = this.x - p.x;
    var dy = this.y - p.y;
    var dsq = dx*dx + dy*dy;
    if (dsq === 0) return;

    var dr = this.radius + p.radius;
    var drsq = dr*dr;
    if (dsq <= drsq) dsq = drsq;

    // packing density ~= b / a
    // force ~= b
    // reactivity ~= a

    // var d4 = dsq * dsq;
    // var d8 = d4 * d4;
    //
    // var a = 2.5e6;
    // var b = 2.5e3;
    //
    // var e = ((b * d4 - a) / d8) * time + (this.mass * p.mass * options.gravity * time / dsq);
    // var rx = dx * e;
    // var ry = dy * e;
    //
    // p.mx += rx / p.mass;
    // p.my += ry / p.mass;
    //
    // this.mx -= rx / this.mass;
    // this.my -= ry / this.mass;

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
    if (x === undefined) x = Math.random() * width;
    if (y === undefined) y = Math.random() * height;

    var color = options.groupColor || randomColor();
    var group = [];

    for (var i=0; i < options.groupSize; i++) {
      // var min = (options.particleRadius + 2) / Math.sin(Math.PI / options.groupSize)
      var d = options.groupRadius*i/options.groupSize;// + min;
      var px = x + d*Math.cos(i);
      var py = y + d*Math.sin(i);
      group[group.length] = new Particle(
        px,
        py,
        options.particleRadius,
        options.particleDensity,
        color,
        options.traceNew,
        options.fixedParticles
      );
    }

    return group;
  }

  function draw() {
    var i;

    drawContext.clearRect(0, 0, drawCanvas.drawWidth, drawCanvas.drawHeight);

    if (!options.trace) clearTrace();

    function drawParticle(ctx, p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2*Math.PI);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    for (i=0; i < particles.length; i++) {
      drawParticle(drawContext, particles[i]);
      drawContext.strokeStyle = '#000000';
      drawContext.lineWidth = 0.5;
      drawContext.stroke();

      if (options.trace && particles[i].trace) {
        drawParticle(traceContext, particles[i]);
      }
    }

    if (mouseparticle) {
      drawParticle(drawContext, mouseparticle);
    }

    if (newgroup) {
      for (i=0; i < newgroup.length; i++) {
        drawParticle(drawContext, newgroup[i]);
      }
    }

    if (groupvel) {
      drawContext.beginPath();
      drawContext.moveTo(groupvel.ox, groupvel.oy);
      drawContext.lineTo(groupvel.ox + groupvel.x, groupvel.oy + groupvel.y);
      drawContext.closePath();
      drawContext.strokeStyle = '#00FF00';
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
    traceContext.clearRect(0, 0, traceCanvas.drawWidth, traceCanvas.drawHeight);
  }

  function setPaused(p) {
    if (p && !paused) {
      clearInterval(runInterval);
    } else if (paused) {
      runInterval = setInterval(function () {
        update(0.015);
      }, 15);
    }

    paused = p;
    inputs.pauseBtn.innerHTML = p ? 'Resume' : 'Pause';
  }

  function mouseDown(evt) {
    var mousepos = getRelativeCoord(drawCanvas, evt);

    if (evt.ctrlKey || evt.metaKey) {
      newgroup = newGroup(mousepos.x, mousepos.y);
      groupvel = {ox: mousepos.x, oy: mousepos.y, x: 0, y: 0};
    } else {
      mouseparticle = new Particle(
        mousepos.x, mousepos.y, 1, options.mouseDensity, '#FFFF00', false, false
      );
    }

    draw();
  }

  function mouseUp(evt) {
    if (newgroup) {
      newgroup.forEach(function (p) { p.vx = groupvel.x; p.vy = groupvel.y; });
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

  function touchDown(evt) {
    takeTouchFocus(evt);

    var mousepos = getRelativeCoord(drawCanvas, evt);

    if (doubletap) {
      newgroup = newGroup(mousepos.x, mousepos.y);
      groupvel = {ox: mousepos.x, oy: mousepos.y, x: 0, y: 0};

      draw();
    } else {
      mouseparticle = new Particle(
        mousepos.x, mousepos.y, 1, options.mouseDensity, '#FFFF00', false, false
      );
      doubletap = true;
      setTimeout(function () { doubletap = false; }, 400);
    }
  }

  function touchMove(evt) {
    takeTouchFocus(evt);

    mouseMove(evt);
  }

  function touchUp(evt) {
    takeTouchFocus(evt);

    mouseUp(evt);
  }

  function keyFunc(evt) {
    switch (evt.keyCode) {
    case 13:
      clear();
      break;
    }
  }
};