var $ = function(e) { return document.getElementById(e); };
var isNaN =  Number.isNaN
          || window.isNaN
          || function(n) { return typeof n === 'number' && n !== n; };

/****************
 *    CANVAS    *
 ****************/

function scaleCanvas(canvas, context, scaleContext) {
  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1;

  var scale = devicePixelRatio / backingStoreRatio;

  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  canvas.drawWidth = canvas.width;
  canvas.drawHeight = canvas.height;

  resizeCanvas(
    canvas, context, canvas.width * scale, canvas.height * scale, scaleContext
  );

  return scale;
}

function resizeCanvas(canvas, context, width, height, scaleContext) {
  if (scaleContext === undefined) scaleContext = true;

  canvas.width = width;
  canvas.height = height;

  if (!scaleContext || !canvas.drawWidth || !canvas.drawHeight) {
    canvas.drawWidth = width;
    canvas.drawHeight = height;
  }

  if (scaleContext) {
    var scalex = width / canvas.drawWidth;
    var scaley = height / canvas.drawHeight;

    canvas.scalex = scalex;
    canvas.scaley = scaley;

    if (context instanceof CanvasRenderingContext2D) {
      context.scale(scalex, scaley);
    }
  }
}

function fitElement(el, preferredWidth, preferredHeight, onresize) {
  preferredWidth = preferredWidth || el.clientWidth;
  preferredHeight = preferredHeight || el.clientHeight;
  onresize = onresize || function() {};
  var preferredRatio = preferredWidth / preferredHeight;

  var resize = function() {
    var style = window.getComputedStyle(el.parentElement, null);
    var width = parseInt(style.getPropertyValue('width'));
    var height = parseInt(style.getPropertyValue('height'));

    var newwidth = Math.min(width, preferredWidth);
    var newheight = Math.min(height, preferredHeight);

    if (newwidth > preferredRatio * newheight) {
      newwidth = Math.floor(preferredRatio * newheight);
    } else {
      newheight = Math.floor(newwidth / preferredRatio);
    }

    el.style.width = newwidth+'px';
    el.style.height = newheight+'px';

    onresize(el);
  };

  resize();
  window.addEventListener('resize', resize);
}

/****************
 *    COLORS    *
 ****************/

function randomColor() {
  return '#' + (
    '00000' + (Math.floor(Math.random()*16777216)).toString(16)
  ).slice(-6);
}

function getSaturatedColor(v) {
  var i = Math.floor(v * 6);
  var f = ((v * 6 - i) + 1) % 1;
  var q = ('0' + Math.round(255 * (1 - f)).toString(16)).slice(-2);
  var t = ('0' + Math.round(255 * f).toString(16)).slice(-2);
  switch ((i + 6) % 6) {
  case 0: return '#FF' + t + '00';
  case 1: return '#' + q + 'FF00';
  case 2: return '#00FF' + t;
  case 3: return '#00' + q + 'FF';
  case 4: return '#' + t + '00FF';
  case 5: return '#FF00' + q;
  }
}

function toRGBString(r, g, b) {
  return '#' + ('0' + Math.floor(r).toString(16)).slice(-2) +
                 ('0' + Math.floor(g).toString(16)).slice(-2) +
                 ('0' + Math.floor(b).toString(16)).slice(-2);
}

/****************
 *    EVENTS    *
 ****************/

function getRelativeCoord(canvas, evt) {
  var x, y;
  // var pressed;
  if (evt instanceof MouseEvent) {
    x = evt.clientX;
    y = evt.clientY;
    // pressed = ~evt.buttons;
  } else if (window.TouchEvent && evt instanceof TouchEvent) {
    var touch = evt.changedTouches[0];
    x = touch.clientX;
    y = touch.clientY;
    // pressed = true;
  }

  var rect = canvas.getBoundingClientRect();
  return {
    x: (x - rect.left) * (canvas.drawWidth / canvas.clientWidth),
    y: (y - rect.top) * (canvas.drawHeight / canvas.clientHeight),
  };
}

function takeTouchFocus(evt) {
  if (window.TouchEvent && evt instanceof TouchEvent) {
    if (evt.touches.length < 2) {
      evt.preventDefault();
    }
  }
}

function linkCheckboxToBoolean(checkbox, object, attr, func) {
  func = func || function() {};

  checkbox.checked = object[attr];
  checkbox.addEventListener('click', function() {
    object[attr] = checkbox.checked;
    func();
  });
}

function linkInputToNumber(input, object, attr, func, instant) {
  func = func || function() {};
  if (instant === undefined) instant = true;

  input.value = String(object[attr]);
  input.addEventListener(instant ? 'input' : 'change', function() {
    var value = +input.value;
    if (!isNaN(value)) {
      object[attr] = value;
    }
    func();
  });

  input.addEventListener('blur', function() {
    input.value = String(object[attr]);
  });
}

