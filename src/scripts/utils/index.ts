export function importStylesheet(href: string): Promise<any> {

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

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function count<T>(max: number, callback: (n: number) => T): T[] {
  var arr = [];
  for (var i = 0; i < max; i++) {
    arr[i] = callback(i);
  }
  return arr;
}

type ElementContentSingle = string | HTMLElement;
export type ElementContent = ElementContentSingle | ElementContentSingle[];

export function makeElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  props?: {[U in keyof HTMLElementTagNameMap[T]]?: HTMLElementTagNameMap[T][U]},
  ...children: ElementContent[]
): HTMLElementTagNameMap[T] {
  var el = document.createElement(tag);

  for (var key in props) {
    if (typeof props[key] === 'function' && key[0] === 'o' && key[1] === 'n') {
      el.addEventListener(
        key.substr(2),
        (props[key] as unknown) as EventListenerOrEventListenerObject
      );
    } else {
      el[key] = props[key];
    }
  }

  children.forEach(function addChild(child) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Array) {
      child.forEach(addChild);
    } else {
      el.appendChild(child);
    }
  });

  return el;
}

export function toggleClass(
  el: HTMLElement,
  className: string,
  enabled?: boolean
) {
  var regexp = new RegExp('\\s*' + className, 'g');

  if (typeof enabled === 'undefined') {
    enabled = !regexp.test(el.className);
  } else if (enabled && regexp.test(el.className)) {
    return;
  }

  if (enabled) {
    el.className += ' ' + className;
  } else {
    el.className = el.className.replace(regexp, '');
  }
}