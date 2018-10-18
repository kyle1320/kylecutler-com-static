import '../_utils/obfuscate';

import { toggleClass } from '../_utils';

window.addEventListener('load', function () {
  var showMoreButtons = document.querySelectorAll('.show-more-btn');

  for (var i = 0; i < showMoreButtons.length; i++) {
    showMoreButtons[i].addEventListener('click', function (event) {
      toggleClass(event.target.parentElement.parentElement, 'show-all');
    });
  }
});