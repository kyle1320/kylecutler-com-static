import Interaction from '../Interaction';

export default class TouchInteraction extends Interaction {
  reset() {
    this.touchA = null;
    this.touchB = null;

    this.center = null;
    this.distance = 0;
  }

  handleMouseEvent(e) {
    if (!window.TouchEvent || !(e.event instanceof TouchEvent)) return;
    var touches = e.event.changedTouches;
    var ret;

    for (var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      switch (e.type) {
      case 'down':
        if (!this.touchA) {
          this.touchA = touch;
        } else if (
          !this.touchB
          && touch.identifier !== this.touchA.identifier
        ) {

          this.touchB = touch;
          this.update();

          // fake out the other interactions so they will cancel their behavior
          e.type = 'leave';
        }

        break;
      case 'move':
        if (touch.identifier === this.touchA.identifier) {
          this.touchA = touch;
        } else if (touch.identifier === this.touchB.identifier) {
          this.touchB = touch;
        }

        if (this.touchA && this.touchB) {
          var oldCenter = this.center;
          var oldDistance = this.distance;
          var canvas = this.controller.canvas;

          this.update();

          var { x, y } = canvas.getDimensions();
          canvas.move(
            x + (this.center.x - oldCenter.x) / canvas.attributes.scale,
            y + (this.center.y - oldCenter.y) / canvas.attributes.scale
          );
          var { x: cx, y: cy } = canvas.getCoord(this.center.x, this.center.y);
          canvas.zoomRel( this.distance / oldDistance, cx, cy );

          // prevent other interactions from handling this event
          ret = false;
        }
        break;
      case 'up':
        if (touch.identifier === this.touchA.identifier)  {
          this.touchA = this.touchB;
          this.touchB = null;
        } else if (touch.identifier === this.touchB.identifier) {
          this.touchB = null;
        }
        break;
      }
    }

    if (e.type === 'leave') {
      this.controller.hover(null);
    }

    return ret;
  }

  update() {
    var bounds = this.touchA.target.getBoundingClientRect();
    this.center = {
      x: (this.touchA.clientX + this.touchB.clientX) / 2 - bounds.x,
      y: (this.touchA.clientY + this.touchB.clientY) / 2 - bounds.y
    };

    var dx = this.touchA.clientX - this.touchB.clientX;
    var dy = this.touchA.clientY - this.touchB.clientY;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }
}