import Interaction from "../Interaction";

export default class DebugInteraction extends Interaction {
  handleMouseEvent(e) {
    console.log("Mouse Event", e);

    if (this.controller.selectedTool === 'debug') {
      this.controller.hoverTree(e.root);
    }
  }

  handleKeyEvent(e) {
    console.log("Key Event", e);
  }

  handleSelectTool(tool) {
    console.log("Select Tool", tool);
  }

  handleSelectViews(views) {
    console.log("Select Views", views);
  }
}