function linkColorChooserToValues(color, object, attr, func) {
  func = func || function() {};

  color.jscolor.fromRGB(object[attr][0], object[attr][1], object[attr][2]);
  color.addEventListener('change', function() {
    object[attr][0] = Math.floor(color.jscolor.rgb[0] * 255);
    object[attr][1] = Math.floor(color.jscolor.rgb[1] * 255);
    object[attr][2] = Math.floor(color.jscolor.rgb[2] * 255);
    func();
  });
}

function linkColorChooserToHexString(color, object, attr, func) {
  func = func || function() {};

  color.jscolor.fromString(object[attr] ? object[attr].slice(1) : '');
  color.addEventListener('change', function() {
    object[attr] = color.value ? '#' + color.jscolor.toString() : null;
    func();
  });
}

function linkSelectToString(select, object, attr, func) {
  func = func || function() {};

  select.value = object[attr];
  select.addEventListener('change', function() {
    object[attr] = select.value;
    func();
  });
}

/****************
 *    FILES     *
 ****************/

function loadFile(url, data, callback, errorCallback) {
  errorCallback = errorCallback || function() {};

  // Set up an asynchronous request
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  // Hook the event that gets called as the request progresses
  request.onreadystatechange = function () {

    // If the request is "DONE" (completed or failed)
    if (request.readyState == 4) {

      // If we got HTTP status 200 (OK)
      if (request.status == 200) {
        callback(request.responseText, data);
      } else { // Failed
        errorCallback(url);
      }
    }
  };

  request.send(null);
}

function loadFiles(urls, callback, errorCallback) {
  var numUrls = urls.length;
  var numComplete = 0;
  var result = [];

  // Callback for a single file
  function partialCallback(text, urlIndex) {
    result[urlIndex] = text;
    numComplete++;

    // When all files have downloaded
    if (numComplete == numUrls) {
      callback(result);
    }
  }

  for (var i = 0; i < numUrls; i++) {
    loadFile(urls[i], i, partialCallback, errorCallback);
  }
}

/****************
 *     MISC     *
 ****************/

Math.clamp = function(num, min, max) {
  return Math.max(min, Math.min(num, max));
};

// pushes every element in the given list into this list
Array.prototype.pushAll = function(list) {
  for (var i = 0; i < list.length; i++) {
    this.push(list[i]);
  }
};

// definition for a point quadtree. Useful every now and again.. especially when working with 2D grids ;)
function QuadTree(minx, miny, maxx, maxy) {
  this.minx = minx;
  this.miny = miny;
  this.maxx = maxx;
  this.maxy = maxy;
  this.midx = (this.minx + this.maxx) / 2;
  this.midy = (this.miny + this.maxy) / 2;

  this.bucket = [];
  this.nw = null;
  this.ne = null;
  this.sw = null;
  this.se = null;
}

QuadTree.prototype.insert = function(obj) {

  // first make sure that the object goes inside our region.
  if (
    obj.x < this.minx ||
    obj.x >= this.maxx ||
    obj.y < this.miny ||
    obj.y >= this.maxy
  ) {
    return false;
  }

  // if we have no children,
  if (!this.nw) {

    // if we have not filled our own bucket, add to it.
    if (this.bucket.length < 5) {
      this.bucket.push(obj);
      return true;
    }

    // if we fill our own bucket, split up.
    this.subdivide();
  }

  // try storing the object in one of our children.
  return this.nw.insert(obj) || this.ne.insert(obj) ||
           this.sw.insert(obj) || this.se.insert(obj);
};

QuadTree.prototype.subdivide = function(obj) {

  // split up into four quadrants (child nodes)
  this.nw = new QuadTree(this.minx, this.miny, this.midx, this.midy);
  this.ne = new QuadTree(this.midx, this.miny, this.maxx, this.midy);
  this.sw = new QuadTree(this.minx, this.midy, this.midx, this.maxy);
  this.se = new QuadTree(this.midx, this.midy, this.maxx, this.maxy);

  // dump the contents of our bucket into our children
  for (var i = 0; i < this.bucket.length; i++) {
    this.insert(this.bucket[i]);
  }
  this.bucket = null;
};

QuadTree.prototype.inRegion = function(minx, miny, maxx, maxy) {

  // check that we overlap with the region
  if (
    maxx < this.minx ||
    minx >= this.maxx ||
    maxy < this.miny ||
    miny >= this.maxy
  ) {
    return [];
  }

  // if we have no children, return our bucket.
  // I decided not to copy the bucket, for speed reasons.
  if (!this.nw) return this.bucket;

  var found = [];

  // push the contents of our children into the array and return it
  found.pushAll(this.nw.inRegion(minx, miny, maxx, maxy));
  found.pushAll(this.ne.inRegion(minx, miny, maxx, maxy));
  found.pushAll(this.sw.inRegion(minx, miny, maxx, maxy));
  found.pushAll(this.se.inRegion(minx, miny, maxx, maxy));

  return found;
};

