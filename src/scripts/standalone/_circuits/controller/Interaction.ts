import { Tool, PositionalEvent } from '../model/types';

import View from '../view/View';
import Controller from './index';

export default class Interaction {
  controller: Controller

  constructor (controller: Controller) {
    this.controller = controller;

    this.reset();
  }

  meetsConditions(): boolean {
    return true;
  }

  handleMouseEvent(e: PositionalEvent): boolean | void {

  }

  handleKeyEvent(e: KeyboardEvent): boolean | void {

  }

  handleSelectTool(tool: Tool): boolean | void {
    this.reset();
  }

  handleSelectViews(views: View[]): boolean | void {

  }

  reset() {

  }
}