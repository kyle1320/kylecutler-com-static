import { QuadTree } from 'utils';

export const $ = document.getElementById.bind(document);

/****************
 *    CANVAS    *
 ****************/

export const scaleCanvas = function (canvas, context, scaleContext) {
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
};

export const resizeCanvas = function (
  canvas, context, width, height, scaleContext
) {
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
};

export const fitElement = function (
  el, preferredWidth, preferredHeight, onresize
) {
  preferredWidth = preferredWidth || el.clientWidth;
  preferredHeight = preferredHeight || el.clientHeight;
  onresize = onresize || function () {};
  var preferredRatio = preferredWidth / preferredHeight;

  var resize = function () {
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
};

/****************
 *    EVENTS    *
 ****************/

export const getRelativeCoord = function (canvas, evt) {
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
};

export const takeTouchFocus = function (evt) {
  if (window.TouchEvent && evt instanceof TouchEvent) {
    if (evt.touches.length < 2) {
      evt.preventDefault();
    }
  }
};

export function link(
  el, obj, attr, cb = function () {}, options = { instant: true }
) {
  var setter = null;

  if (el.tagName === 'INPUT') {
    if ('jscolor' in el) {

      // RGB color
      if (obj[attr] instanceof Array) {
        setter = ([r, g, b]) => el.jscolor.fromRGB(r, g, b);

        el.addEventListener('change', function () {
          cb(obj[attr] = el.jscolor.rgb.map(Math.floor));
        });

      // Hex color
      } else {
        setter = x => x && el.jscolor.fromString(x.replace(/^#/, ''));

        el.addEventListener('change', function () {
          cb(obj[attr] = el.value ? '#' + el.jscolor.toString() : null);
        });
      }

    // checkbox
    } else if (el.type === 'checkbox') {
      setter = x => el.checked = x;
      el.addEventListener('click', () => cb(obj[attr] = el.checked));

    // number input
    } else if (typeof obj[attr] === 'number') {
      setter = x => el.value = String(x);

      el.addEventListener(options.instant ? 'input' : 'change', function () {
        var value = +el.value;
        if (!isNaN(value)) {
          cb(obj[attr] = value);
        }
      });

      el.addEventListener('blur', () => el.value = String(obj[attr]));

    // string input
    } else {
      setter = x => el.value = x;

      el.addEventListener(options.instant ? 'input' : 'change', function () {
        cb(obj[attr] = el.value);
      });
    }

  // select
  } else if (el.tagName === 'SELECT') {
    setter = x => el.value = x;

    el.addEventListener('change', () => cb(obj[attr] = el.value));
  }

  setter(obj[attr]);

  return x => {
    obj[attr] = x;
    setter(x);
  };
}

export function linkAll(obj, map) {
  var res = {};

  for (var key in map) {
    var val = map[key];

    if (!(val instanceof Array)) {
      val = [val];
    }

    res[key] = link(val[0], obj, key, val[1], val[2]);
  }

  return res;
}

/****************
 *     MISC     *
 ****************/

Math.clamp = function (num, min, max) {
  return Math.max(min, Math.min(num, max));
};

export const poissonDisk = function (minx, miny, width, height, r) {
  var r2 = r * r;
  var maxx = minx + width;
  var maxy = miny + height;
  var j, k;

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

  // var cvs = $('draw-canvas');
  // var ctx = cvs.getContext('2d');

  // for (i = 0; i < points.length; i++) {
  //   for (j = 0; j < points.length; j++) {
  //     ctx.fillRect(cvs.drawWidth / 2 + (points[j].x - points[i].x),
  //       cvs.drawHeight / 2 + (points[j].y - points[i].y), 1, 1);
  //   }
  // }

  // tree.draw(cvs, ctx, 0, 0, 1, 1);

  return points;
};