import Interaction from '../Interaction';
import { PositionalEvent } from '../../model/types';

export default class ZoomInteraction extends Interaction {
  public handleMouseEvent(e: PositionalEvent) {
    switch (e.type) {
    case 'down':
      if (this.controller.selectedTool === 'zoomin') {
        this.controller.canvas.zoomAbs(5, e.root.x, e.root.y);
      } else if (this.controller.selectedTool === 'zoomout') {
        this.controller.canvas.zoomAbs(-5, e.root.x, e.root.y);
      }

      break;
    case 'scroll':
      if (e.event instanceof WheelEvent) {
        this.controller.canvas.zoomAbs(
          -e.event.deltaY / 20,
          e.root.x,
          e.root.y
        );
      }
      break;
    }
  }
}