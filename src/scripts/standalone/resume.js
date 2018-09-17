require('../site');

window.addEventListener('load', function () {
  var showMoreButtons = document.querySelectorAll('.show-more-btn');

  for (var i = 0; i < showMoreButtons.length; i++) {
    showMoreButtons[i].addEventListener('click', function (event) {
      var parent = event.target.parentElement.parentElement;

      if (parent.className.match(/show-all/)) {
        parent.className = parent.className.replace(/\s*show-all/g, ' ');
      } else {
        parent.className += ' show-all';
      }
    });
  }
});