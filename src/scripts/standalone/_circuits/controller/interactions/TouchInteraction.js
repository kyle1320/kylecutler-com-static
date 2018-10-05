import Interaction from "../Interaction";

export default class TouchInteraction extends Interaction {
  handleMouseEvent(e) {
    if (e.type === 'leave') {
      this.controller.hover(null);
    }
  }
}