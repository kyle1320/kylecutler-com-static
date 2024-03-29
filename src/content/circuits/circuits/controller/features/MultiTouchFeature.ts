import Feature from '../Feature';
import { PositionalEvent } from '../../model/types';

export default class MultiTouchFeature extends Feature {
  private touchA: Touch;
  private touchB: Touch;

  private center: { x: number; y: number };
  private distance: number;

  protected reset() {
    this.touchA = null;
    this.touchB = null;

    this.center = null;
    this.distance = 0;
  }

  public handleMouseEvent(e: PositionalEvent): boolean | void {
    if (!('TouchEvent' in window) || !(e.event instanceof TouchEvent)) return;
    const touches = e.event.changedTouches;
    let ret;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];

      switch (e.type) {
        case 'down':
          if (!this.touchA) {
            this.touchA = touch;
          } else if (
            !this.touchB &&
            touch.identifier !== this.touchA.identifier
          ) {
            this.touchB = touch;
            this.update();

            // fake out the other features so they will cancel their behavior
            e.type = 'leave';
          }

          break;
        case 'move':
          if (this.touchA && touch.identifier === this.touchA.identifier) {
            this.touchA = touch;
          } else if (
            this.touchB &&
            touch.identifier === this.touchB.identifier
          ) {
            this.touchB = touch;
          }

          if (this.touchA && this.touchB) {
            const oldCenter = this.center;
            const oldDistance = this.distance;
            const canvas = this.controller.canvas;

            this.update();

            const { x, y } = canvas.getDimensions();
            canvas.move(
              x + (this.center.x - oldCenter.x) / canvas.attributes.scale,
              y + (this.center.y - oldCenter.y) / canvas.attributes.scale
            );
            const { x: cx, y: cy } = canvas.getCoord(
              this.center.x,
              this.center.y
            );
            canvas.zoomRel(this.distance / oldDistance, cx, cy);

            // prevent other features from handling this event
            ret = false;
          }
          break;
        case 'up':
          if (this.touchA && touch.identifier === this.touchA.identifier) {
            this.touchA = this.touchB;
            this.touchB = null;
          } else if (
            this.touchB &&
            touch.identifier === this.touchB.identifier
          ) {
            this.touchB = null;
          }
          break;
      }
    }

    return ret;
  }

  private update() {
    this.center = {
      x: (this.touchA.clientX + this.touchB.clientX) / 2,
      y: (this.touchA.clientY + this.touchB.clientY) / 2
    };

    const dx = this.touchA.clientX - this.touchB.clientX;
    const dy = this.touchA.clientY - this.touchB.clientY;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }
}
