import Feature from '../Feature';
import { PositionalEvent, ActionEvent } from '../../model/types';
import View from '../../view/View';

export default class DebugFeature extends Feature {
  public handleActionEvent(e: ActionEvent) {
    if (!this.controller.actionbar.isSelected('debug:debug')) return;

    console.log('Action Event', e);
  }

  public handleMouseEvent(e: PositionalEvent) {
    if (!this.controller.actionbar.isSelected('debug:debug')) return;

    console.log('Mouse Event', e);
  }

  public handleKeyEvent(e: KeyboardEvent) {
    if (!this.controller.actionbar.isSelected('debug:debug')) return;

    console.log('Key Event', e);
  }

  public handleSelectViews(views: View[]) {
    if (!this.controller.actionbar.isSelected('debug:debug')) return;

    console.log('Select Views', views);
  }
}