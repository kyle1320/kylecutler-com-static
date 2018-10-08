import Interaction from "../Interaction";

export default class ZoomInteraction extends Interaction {
  handleMouseEvent(e) {
    switch (e.type) {
      case 'down':
        if (this.controller.selectedTool === 'zoomin') {
          this.controller.canvas.zoomAbs(5, e.root.x, e.root.y);
        } else if (this.controller.selectedTool === 'zoomout') {
          this.controller.canvas.zoomAbs(-5, e.root.x, e.root.y);
        }

        break;
      case 'scroll':
        this.controller.canvas.zoomAbs(-e.event.deltaY / 20, e.root.x, e.root.y);
        break;
    }
  }
}