import { Tool, PositionalEvent, ActionEvent } from '../model/types';

import View from '../view/View';
import Controller from './index';
import ActionItem from '../view/ActionItem';

export default abstract class Interaction {
  protected controller: Controller;

  private actionBarSection: number;
  protected actionBarItems: ActionItem[];

  constructor (controller: Controller) {
    this.controller = controller;

    this.reset();
  }

  protected initActionBar() {
    var sectionName = this.getActionBarSectionName();
    if (sectionName) {
      this.actionBarSection = this.controller.actionbar.addSection(sectionName);
      this.actionBarItems = this.getActionBarItems() || [];
      this.actionBarItems.forEach(item => {
        this.controller.actionbar.addItem(this.actionBarSection, item);
      });
    }
  }

  public meetsConditions(): boolean {
    return true;
  }

  public handleActionEvent(id: ActionEvent): boolean | void {

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

  protected getActionBarSectionName(): string {
    return null;
  }

  protected getActionBarItems(): ActionItem[] {
    return [];
  }
}