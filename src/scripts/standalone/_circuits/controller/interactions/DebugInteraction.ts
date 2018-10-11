import Interaction from '../Interaction';
import { PositionalEvent, ActionEvent } from '../../model/types';
import View from '../../view/View';

export default class DebugInteraction extends Interaction {
  public handleActionEvent(e: ActionEvent) {
    console.log('Action Event', e);
  }

  public handleMouseEvent(e: PositionalEvent) {
    console.log('Mouse Event', e);
  }

  public handleKeyEvent(e: KeyboardEvent) {
    console.log('Key Event', e);
  }

  public handleSelectViews(views: View[]) {
    console.log('Select Views', views);
  }
}