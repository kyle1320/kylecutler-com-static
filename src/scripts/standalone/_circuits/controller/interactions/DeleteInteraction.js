import Interaction from "../Interaction";
import { traverse } from "../treeUtils";

export default class DeleteInteraction extends Interaction {
  meetsConditions() {
    return this.controller.hoveringTree || this.controller.selectedTree;
  }

  handleKeyEvent(e) {
    switch (e.keyCode) {
      case 8:
      case 46:
        e.preventDefault();
        if (this.controller.selectedTree) {
          traverse(this.controller.selectedTree, v => v.remove());
          this.controller.select(null);
        } else {
          traverse(this.controller.hoveringTree, v => v.remove());
          this.controller.hover(null);
        }
        break;
    }
  }
}