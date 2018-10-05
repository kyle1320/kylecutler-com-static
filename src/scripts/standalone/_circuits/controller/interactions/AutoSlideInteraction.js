import Interaction from "../Interaction";

export default class AutoSlideInteraction extends Interaction {
  reset() {
    this.stop();

    this.dx = 0;
    this.dy = 0;

    this.lastEvent = null;
  }

  handleMouseEvent(e) {
    if (e.event instanceof TouchEvent ? e.type === 'leave' : !e.event.buttons) {
      this.stop();
      return;
    }

    if (e.type !== 'move') return;

    e = e.event;

    this.lastEvent = e;

    var target, bounds, offsetX, offsetY;

    if (e instanceof TouchEvent) {
      var touch = e.changedTouches[0];
      target = touch.target;
      bounds = target.parentElement.getBoundingClientRect();
      offsetX = touch.clientX - bounds.x;
      offsetY = touch.clientY - bounds.y;
    } else {
      target = e.target;
      bounds = target.parentElement.getBoundingClientRect();
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    }

    var distXMin = offsetX - 50;
    var distXMax = bounds.width - offsetX - 50;
    var distYMin = offsetY - 50;
    var distYMax = bounds.height - offsetY - 50;

    var distX = distXMin < 0 ? -distXMin : distXMax < 0 ? distXMax : 0;
    var distY = distYMin < 0 ? -distYMin : distYMax < 0 ? distYMax : 0;

    if (distX === 0 && distY === 0) {
      this.stop();
      return;
    }

    this.start(distX, distY);
  }

  start(dx, dy) {
    this.dx = dx / this.controller.canvas.attributes.scale / 3;
    this.dy = dy / this.controller.canvas.attributes.scale / 3;

    if (!this.interval) {
      this.interval = setInterval(() => {
        var { x, y } = this.controller.canvas.getDimensions();
        this.controller.canvas.move(
          x + this.dx,
          y + this.dy
        );

        // I don't know exactly why, but this has the bonus effect
        // of preventing the canvas from sliding if it is being dragged.
        // Again, don't ask me why. But I'll take it.
        this.refireMouseEvent();
      }, 20);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = null;
  }

  refireMouseEvent() {
    if (!this.lastEvent) return;

    this.controller.canvas.canvas.dispatchEvent(this.lastEvent);
  }
}