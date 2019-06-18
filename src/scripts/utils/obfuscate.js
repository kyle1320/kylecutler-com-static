import { pushEvent } from './gtm';

window.addEventListener('load', function () {
  var obfuscated = document.querySelectorAll('[data-obf]');

  function deobfuscate(event) {
    var obfuscated = this.getAttribute('data-obf');

    if (!obfuscated) {
      return;
    }

    try {
      var attrs = JSON.parse(obfuscated);

      for (var key in attrs) {
        if (key === 'content') {
          this.innerHTML = atob(attrs[key]);
        } else {
          this.setAttribute(key, atob(attrs[key]));
        }
      }

    /* eslint-disable no-empty */
    } catch (e) {
      // just ignore this element.
    }
    /* eslint-enable no-empty */

    this.removeAttribute('data-obf');

    this.removeEventListener('focus', deobfuscate);
    this.removeEventListener('mouseenter', deobfuscate);
    this.removeEventListener('touchstart', deobfuscate);

    pushEvent('deobfuscate', {
      eventData: event,
      obfuscatedData: obfuscated,
      element: this
    });
  }

  function deobfuscateAll(event) {
    for (var i = 0; i < obfuscated.length; i++) {
      deobfuscate.call(obfuscated[i], event);
    }

    window.removeEventListener('touchmove', deobfuscateAll);
  }

  for (var i = 0; i < obfuscated.length; i++) {
    var el = obfuscated[i];

    el.addEventListener('focus', deobfuscate);
    el.addEventListener('mouseenter', deobfuscate);
    el.addEventListener('touchstart', deobfuscate);
  }

  window.addEventListener('touchmove', deobfuscateAll, { passive: true });
});