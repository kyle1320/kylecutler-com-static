import { flatten } from './treeUtils';

import View from '../view/View';
import CanvasView from '../view/CanvasView';
import Actionbar from '../view/Actionbar';
import Infobar from '../view/Infobar';
import Modal from '../view/Modal';
import Serialize from '../view/serialize';

import {
  PositionalEventType,
  PositionalEvent,
  PositionalTree,
  BasicTree,
  ActionEvent
} from '../model/types';

import Feature from './Feature';
import DebugFeature from './features/DebugFeature';
import CreateFeature from './features/CreateFeature';
import DeleteFeature from './features/DeleteFeature';
import DragFeature from './features/DragFeature';
import SelectFeature from './features/SelectFeature';
import ZoomFeature from './features/ZoomFeature';
import ClipboardFeature from './features/ClipboardFeature';
import ExportImportFeature from './features/ExportImportFeature';
import MultiTouchFeature from './features/MultiTouchFeature';
import AutoSlideFeature from './features/AutoSlideFeature';
import NoHoverFeature from './features/NoHoverFeature';
import HelpFeature from './features/HelpFeature';

const infoText: {[name: string]: string} = {
  'select:tool': 'Select an element to edit',
  'drag:tool': 'Drag an object or the grid to move it',
  'create': 'Click the grid to create an object'
};

const eventTypeMap:
{[name: string]: PositionalEventType | PositionalEventType[]} = {
  'mouseup': 'up',
  'mousedown': 'down',
  'mousemove': 'move',
  'mouseenter': 'enter',
  'mouseleave': 'leave',
  'wheel': 'scroll',
  'touchstart': ['enter', 'down'],
  'touchend': ['up', 'leave'],
  'touchmove': 'move'
};

export default class Controller {
  public canvas: CanvasView;
  public actionbar: Actionbar;
  public infobar: Infobar;
  public modal: Modal;

  public selected: View[];
  public hovering: View[];

  private topZIndex: number;
  private features: Feature[];

  public constructor (
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

    this.features = [
      new MultiTouchFeature(this),
      new DeleteFeature(this),
      new SelectFeature(this),
      new CreateFeature(this),
      new DragFeature(this),
      new ZoomFeature(this),
      new ClipboardFeature(this),
      new ExportImportFeature(this),
      new HelpFeature(this),
      new AutoSlideFeature(this),
      new NoHoverFeature(this)
    ];

    if (process.env.NODE_ENV === 'development') {
      this.features.push(new DebugFeature(this));
    }

    this.handleActionEvent = this.handleActionEvent.bind(this);
    this.handleMouseEvent  = this.handleMouseEvent.bind(this);
    this.handleTouchEvent  = this.handleTouchEvent.bind(this);
    this.handleKeyEvent    = this.handleKeyEvent.bind(this);

    actionbar.on('action', this.handleActionEvent);

    canvas.canvas.addEventListener('mousedown',  this.handleMouseEvent);
    canvas.canvas.addEventListener('mouseup',    this.handleMouseEvent);
    canvas.canvas.addEventListener('mousemove',  this.handleMouseEvent);
    canvas.canvas.addEventListener('mouseenter', this.handleMouseEvent);
    canvas.canvas.addEventListener('mouseleave', this.handleMouseEvent);
    canvas.canvas.addEventListener('wheel',      this.handleMouseEvent);

    canvas.canvas.addEventListener('touchstart', this.handleTouchEvent);
    canvas.canvas.addEventListener('touchend',   this.handleTouchEvent);
    canvas.canvas.addEventListener('touchmove',  this.handleTouchEvent);

    window.addEventListener('keydown', this.handleKeyEvent);

    canvas.canvas.oncontextmenu = () => false;

    this.addDefaultItems();
    actionbar.init();

    this.notifyFeatures(x => x.handleSelectViews(null));

    canvas.drawBuffered();
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

    this.notifyFeatures(x => x.handleSelectViews(views));
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

  public move(
    el: View,
    dx: number,
    dy: number,
    shouldSnap?: boolean,
    snapOverride?: boolean
  ) {
    if (el.attributes.zIndex !== this.topZIndex) {
      this.topZIndex++;
      el.setAttribute('zIndex', this.topZIndex);
    }

    shouldSnap = shouldSnap || this.actionbar.isSelected('drag:snap');

    if (el === this.canvas) shouldSnap = false;

    if (typeof snapOverride !== 'undefined') {
      shouldSnap = snapOverride;
    }

    if (shouldSnap) el.move(Math.round(dx), Math.round(dy));
    else            el.move(dx, dy);
  }

  public export() {
    var data = this.selected || this.canvas.getAll();
    return Serialize.serialize(data);
  }

  public import(text: string, select: boolean = true) {
    var data = Serialize.deserialize(text);
    data.forEach(view => this.canvas.addChild(view));

    if (select) this.select(data);
  }

  private handleMouseEvent(event: MouseEvent) {
    event.preventDefault();

    this.dispatchPositionalEvent(
      event, event.offsetX, event.offsetY
    );
  }

  private handleTouchEvent(event: TouchEvent) {
    event.preventDefault();

    var touch = event.changedTouches[0];
    var bounds = (touch.target as HTMLElement)
      .getBoundingClientRect() as DOMRect;

    this.dispatchPositionalEvent(
      event, touch.clientX - bounds.x, touch.clientY - bounds.y
    );
  }

  private dispatchPositionalEvent(
    event: MouseEvent | WheelEvent | TouchEvent,
    x: number,
    y: number,
    type?: PositionalEventType | PositionalEventType[],
    root?: PositionalTree
  ) {
    if (!type) type = eventTypeMap[event.type];
    if (!root) root = this.canvas.findAll(x, y);

    if (type instanceof Array) {
      type.forEach(t => this.dispatchPositionalEvent(event, x, y, t, root));
      return;
    }

    var e: PositionalEvent = { event, x, y, type, root };
    this.notifyFeatures(x => x.handleMouseEvent(e));
  }

  private handleActionEvent(e: ActionEvent) {
    if (e.type === 'select') {
      this.infobar.set(infoText[e.id] || infoText[e.section], 0);
    }

    this.notifyFeatures(x => x.handleActionEvent(e));
  }

  private handleKeyEvent(e: KeyboardEvent) {
    this.notifyFeatures(x => x.handleKeyEvent(e));
  }

  private notifyFeatures(handler: (x: Feature) => boolean | void) {
    for (var i = 0; i < this.features.length; i++) {
      var feature = this.features[i];

      if (handler(feature) === false) break;
    }
  }

  private addDefaultItems() {
    // eslint-disable-next-line max-len
    this.import('{"o":[["n",1,1],["n",1,7],["c",3,3,0,"Not"],["c",3,5,0,"Not"],["c",6,1,0,"And"],["c",6,5,0,"And"],["c",10,3,0,"Or"],["n",14,4]],"c":[[[0],[4,0]],[[1],[2,0]],[[0],[3,0]],[[1],[5,1]],[[2,1],[4,1]],[[3,1],[5,0]],[[4,2],[6,0]],[[5,2],[6,1]],[[6,2],[7]]]}', false);
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