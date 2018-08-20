window.addEventListener('load', function () {
  var obfuscated = document.querySelectorAll('[data-obf]');

  function deobfuscate() {
    try {
      var attrs = JSON.parse(this.getAttribute('data-obf'));

      for (var key in attrs) {
        if (key === 'content') {
          this.innerHTML = atob(attrs[key]);
        } else {
          this.setAttribute(key, atob(attrs[key]));
        }
      }

      this.removeAttribute('data-obf');
    } catch (e) {

    }
  }

  for (var i = 0; i < obfuscated.length; i++) {
    var el = obfuscated[i];

    el.addEventListener('focus', deobfuscate);
    el.addEventListener('mouseenter', deobfuscate);
    el.addEventListener('touchstart', deobfuscate);
  }
});