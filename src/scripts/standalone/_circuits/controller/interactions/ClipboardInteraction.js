import Interaction from '../Interaction';
import { serialize, deserialize } from '../../model/serialize';

export default class ClipboardInteraction extends Interaction {
  reset() {
    this.copiedData = null;
    this.offset = 1;
  }

  handleKeyEvent(e) {
    if (e.ctrlKey) {
      switch (e.key) {
      case 'c':
        if (this.controller.selected) {
          this.copiedData = serialize(this.controller.selected);
          this.offset = 1;
        }
        break;
      case 'v':
        if (this.copiedData) {
          var views = deserialize(this.copiedData);

          views.forEach(v => {
            var { x, y } = v.getDimensions();
            this.controller.move(v, x + this.offset, y + this.offset);
            this.controller.canvas.addChild(v);
          });

          this.controller.select(views);
          this.offset++;
        }
        break;
      }
    }
  }

  handleSelectTool(tool) {
    // don't reset
  }
}