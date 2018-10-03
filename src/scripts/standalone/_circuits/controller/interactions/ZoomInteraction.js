import Interaction from "../Interaction";

export default class ZoomInteraction extends Interaction {
  handleMouseEvent(e) {
    switch (e.type) {
      case 'down':
        if (this.controller.selectedTool === 'zoomin') {
          this.zoom(5, e.root.x, e.root.y);
        } else if (this.controller.selectedTool === 'zoomout') {
          this.zoom(-5, e.root.x, e.root.y);
        }

        break;
      case 'scroll':
        this.zoom(-e.event.deltaY / 20, e.root.x, e.root.y);
        break;
    }
  }

  zoom(delta, cx = 0, cy = 0) {
    var { x, y } = this.controller.canvas.getDimensions();
    var curScale = this.controller.canvas.attributes.scale;
    var newScale = Math.min(70, Math.max(5, curScale + delta));
    var factor = curScale / newScale;
    var offsetX = (cx + x) * (1 - factor);
    var offsetY = (cy + y) * (1 - factor);
    this.controller.canvas.move(x - offsetX, y - offsetY);
    this.controller.canvas.setAttribute('scale', newScale);
  }
}