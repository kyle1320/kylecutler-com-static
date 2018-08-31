import { gaSend } from './gtm';

window.addEventListener('load', function () {
  var obfuscated = document.querySelectorAll('[data-obf]');
  var handlers = {
    focus: deobfuscate('focus'),
    mouse: deobfuscate('mouse'),
    touch: deobfuscate('touch'),
    drag: deobfuscate('drag')
  };

  function deobfuscate(type) {
    return function () {
      if (!this.hasAttribute('data-obf')) {
        return;
      }

      try {
        var attrs = JSON.parse(this.getAttribute('data-obf'));

        for (var key in attrs) {
          if (key === 'content') {
            this.innerHTML = atob(attrs[key]);
          } else {
            this.setAttribute(key, atob(attrs[key]));
          }
        }
      } catch (e) {

      }

      this.removeAttribute('data-obf');

      this.removeEventListener('focus', handlers.focus);
      this.removeEventListener('mouseenter', handlers.mouse);
      this.removeEventListener('touchstart', handlers.touch);

      gaSend('event', 'obfuscated', type || 'unknown', this.outerHTML);
    }
  }
  function deobfuscateAll() {
    for (var i = 0; i < obfuscated.length; i++) {
      var el = obfuscated[i];
      handlers.drag.call(el);
    }

    window.removeEventListener('touchmove', deobfuscateAll);
  }

  for (var i = 0; i < obfuscated.length; i++) {
    var el = obfuscated[i];

    el.addEventListener('focus', handlers.focus);
    el.addEventListener('mouseenter', handlers.mouse);
    el.addEventListener('touchstart', handlers.touch);
  }

  window.addEventListener('touchmove', deobfuscateAll);
});