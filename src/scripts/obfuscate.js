window.addEventListener('load', function () {
  var obfuscated = document.querySelectorAll('[data-obf]');

  function deobfuscate() {
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

    this.removeEventListener('focus', deobfuscate);
    this.removeEventListener('mouseenter', deobfuscate);
    this.removeEventListener('touchstart', deobfuscate);
  }

  function deobfuscateAll() {
    for (var i = 0; i < obfuscated.length; i++) {
      var el = obfuscated[i];
      deobfuscate.call(el);
    }

    window.removeEventListener('touchmove', deobfuscateAll);
  }

  for (var i = 0; i < obfuscated.length; i++) {
    var el = obfuscated[i];

    el.addEventListener('focus', deobfuscate);
    el.addEventListener('mouseenter', deobfuscate);
    el.addEventListener('touchstart', deobfuscate);
  }

  window.addEventListener('touchmove', deobfuscateAll);
});