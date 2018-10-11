import { EventEmitter } from 'events';

const toolText: {[name: string]: string} = {
  point: 'Select an element to edit',
  drag: 'Drag an object or the grid to move it',
  debug: 'Move the cursor around to print information for debugging',
  zoomin: 'Click on the grid to zoom in',
  zoomout: 'Click on the grid to zoom out'
};

export default class Infobar extends EventEmitter {
  private element: HTMLElement;
  private generalText: string;
  private infoText: string;
  // private popupText: string;

  constructor (element: HTMLElement) {
    super();

    this.element = element;
  }

  public setGeneralText(text: string) {
    this.generalText = text;
    this.update();
  }

  public setInfoText(text: string) {
    this.infoText = text;
    this.update();
  }

  public showGenericToolInfo(toolName: string) {
    this.setGeneralText(toolText[toolName]);
  }

  private update() {
    this.element.textContent = this.infoText || this.generalText;
  }
}