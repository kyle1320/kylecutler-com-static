import Interaction from '../Interaction';
import { PositionalEvent, ActionEvent } from '../../model/types';

export default class ZoomInteraction extends Interaction {
  public handleActionEvent(e: ActionEvent) {
    switch (e.id) {
    case 'zoom:in':
      this.controller.canvas.zoomAbs(5, 0, 0);
      break;
    case 'zoom:out':
      this.controller.canvas.zoomAbs(-5, 0, 0);
      break;
    }
  }

  public handleMouseEvent(e: PositionalEvent) {
    switch (e.type) {
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