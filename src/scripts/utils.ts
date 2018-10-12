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

export type ElementContent = string | HTMLElement[];
type ElementTag = keyof HTMLElementTagNameMap;
type ElementProps<T extends ElementTag> =
  Partial<HTMLElementTagNameMap[T]>;
type ElementPropsWithTag<T extends ElementTag> =
  ElementProps<T> & { tag: T };
type ElementPropsWithMaybeTag<T extends ElementTag> =
  ElementProps<T> & { tag?: T };
type ElementEventMap =
  {[U in keyof HTMLElementEventMap]?: (e: HTMLElementEventMap[U]) => any};

export function makeElement<T extends ElementTag>(
  tag: T,
  content?: ElementContent,
  events?: ElementEventMap
): HTMLElementTagNameMap[T];

export function makeElement(
  keys: ElementProps<'div'>,
  content?: ElementContent,
  events?: ElementEventMap
): HTMLElementTagNameMap['div'];

export function makeElement<T extends ElementTag>(
  keys: ElementPropsWithTag<T>,
  content?: ElementContent,
  events?: ElementEventMap
): HTMLElementTagNameMap[T];

export function makeElement<T extends ElementTag>(
  keys: T | ElementPropsWithMaybeTag<T>,
  content?: ElementContent,
  events?: ElementEventMap
): HTMLElementTagNameMap[T];

export function makeElement<T extends ElementTag>(
  keys: T | ElementPropsWithMaybeTag<T>,
  content?: ElementContent,
  events?: ElementEventMap
): HTMLElementTagNameMap[T] {
  if (typeof keys === 'string') {
    keys = <ElementPropsWithTag<T>>{ tag: keys };
  }

  var el = document.createElement(keys.tag || 'div');
  delete keys.tag;

  Object.assign(el, keys);

  for (const key in events) {
    let k = <keyof HTMLElementEventMap> key;
    el.addEventListener(key, <EventListener>events[k]);
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

export function toggleClass(
  el: HTMLElement,
  className: string,
  enabled: boolean
) {
  var regexp = new RegExp('\\s*' + className, 'g');

  if (enabled) {
    if (!regexp.test(el.className)) {
      el.className += ' ' + className;
    }
  } else {
    el.className = el.className.replace(regexp, '');
  }
}