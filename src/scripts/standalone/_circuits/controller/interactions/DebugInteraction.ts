import Interaction from '../Interaction';
import { PositionalEvent, Tool } from '../../model/types';
import View from '../../view/View';

export default class DebugInteraction extends Interaction {
  public handleMouseEvent(e: PositionalEvent) {
    console.log('Mouse Event', e);

    if (this.controller.selectedTool === 'debug') {
      this.controller.hoverTree(e.root);
    }
  }

  public handleKeyEvent(e: KeyboardEvent) {
    console.log('Key Event', e);
  }

  public handleSelectTool(tool: Tool) {
    console.log('Select Tool', tool);
  }

  public handleSelectViews(views: View[]) {
    console.log('Select Views', views);
  }
}