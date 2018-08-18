window.addEventListener('load', function () {
  var obfuscated = document.querySelectorAll('[data-obf]');

  for (var i = 0; i < obfuscated.length; i++) {
    try {
      var el = obfuscated[i];
      var attrs = JSON.parse(el.getAttribute('data-obf'));

      for (var key in attrs) {
        el.setAttribute(key, atob(attrs[key]));
      }

      el.removeAttribute('data-obf');
    } catch (e) {

    }
  }
});