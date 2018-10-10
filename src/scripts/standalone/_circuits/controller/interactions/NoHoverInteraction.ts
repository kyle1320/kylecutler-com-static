import Interaction from '../Interaction';
import { PositionalEvent } from '../../model/types';

// TODO: come up with a better name for this
export default class NoHoverInteraction extends Interaction {
  public handleMouseEvent(e: PositionalEvent): boolean | void {
    if (e.type === 'leave') {
      this.controller.hover(null);
    }
  }
}