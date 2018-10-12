import { flatten } from './treeUtils';

import View from '../view/View';
import CanvasView from '../view/CanvasView';
import Infobar from '../view/Infobar';
import Modal from '../view/Modal';
import Serialize from '../view/serialize';

import { PositionalEvent, BasicTree, ActionEvent } from '../model/types';

import Interaction from './Interaction';
import DebugInteraction from './interactions/DebugInteraction';
import CreateInteraction from './interactions/CreateInteraction';
import DeleteInteraction from './interactions/DeleteInteraction';
import DragInteraction from './interactions/DragInteraction';
import SelectInteraction from './interactions/SelectInteraction';
import ZoomInteraction from './interactions/ZoomInteraction';
import ClipboardInteraction from './interactions/ClipboardInteraction';
import ExportImportInteraction from './interactions/ExportImportInteraction';
import MultiTouchInteraction from './interactions/MultiTouchInteraction';
import AutoSlideInteraction from './interactions/AutoSlideInteraction';
import NoHoverInteraction from './interactions/NoHoverInteraction';
import HelpInteraction from './interactions/HelpInteraction';
import Actionbar from '../view/Actionbar';

const infoText: {[name: string]: string} = {
  'select:tool': 'Select an element to edit',
  'drag:tool': 'Drag an object or the grid to move it',
  'create': 'Click the grid to create an object'
};

export default class Controller {
  public canvas: CanvasView;
  public actionbar: Actionbar;
  public infobar: Infobar;
  public modal: Modal;

  public selected: View[];
  public hovering: View[];

  private topZIndex: number;
  private interactions: Interaction[];

  constructor (
    canvas: CanvasView,
    actionbar: Actionbar,
    infobar: Infobar,
    modal: Modal
  ) {
    this.canvas = canvas;
    this.actionbar = actionbar;
    this.infobar = infobar;
    this.modal = modal;

    this.selected = null;
    this.hovering = null;

    this.topZIndex = 1;

    this.interactions = [
      new MultiTouchInteraction(this),
      new DeleteInteraction(this),
      new SelectInteraction(this),
      new CreateInteraction(this),
      new DragInteraction(this),
      new ZoomInteraction(this),
      new ClipboardInteraction(this),
      new ExportImportInteraction(this),
      new HelpInteraction(this),
      new AutoSlideInteraction(this),
      new NoHoverInteraction(this)
    ];

    if (process.env.NODE_ENV === 'development') {
      this.interactions.push(new DebugInteraction(this));
    }

    this.callInteractions(x => x.handleSelectViews(null));
  }

  public hoverTree(
    tree: BasicTree<View>,
    onChange?: (data: View, added: boolean) => void
  ) {
    var views = flatten(tree);
    views = views && views.filter(x => x !== this.canvas);
    this.hover(views, onChange);
  }

  // TODO: combine these two methods
  public hover(views: View[], onChange?: (data: View, added: boolean) => void) {
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

  public select(
    views: View[],
    onChange?: (data: View, added: boolean) => void
  ) {
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
    this.infobar.set(
      views ? (
        views.length
        + ' element'+ (views.length === 1 ? '' : 's')
        + ' selected'
      ) : '',
      1
    );
  }

  public addToSelection(
    views: View[],
    onChange?: (data: View, added: boolean) => void
  ) {
    this.select(setUnion(this.selected, views), onChange);
  }

  public move(el: View, dx: number, dy: number, shouldSnap?: boolean) {
    if (el.attributes.zIndex !== this.topZIndex) {
      this.topZIndex++;
      el.setAttribute('zIndex', this.topZIndex);
    }

    shouldSnap = shouldSnap || this.actionbar.isSelected('drag:snap');

    if (el === this.canvas) shouldSnap = false;

    if (shouldSnap) el.move(Math.round(dx), Math.round(dy));
    else            el.move(dx, dy);
  }

  public export() {
    var data = this.selected || this.canvas.getAll();
    return Serialize.serialize(data);
  }

  public import(text: string) {
    var data = Serialize.deserialize(text);
    data.forEach(view => this.canvas.addChild(view));
    this.select(data);
  }

  public handleActionEvent(e: ActionEvent) {
    if (e.type === 'select') {
      this.infobar.set(infoText[e.id] || infoText[e.section], 0);
    }

    this.callInteractions(x => x.handleActionEvent(e));
  }

  public handleMouseEvent(e: PositionalEvent) {
    this.callInteractions(x => x.handleMouseEvent(e));
  }

  public handleKeyEvent(e: KeyboardEvent) {
    this.callInteractions(x => x.handleKeyEvent(e));
  }

  private callInteractions(handler: (x: Interaction) => boolean | void) {
    for (var i = 0; i < this.interactions.length; i++) {
      var interaction = this.interactions[i];

      if (handler(interaction) === false) break;
    }
  }
}

function setUnion<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set([].concat(a || [], b || [])));
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