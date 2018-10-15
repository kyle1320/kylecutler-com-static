import CanvasView from './view/CanvasView';
import Infobar from './view/Infobar';
import Modal from './view/Modal';

import Controller from './controller';
import Actionbar from './view/Actionbar';

window.addEventListener('load', function () {
  new Controller(
    getCanvasView(document.getElementById('canvas') as HTMLCanvasElement),
    new Actionbar(document.getElementById('actionbar')),
    new Infobar(document.getElementById('infobar')),
    new Modal(document.getElementById('modal'))
  );
});

function getCanvasView(canvasEl: HTMLCanvasElement): CanvasView {
  const canvasView = new CanvasView(canvasEl);

  function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;

    var rawWidth = canvasEl.parentElement.clientWidth;
    var rawHeight = canvasEl.parentElement.clientHeight;

    canvasEl.style.width = rawWidth + 'px';
    canvasEl.style.height = rawHeight + 'px';

    canvasEl.width = rawWidth * scale;
    canvasEl.height = rawHeight * scale;

    canvasView.drawBuffered();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  canvasView.on('update', canvasView.drawBuffered);

  return canvasView;
}