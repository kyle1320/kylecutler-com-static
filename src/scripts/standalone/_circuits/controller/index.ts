import { flatten } from './treeUtils';
import { serialize, deserialize } from '../model/serialize';

import View from '../view/View';
import CanvasView from '../view/CanvasView';
import Toolbar from '../view/Toolbar';
import Infobar from '../view/Infobar';
import Modal from '../view/Modal';

import { Tool, PositionalEvent, BasicTree } from '../model/types';

import Interaction from './Interaction';
import DebugInteraction from './interactions/DebugInteraction';
import CreateInteraction from './interactions/CreateInteraction';
import DeleteInteraction from './interactions/DeleteInteraction';
import DragInteraction from './interactions/DragInteraction';
import SelectInteraction from './interactions/SelectInteraction';
import ZoomInteraction from './interactions/ZoomInteraction';
import ClipboardInteraction from './interactions/ClipboardInteraction';
import ExportInteraction from './interactions/ExportImportInteraction';
import TouchInteraction from './interactions/TouchInteraction';
import AutoSlideInteraction from './interactions/AutoSlideInteraction';

export default class Controller {
  canvas: CanvasView;
  toolbar: Toolbar;
  infobar: Infobar;
  modal: Modal;

  selectedTool: string;

  selected: View[];
  hovering: View[];

  topZIndex: number;

  interactions: Interaction[];

  constructor (
    canvas: CanvasView,
    toolbar: Toolbar,
    infobar: Infobar,
    modal: Modal
  ) {
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.infobar = infobar;
    this.modal = modal;

    this.selectedTool = 'move';

    this.selected = null;
    this.hovering = null;

    this.topZIndex = 1;

    this.interactions = [
      new TouchInteraction(this),
      new DeleteInteraction(this),
      new SelectInteraction(this),
      new CreateInteraction(this),
      new DragInteraction(this),
      new ZoomInteraction(this),
      new ClipboardInteraction(this),
      new ExportInteraction(this),
      new AutoSlideInteraction(this)
    ];

    if (process.env.NODE_ENV === 'development') {
      this.interactions.push(new DebugInteraction(this));
    }
  }

  hoverTree(
    tree: BasicTree<View>,
    onChange?: (data: View, added: boolean) => void
  ) {
    var views = flatten(tree);
    views = views && views.filter(x => x !== this.canvas);
    this.hover(views, onChange);
  }

  // TODO: combine these two methods
  hover(views: View[], onChange?: (data: View, added: boolean) => void) {
    if (views && !views.length) views = null;

    if (this.hovering === views) return;

    setDiff(
      this.hovering,
      views,
      (x, adding) => {
        onChange && onChange(x, adding), x.setAttribute('hover', adding);
      }
    );

    this.hovering = views;
  }

  select(views?: View[], onChange?: (data: View, added: boolean) => void) {
    if (views && !views.length) views = null;

    if (this.selected === views) return;

    setDiff(
      this.selected,
      views,
      (x, adding) => {
        onChange && onChange(x, adding), x.setAttribute('active', adding);
      }
    );

    this.selected = views;

    this.callInteractions(x => x.handleSelectViews(views));
  }

  move(el: View, dx: number, dy: number, shouldSnap?: boolean) {
    if (el.attributes.zIndex !== this.topZIndex) {
      this.topZIndex++;
      el.setAttribute('zIndex', this.topZIndex);
    }

    if (shouldSnap) el.move(Math.round(dx), Math.round(dy));
    else            el.move(dx, dy);
  }

  export() {
    var data = this.selected || this.canvas.getAll();
    return serialize(data);
  }

  import(text: string) {
    var data = deserialize(text);
    data.forEach(view => this.canvas.addChild(view));
    this.select(data);
  }

  handleMouseEvent(e: PositionalEvent) {
    this.callInteractions(x => x.handleMouseEvent(e));
  }

  handleKeyEvent(e: KeyboardEvent) {
    this.callInteractions(x => x.handleKeyEvent(e));
  }

  selectTool(tool: Tool) {
    if (tool.name === this.selectedTool) return;

    if (!tool.isAction) {
      this.selectedTool = tool.name;
      this.canvas.canvas.style.cursor = tool.cursor;

      this.infobar.showGenericInfo(tool.name);

      this.hover(null);
      // this.select(null);
    }

    this.callInteractions(x => x.handleSelectTool(tool));
  }

  callInteractions(handler: (x: Interaction) => boolean | void) {
    for (var i = 0; i < this.interactions.length; i++) {
      var interaction = this.interactions[i];

      if (!interaction.meetsConditions()) continue;

      if (handler(interaction) === false) break;
    }
  }

  addToSelection(
    views: View[],
    onChange?: (data: View, added: boolean) => void
  ) {
    this.select(setUnion(this.selected, views), onChange);
  }
}

function setUnion<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set([].concat(a, b)));
}

function setDiff<T>(
  before: T[],
  after: T[],
  onChange: (data: T, added: boolean) => void
) {
  var beforeSet = new Set(before);
  var afterSet = new Set(after);
  var all = new Set(([] as T[]).concat(before || [], after || []));

  for (var item of all) {
    var isOld = beforeSet.has(item);
    var isNew = afterSet.has(item);

    if (isOld !== isNew) {
      onChange(item, isNew);
    }
  }
}