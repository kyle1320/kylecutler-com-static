import { PositionalEvent, ActionEvent } from '../model/types';

import View from '../view/View';
import Controller from '.';

export default abstract class Feature {
  protected controller: Controller;

  public constructor (controller: Controller) {
    this.controller = controller;

    this.reset();
  }

  public handleActionEvent(id: ActionEvent): boolean | void {

  }

  public handleMouseEvent(e: PositionalEvent): boolean | void {

  }

  public handleKeyEvent(e: KeyboardEvent): boolean | void {

  }

  public handleSelectViews(views: View[]): boolean | void {

  }

  protected reset() {

  }
}