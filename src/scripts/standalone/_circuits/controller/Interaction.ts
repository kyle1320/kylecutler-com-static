import { Tool, PositionalEvent } from '../model/types';

import View from '../view/View';
import Controller from './index';

export default class Interaction {
  protected controller: Controller

  constructor (controller: Controller) {
    this.controller = controller;

    this.reset();
  }

  public meetsConditions(): boolean {
    return true;
  }

  public handleMouseEvent(e: PositionalEvent): boolean | void {

  }

  public handleKeyEvent(e: KeyboardEvent): boolean | void {

  }

  public handleSelectTool(tool: Tool): boolean | void {
    this.reset();
  }

  public handleSelectViews(views: View[]): boolean | void {

  }

  protected reset() {

  }
}