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

type JSXChild = HTMLElement | string | number | boolean | null | undefined;
export type ElementContent = JSXChild | JSXChild[];

export function makeElement<T extends keyof JSX.IntrinsicElements>(
  tag: T,
  props?: JSX.IntrinsicElements[T],
  ...children: ElementContent[]
): HTMLElementTagNameMap[T] {
  var el = document.createElement(tag);

  for (var key in props) {
    if (key === 'style') {
      for (var key2 in props.style) {
        el.style[key2] = props.style[key2];
      }
    } else if (
      typeof props[key] === 'function' && key[0] === 'o' && key[1] === 'n'
    ) {
      el.addEventListener(
        key.substr(2),
        (props[key] as unknown) as EventListenerOrEventListenerObject
      );
    } else {
      (el[key] as any) = props[key];
    }
  }

  children.forEach(function addChild(child) {
    if (child instanceof Array) {
      child.forEach(addChild);
    } else if (child instanceof Node) {
      el.appendChild(child);
    } else if (child) {
      el.appendChild(document.createTextNode(String(child)));
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
