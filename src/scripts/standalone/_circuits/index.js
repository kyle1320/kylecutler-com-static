import UI from './ui';

window.addEventListener('load', function () {
  var ui = new UI(
    document.getElementById('canvas'),
    document.getElementById('toolbar'),
    document.getElementById('sidebar')
  );
});