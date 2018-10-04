import DebugInteraction from "./interactions/DebugInteraction";
import CreateInteraction from "./interactions/CreateInteraction";
import DeleteInteraction from "./interactions/DeleteInteraction";
import DragInteraction from "./interactions/DragInteraction";
import SelectInteraction from "./interactions/SelectInteraction";
import ZoomInteraction from "./interactions/ZoomInteraction";
import { flatten } from "./treeUtils";
import ClipboardInteraction from "./interactions/ClipboardInteraction";
import ExportInteraction from "./interactions/ExportImportInteraction";
import { serialize, deserialize } from "../model/serialize";

export default class Controller {
  constructor (canvas, toolbar, infobar, modal) {
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.infobar = infobar;
    this.modal = modal;

    this.selectedTool = 'move';

    this.selected = null;
    this.hovering = null;

    this.topZIndex = 0;

    this.interactions = [
      new DebugInteraction(this),
      new DeleteInteraction(this),
      new SelectInteraction(this),
      new CreateInteraction(this),
      new DragInteraction(this),
      new ZoomInteraction(this),
      new ClipboardInteraction(this),
      new ExportInteraction(this)
    ];
  }

  // TODO: combine these two methods
  hover(tree, onChange) {
    var views = flatten(tree);
    views = views && views.filter(x => x !== this.canvas);
    if (views && !views.length) views = null;

    if (this.hovering === views) return;

    setDiff(
      this.hovering,
      views,
      (x, adding) => {
        onChange && onChange(x, adding), x.setAttribute('hover', adding)
      }
    );

    this.hovering = views;
  }

  select(tree, onChange) {
    var views = flatten(tree);
    views = views && views.filter(x => x !== this.canvas);
    this.selectRaw(views, onChange);
  }

  selectRaw(views, onChange) {
    if (views && !views.length) views = null;

    if (this.selected === views) return;

    setDiff(
      this.selected,
      views,
      (x, adding) => {
        onChange && onChange(x, adding), x.setAttribute('active', adding)
      }
    );

    this.selected = views;

    this.infobar.showInfo('point', views);
  }

  move(el, dx, dy, shouldSnap) {
    el.setAttribute('zIndex', this.topZIndex) && this.topZIndex++;

    if (shouldSnap) el.move(Math.round(dx), Math.round(dy));
    else            el.move(dx, dy);
  }

  export() {
    var data = this.selected || this.canvas.getAll().children.map(x => x.view);
    return serialize(data);
  }

  import(text) {
    var data = deserialize(text);
    data.forEach(view => this.canvas.addChild(view));
    this.selectRaw(data);
  }

  handleMouseEvent(e) {
    this.callInteractions(x => x.handleMouseEvent(e));
  }

  handleKeyEvent(e) {
    this.callInteractions(x => x.handleKeyEvent(e));
  }

  selectTool(tool) {
    if (tool.name === this.selectedTool) return;

    if (!tool.isAction) {
      this.selectedTool = tool.name;
      this.canvas.canvas.style.cursor = tool.cursor;

      this.infobar.showInfo(tool.name);

      this.hover(null);
      // this.select(null);
    }

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

function setDiff(before, after, onChange) {
  var beforeSet = new Set(before);
  var afterSet = new Set(after);
  var all = new Set([].concat(before || [], after || []));

  for (var item of all) {
    var isOld = beforeSet.has(item);
    var isNew = afterSet.has(item);

    if (isOld !== isNew) {
      onChange(item, isNew);
    }
  }
}