export function importStylesheet(href) {

  // avoid duplicates
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].href === href) {
      return Promise.resolve();
    }
  }

  return new Promise((resolve, reject) => {
    var link = document.createElement('link');

    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;

    document.head.appendChild(link);
  });
}

export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function count(max, callback) {
  var arr = [];
  for (var i = 0; i < max; i++) {
    arr[i] = callback(i);
  }
  return arr;
}

export function makeElement(keys, content, events = {}) {
  if (typeof keys === 'string') {
    keys = { tag: keys };
  }

  var el = document.createElement(keys.tag || 'div');
  delete keys.tag;

  for (let key in keys) {
    el[key] = keys[key];
  }

  for (let key in events) {
    el.addEventListener(key, events[key]);
  }

  if (typeof content === 'string') {
    el.innerHTML = content;
  } else if (content instanceof Array) {
    content.forEach(function (child) {
      el.appendChild(child);
    });
  }

  return el;
}

export function toggleClass(el, className, enabled) {
  var regexp = new RegExp('\\s*' + className, 'g');

  if (enabled) {
    if (!regexp.test(el.className)) {
      el.className += ' ' + className;
    }
  } else {
    el.className = el.className.replace(regexp, '');
  }
}