QuadTree.prototype.draw = function(canvas, ctx, minx, miny, maxx, maxy) {
  var midx = (minx + maxx) / 2;
  var midy = (miny + maxy) / 2;

  // if (this.nw || this.bucket.length > 0) {
  // ctx.strokeStyle = "#FF0000";
  // ctx.strokeRect(minx * canvas.drawWidth, miny * canvas.drawHeight, (maxx - minx) * canvas.drawWidth, (maxy - miny) * canvas.drawHeight);
  // }

  if (this.nw) {
    ctx.beginPath();
    ctx.moveTo(minx * canvas.drawWidth, midy * canvas.drawHeight);
    ctx.lineTo(maxx * canvas.drawWidth, midy * canvas.drawHeight);
    ctx.moveTo(midx * canvas.drawWidth, miny * canvas.drawHeight);
    ctx.lineTo(midx * canvas.drawWidth, maxy * canvas.drawHeight);
    ctx.closePath();
    ctx.strokeStyle = '#FF0000';
    ctx.stroke();

    this.nw.draw(canvas, ctx, minx, miny, midx, midy);
    this.ne.draw(canvas, ctx, midx, miny, maxx, midy);
    this.sw.draw(canvas, ctx, minx, midy, midx, maxy);
    this.se.draw(canvas, ctx, midx, midy, maxx, maxy);
  } else {
    for (var i = 0; i < this.bucket.length; i++) {
      var p = this.bucket[i];
      var x = minx +
        ((p.x - this.minx) / (this.maxx - this.minx)) * (maxx - minx);
      var y = miny +
        ((p.y - this.miny) / (this.maxy - this.miny)) * (maxy - miny);

      // console.log(x, y);

      ctx.fillStyle = '#0000FF';
      ctx.fillRect(x * canvas.drawWidth, y * canvas.drawHeight, 1, 1);
    }
  }
};

function poissonDisk(minx, miny, width, height, r) {
  var r2 = r * r;
  var maxx = minx + width;
  var maxy = miny + height;
  var i, j, k;

  var points = [
    {x: Math.random() * width + minx, y: Math.random() * height + miny}
  ];

  var tree = new QuadTree(minx, miny, maxx, maxy);
  var active = [];

  // start with a single, randomly placed point
  active.push(points[0]);
  tree.insert(points[0]);

  while (active.length > 0) {

    // choose a random point that has free space around it
    var ind = Math.floor(Math.random() * active.length);
    var pt = active[ind];
    var acceptable = false;

    // do 30 random points before we give up
    for (k = 0; k < 30; k++) {
      acceptable = true;

      // create a random point near to the current point
      var d = Math.random() * r + r;
      var theta = Math.random() * 2 * Math.PI;
      var px = pt.x + d * Math.cos(theta);
      var py = pt.y + d * Math.sin(theta);

      // if the point is out of bounds, it cannot be placed. Continue on.
      if (px < minx || px >= maxx || py < miny || py >= maxy) {
        acceptable = false;
        continue;
      }

      // get points close to the newly created one
      var nearby = tree.inRegion(px-r, py-r, px+r, py+r);

      for (j = 0; j < nearby.length; j++) {
        var dx = px - nearby[j].x;
        var dy = py - nearby[j].y;

        // if we are too close to a neighbor, this point cannot be placed
        if (dx * dx + dy * dy < r2) {
          acceptable = false;
          break;
        }
      }

      // if there are no neighbors that are too close, and we are in bounds
      if (acceptable) {
        var newpt = {x: px, y: py};

        // insert into the tree and the active points list
        tree.insert(newpt);
        points.push(newpt);
        active.push(newpt);

        break;
      }
    }

    // if we could not place a point, assume the area around this point is filled.
    // remove the current point from the active list.
    if (!acceptable) {
      active.splice(ind, 1);
    }
  }

  var cvs = $('draw-canvas');
  var ctx = cvs.getContext('2d');

  for (i = 0; i < points.length; i++) {
    for (j = 0; j < points.length; j++) {
      ctx.fillRect(cvs.drawWidth / 2 + (points[j].x - points[i].x),
        cvs.drawHeight / 2 + (points[j].y - points[i].y), 1, 1);
    }
  }

  // tree.draw(cvs, ctx, 0, 0, 1, 1);

  return points;
}

window.requestAnimFrame = (function(){
  return (window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    });
}());

window.cancelAnimFrame = (function(){
  return (window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.clearTimeout);
}());
