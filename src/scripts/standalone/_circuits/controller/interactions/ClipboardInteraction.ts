import Interaction from '../Interaction';
import Controller from '..';
import Serialize from '../../view/serialize';

export default class ClipboardInteraction extends Interaction {
  private copiedData: string;
  private offset: number;

  public constructor(controller: Controller) {
    super(controller);

    this.copiedData = null;
    this.offset = 1;
  }

  public handleKeyEvent(e: KeyboardEvent) {
    if (e.ctrlKey) {
      switch (e.key) {
      case 'c':
        if (this.controller.selected) {
          this.copiedData = Serialize.serialize(this.controller.selected);
          this.offset = 1;
        }
        break;
      case 'v':
        if (this.copiedData) {
          var views = Serialize.deserialize(this.copiedData);

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
}