import Interaction from '../Interaction';
import { PositionalEvent, Tool } from '../../model/types';
import View from '../../view/View';

export default class DebugInteraction extends Interaction {
  handleMouseEvent(e: PositionalEvent) {
    console.log('Mouse Event', e);

    if (this.controller.selectedTool === 'debug') {
      this.controller.hoverTree(e.root);
    }
  }

  handleKeyEvent(e: KeyboardEvent) {
    console.log('Key Event', e);
  }

  handleSelectTool(tool: Tool) {
    console.log('Select Tool', tool);
  }

  handleSelectViews(views: View[]) {
    console.log('Select Views', views);
  }
}