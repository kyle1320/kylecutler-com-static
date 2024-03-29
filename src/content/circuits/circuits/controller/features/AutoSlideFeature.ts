import Feature from '../Feature';
import { PositionalEvent, Position } from '../../model/types';

type SavedEvent = {
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  buttons: 1;
};

export default class AutoSlideFeature extends Feature {
  private dx: number;
  private dy: number;

  private interval: NodeJS.Timer;
  private lastEvent: SavedEvent;
  private mousePressed: boolean;
  private dragOrigin: Position;

  protected reset() {
    this.stop();

    this.dx = 0;
    this.dy = 0;

    this.interval = null;
    this.lastEvent = null;
    this.mousePressed = false;
    this.dragOrigin = null;
  }

  public handleMouseEvent(e: PositionalEvent) {
    const ev = e.event;
    let target, bounds, offsetX, offsetY;

    if (isTouchEvent(ev)) {
      const touch = ev.changedTouches[0];
      target = touch.target;
      bounds = (
        target as HTMLElement
      ).parentElement.getBoundingClientRect() as DOMRect;
      offsetX = touch.clientX - bounds.x;
      offsetY = touch.clientY - bounds.y;

      this.setLastEvent(
        touch.screenX,
        touch.screenY,
        touch.clientX,
        touch.clientY
      );
    } else {
      target = ev.target;
      bounds = (
        target as HTMLElement
      ).parentElement.getBoundingClientRect() as DOMRect;
      offsetX = ev.offsetX;
      offsetY = ev.offsetY;

      this.setLastEvent(ev.screenX, ev.screenY, ev.clientX, ev.clientY);
    }

    if (e.type === 'down') {
      this.mousePressed = true;
      this.dragOrigin = { x: offsetX, y: offsetY };
    } else if (e.type === 'up') {
      this.mousePressed = false;
      this.dragOrigin = null;
    }

    if (isTouchEvent(ev) ? e.type === 'leave' : !this.mousePressed) {
      this.stop();
      return;
    }

    if (e.type !== 'move' || !this.mousePressed) return;

    const distXMin = Math.max(offsetX - this.dragOrigin.x, offsetX - 50);
    const distXMax = Math.max(
      this.dragOrigin.x - offsetX,
      bounds.width - offsetX - 50
    );
    const distYMin = Math.max(offsetY - this.dragOrigin.y, offsetY - 50);
    const distYMax = Math.max(
      this.dragOrigin.y - offsetY,
      bounds.height - offsetY - 50
    );

    const distX = distXMin < 0 ? -distXMin : distXMax < 0 ? distXMax : 0;
    const distY = distYMin < 0 ? -distYMin : distYMax < 0 ? distYMax : 0;

    if (distX === 0 && distY === 0) {
      this.stop();
      return;
    }

    this.start(distX, distY);
  }

  private start(dx: number, dy: number) {
    this.dx = dx / this.controller.canvas.attributes.scale / 3;
    this.dy = dy / this.controller.canvas.attributes.scale / 3;

    if (!this.interval) {
      this.interval = setInterval(() => {
        const { x, y } = this.controller.canvas.getDimensions();
        this.controller.canvas.move(x + this.dx, y + this.dy);

        // I don't know exactly why, but this has the bonus effect
        // of preventing the canvas from sliding if it is being dragged.
        // Again, don't ask me why. But I'll take it.
        this.refireMouseEvent();
      }, 20);
    }
  }

  private stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = null;
    this.lastEvent = null;
  }

  private setLastEvent(
    screenX: number,
    screenY: number,
    clientX: number,
    clientY: number
  ) {
    this.lastEvent = { screenX, screenY, clientX, clientY, buttons: 1 };
  }

  private refireMouseEvent() {
    if (!this.lastEvent) return;

    let event;

    if ('initMouseEvent' in MouseEvent.prototype) {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        'mousemove',
        false,
        true,
        window,
        0,
        this.lastEvent.screenX,
        this.lastEvent.screenY,
        this.lastEvent.clientX,
        this.lastEvent.clientY,
        false,
        false,
        false,
        false,
        1,
        null
      );
    } else {
      event = new MouseEvent('mousemove', this.lastEvent);
    }

    this.controller.canvas.canvas.dispatchEvent(event);
  }
}

function isTouchEvent(e: Event): e is TouchEvent {
  return 'TouchEvent' in window && e instanceof TouchEvent;
}
