import 'jscolor-picker';
import {
  $,
  scaleCanvas,
  fitElement,
  link,
  resizeCanvas,
  clamp } from '../util';
import { QuadTree, getSaturatedColor, randomColor } from '~/src/common/js/utils';

window.onload = function () {
  var drawCanvas = $('draw-canvas');
  var drawContext = drawCanvas.getContext('2d');

  var paused = true;
  // var drawInterval;

  var tree;
  var inactive;
  var points;
  var currlevel;
  var prevmax;
  var currmax;

  var densitysamples;
  var currsample;
  var density;
  var progress;

  // contains variables that can be changed by the user
  var options = {
    samples: 30,
    padding: 4,
    min_rad: 2,
    max_rad: 100,
    maxlevel: -1,
    inactivity: 100, // not user-changeable at the moment, but it could be.
    pattern: 'alternate',
    bgcolor: '',
    maincolor: '',
  };

  // contains references to HTML elements
  // that are used to change options or perform actions
  var inputs = {
    pauseBtn: $('pause'),
    resetBtn: $('reset'),
    saveBtn: $('save-btn'),
    saveImg: $('save-img'),
    width: $('width'),
    height: $('height'),
    samples: $('samples'),
    padding: $('padding'),
    min_rad: $('min-rad'),
    max_rad: $('max-rad'),
    maxlevel: $('max-level'),
    bgcolor: $('bg-color'),
    pattern: $('pattern'),
  };

  // contains references to HTML elements
  // that are used to display information to the user
  var outputs = {
    status: $('status'),
    level: $('level'),
    points: $('points'),
    progress: $('progress'),
  };

  // set everything up
  function init() {
    // scale the canvases to the actual screen resolution
    scaleCanvas(drawCanvas, drawContext, false);

    fitElement(drawCanvas, 500, 500);

    Object.defineProperty(options, 'width', {
      get: function () { return drawCanvas.width; },
      set: function (w) { setSize(w, drawCanvas.height); },
    });

    Object.defineProperty(options, 'height', {
      get: function () { return drawCanvas.height; },
      set: function (h) { setSize(drawCanvas.width, h); },
    });

    // setup button events
    inputs.pauseBtn.addEventListener('click', function () {
      setPaused(!paused);
    });
    inputs.resetBtn.addEventListener('click', reset);
    inputs.saveBtn.addEventListener('click',
      function () { inputs.saveImg.src = drawCanvas.toDataURL(); }
    );

    // link numerical options to their html inputs
    link(inputs.width, options, 'width', undefined, { instant: false });
    link(inputs.height, options, 'height', undefined, { instant: false });
    link(inputs.samples, options, 'samples', reset, { instant: false });
    link(inputs.padding, options, 'padding', reset, { instant: false });
    link(inputs.min_rad, options, 'min_rad', reset, { instant: false });
    link(inputs.max_rad, options, 'max_rad', reset, { instant: false });
    link(inputs.maxlevel, options, 'maxlevel', reset, { instant: false });
    link(inputs.bgcolor, options, 'bgcolor', reset);
    link(inputs.pattern, options, 'pattern', reset);

    // run it
    reset();
    setPaused(false);
  }

  // used as a callback to width / height inputs
  function setSize(width, height) {
    resizeCanvas(drawCanvas, drawContext, width, height, false);
    console.log(drawCanvas.width, drawCanvas.height);
    reset();
  }

  // reset everything
  function reset() {

    // erase the canvas
    if (options.bgcolor) {
      drawContext.fillStyle = options.bgcolor;
      drawContext.fillRect(0, 0, drawCanvas.drawWidth, drawCanvas.drawHeight);
    } else {
      drawContext.clearRect(0, 0, drawCanvas.drawWidth, drawCanvas.drawHeight);
    }

    // generate a new tree to hold points
    tree = new QuadTree(0, 0, drawCanvas.drawWidth, drawCanvas.drawHeight);
    inactive = 0;
    points = 0;
    currlevel = 1;
    prevmax = 2 * options.max_rad + options.padding;
    currmax = 0;

    densitysamples = new Array(options.inactivity * 10);
    currsample = 0;
    density = 0;
    progress = 0;

    // reset status outputs
    outputs.status.innerHTML = 'Running';
    outputs.level.innerHTML = currlevel;
    outputs.points.innerHTML = points;
    outputs.progress.innerHTML = progress + '%';
  }

  function setColor() {
    if (options.pattern == 'alternate') {
      if (currlevel % 2) {
        if (options.maincolor) {
          drawContext.fillStyle = options.maincolor;
        } else {
          drawContext.fillStyle = randomColor();
        }
      } else if (options.bgcolor) {
        drawContext.fillStyle = options.bgcolor;
      } else {

        // eraser
        drawContext.globalCompositeOperation = 'destination-out';
      }
    } else if (options.pattern == 'rainbow') {
      drawContext.fillStyle = getSaturatedColor((currlevel-1) / 6);
    }
  }

  // update what's running
  function update() {

    /*
     * Run the best candidate search.
     *
     * This places some number of points randomly, then evaluates each of them
     * based on their distance to the nearest cell.
     * The cell with the largest distance (if it is large enough) gets placed.
     * This repeats until no cell gets placed for some number of iterations.
     * Then we move onto the next level.
     *
     * I split the generation into levels to allow a narrower search as we progress.
     * This is due to the fact that the higher the level, the smaller the cells will be.
     * We keep track of the largest cell in the previous level, because that is how far
     * we will have to search to find our neighbors.
     */

    if (inactive < options.inactivity) {
      var bestdist = -Infinity, bestx, besty, bestlevel;

      // select some number of random points
      for (var k = 0; k < options.samples; k++) {

        var px = Math.random() * drawCanvas.drawWidth;
        var py = Math.random() * drawCanvas.drawHeight;
        var level = 0;

        // get points close to the newly created one
        var nearby = tree.inRegion(
          px-prevmax, py-prevmax, px+prevmax, py+prevmax
        );

        var closest = Infinity;
        var parentdist = Infinity;

        // find our closest neighbor (and our parent's level)
        for (var j = 0; j < nearby.length; j++) {
          var dx = px - nearby[j].x;
          var dy = py - nearby[j].y;
          var dist = Math.sqrt(dx*dx + dy*dy) - nearby[j].r;
          var absdist = Math.abs(dist);

          // if we are inside a cell, they may be our parent.
          // (the closest cell that we are inside of is our real parent)
          if (dist < 0 && nearby[j].r < parentdist) {
            level = nearby[j].p + 1;
            parentdist = nearby[j].r;
          }

          // find the closest distance
          if (absdist < closest) {
            closest = absdist;
          }
        }

        // if this point is on the current level,
        // update the best point data.
        if (level == currlevel-1 && closest > bestdist) {
          bestdist = closest;
          bestx = px;
          besty = py;
          bestlevel = level;
        }
      }

      // if there are no neighbors that are too close
      if (bestdist > options.min_rad + options.padding) {

        // create the point
        var newpt = {
          x: bestx,
          y: besty,
          r: Math.min(options.max_rad, bestdist-options.padding),
          p: bestlevel,
          color: randomColor()
        };

        // draw the point
        drawContext.beginPath();
        drawContext.arc(newpt.x, newpt.y, newpt.r, 0, 2*Math.PI);
        drawContext.closePath();
        setColor();
        drawContext.fill();
        drawContext.globalCompositeOperation = 'source-over';

        // insert into the tree
        tree.insert(newpt);

        // keep track of the largest cell in this level (so the next level can use it)
        if (newpt.r > currmax) currmax = newpt.r;

        // we have gone 0 iterations without placing a cell..
        inactive = 0;

        // update the counter and display
        outputs.points.innerHTML = (++points);
      } else {

        // we didn't place a point
        inactive++;
      }

      // calculating the percent complete.
      // not entirely perfect; it's hard to predict a random event.

      // we keep track of whether or not previous iterations have resulted in a point placed.
      var oldsample = densitysamples[currsample];
      densitysamples[currsample] = (inactive ? 1 : 0);
      if (oldsample) density -= oldsample;

      // we calculate a "density": the number of iterations that resulted in a point placed.
      density += densitysamples[currsample];
      currsample = (currsample + 1) % densitysamples.length;

      // now we can generally assume that a higher density means we are more likely to finish.

      // we apply a function to make the density (mostly) linear with regards to time elapsed
      // lots of effort went into coming up with this function,
      // but what is important is that 0 -> 0, 1 -> 1, and it seems to work ok..
      var x = density / densitysamples.length;
      var p = Math.sqrt(x)/Math.sqrt(26-25*x);

      // progress should only increase, and not go above 99%...
      progress = clamp(Math.floor(130*p), progress, 99);

      // show the progress
      outputs.progress.innerHTML = progress + '%';

    // we need to move up a level. Reset anything related to this level.
    } else if (currlevel != options.maxlevel && currmax > 0) {
      currlevel++;

      inactive = 0;
      prevmax = currmax;
      currmax = 0;

      densitysamples = new Array(1000);
      currsample = 0;
      density = 0.0;
      progress = 0;

      outputs.level.innerHTML = currlevel;

    } else {
      outputs.status.innerHTML = 'Done';

      // progress never actually ends on 100%, so it looks nicer this way..
      outputs.progress.innerHTML = '100%';
    }

    // schedule another update
    if (!paused) setTimeout(update, 0);
  }

  // pause / resume
  function setPaused(p) {
    if (p && !paused) {
      paused = p;
      // clearInterval(drawInterval);
    } else if (!p && paused) {
      paused = p;
      // drawInterval = setInterval(draw, 15);
      update();
    }

    inputs.pauseBtn.innerHTML = paused ? 'Resume' : 'Pause';
  }

  init();
};