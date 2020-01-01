import moment from 'moment/src/moment';

window.addEventListener('load', function () {
  const yearEl = document.getElementById('year');
  const timeEl = document.getElementById('time');

  function update() {
    const now = moment();
    const year = now.year();
    const time = now.format('MMMM Do YYYY, h:mm:ss a');

    yearEl.textContent = year;
    timeEl.textContent = time;

    if (year === 2020) {
      yearEl.className = 'y2020';
    }

    setTimeout(update, 1001 - now.getMilliseconds % 1000);
  }

  update();
});