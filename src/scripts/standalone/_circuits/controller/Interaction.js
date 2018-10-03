export default class Interaction {
  constructor (controller) {
    this.controller = controller;

    this.reset();
  }

  meetsConditions() {
    return true;
  }

  handleMouseEvent(e) {

  }

  handleKeyEvent(e) {

  }

  handleSelectTool(tool) {
    this.reset();
  }

  handleSelectCircuit(creator) {

  }

  reset() {

  }
}