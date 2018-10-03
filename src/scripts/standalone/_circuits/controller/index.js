import DebugInteraction from "./interactions/DebugInteraction";
import CreateInteraction from "./interactions/CreateInteraction";
import DeleteInteraction from "./interactions/DeleteInteraction";
import DragInteraction from "./interactions/DragInteraction";
import SelectInteraction from "./interactions/SelectInteraction";
import ZoomInteraction from "./interactions/ZoomInteraction";
import { diff } from "./treeUtils";

export default class Controller {
  constructor (canvas, toolbar, infobar) {
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.infobar = infobar;

    this.selectedTool = 'move';

    this.selectedTree = null;
    this.hoveringTree = null;

    this.topZIndex = 0;

    this.interactions = [
      new DebugInteraction(this),
      new DeleteInteraction(this),
      new SelectInteraction(this),
      new CreateInteraction(this),
      new DragInteraction(this),
      new ZoomInteraction(this)
    ];
  }

  // TODO: combine these two methods
  hover(tree, onChange) {
    if (this.hoveringTree === tree) return;

    diff(
      this.hoveringTree,
      tree,
      (x, adding) => {
        onChange && onChange(adding), x.setAttribute('hover', adding)
      }
    );

    this.hoveringTree = tree;
  }

  select(tree, onChange) {
    if (this.selectedTree === tree) return;

    diff(
      this.selectedTree,
      tree,
      (x, adding) => {
        onChange && onChange(adding), x.setAttribute('active', adding)
      }
    );

    this.selectedTree = tree;
  }

  move(el, dx, dy, shouldSnap) {
    el.setAttribute('zIndex', this.topZIndex) && this.topZIndex++;

    if (shouldSnap) el.move(Math.round(dx), Math.round(dy));
    else            el.move(dx, dy);
  }

  handleMouseEvent(e) {
    this.callInteractions(x => x.handleMouseEvent(e));
  }

  handleKeyEvent(e) {
    this.callInteractions(x => x.handleKeyEvent(e));
  }

  selectTool(tool) {
    if (tool.name === this.selectedTool) return;

    this.selectedTool = tool.name;
    this.canvas.canvas.style.cursor = tool.cursor;
    this.infobar.showInfo(tool.name);

    this.hover(null);
    this.select(null);

    this.callInteractions(x => x.handleSelectTool(tool));
  }

  selectCircuit(creator) {
    this.callInteractions(x => x.handleSelectCircuit(creator));
  }

  callInteractions(handler) {
    for (var i = 0; i < this.interactions.length; i++) {
      var interaction = this.interactions[i];

      if (!interaction.meetsConditions()) continue;

      if (handler(interaction) === false) break;
    }
  }
}