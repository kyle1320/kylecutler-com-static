import Interaction from '../Interaction';

export default class DeleteInteraction extends Interaction {
  public handleKeyEvent(e: KeyboardEvent) {
    switch (e.keyCode) {
    case 8:
    case 46:
      e.preventDefault();
      if (this.controller.selected) {
        this.controller.select(null, v => v.remove());
      } else if (this.controller.hovering) {
        this.controller.hover(null, v => v.remove());
      }
      break;
    }
  }
}