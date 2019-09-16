import 'utils/obfuscate';

import { toggleClass } from 'utils';

window.addEventListener('load', function () {
  var printBtn = document.getElementById('print-btn');
  var showMoreButtons = document.querySelectorAll('.show-more-btn');

  document.getElementById('resume').className = 'resume show';

  printBtn.addEventListener('click', () => window.print());

  for (var i = 0; i < showMoreButtons.length; i++) {
    showMoreButtons[i].addEventListener('click', function (event) {
      toggleClass(event.target.parentElement.parentElement, 'show-all');
    });
  }
});