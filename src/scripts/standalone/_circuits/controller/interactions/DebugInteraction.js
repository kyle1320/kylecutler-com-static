import Interaction from "../Interaction";

export default class DebugInteraction extends Interaction {
  meetsConditions() {
    return this.controller.selectedTool === 'debug';
  }

  handleMouseEvent(e) {
    this.controller.hoverTree(e.root);
    console.log("Mouse Event", e);
  }

  handleKeyEvent(e) {
    console.log("Key Event", e);
  }

  handleSelectTool(tool) {
    console.log("Select Tool", tool);
  }

  handleSelectCircuit(creator) {
    console.log("Select Circuit", creator);
  }
}