import Itembar from './Itembar';

const toolText = {
  point: 'Select an element to edit',
  drag: 'Drag an object or the grid to move it',
  debug: 'Move the cursor around to print information for debugging',
  zoomin: 'Click on the grid to zoom in',
  zoomout: 'Click on the grid to zoom out'
};

export default class Infobar extends Itembar {
  showGenericInfo(toolName) {
    this.clear();
    this.addInfoText(toolText[toolName]);
  }
}