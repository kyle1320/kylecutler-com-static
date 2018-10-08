import Interaction from '../Interaction';

export default class DeleteInteraction extends Interaction {
  meetsConditions() {
    return this.controller.hovering || this.controller.selected;
  }

  handleKeyEvent(e) {
    switch (e.keyCode) {
    case 8:
    case 46:
      e.preventDefault();
      if (this.controller.selected) {
        this.controller.select(null, v => v.remove());
      } else {
        this.controller.hover(null, v => v.remove());
      }
      break;
    }
  }
}