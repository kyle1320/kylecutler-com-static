import EventEmitter from '../utils/EventEmitter';
import { makeElement, toggleClass } from '../../../_utils';
import View from './View';
import NodeView from './NodeView';
import Node from '../model/Node';

import circuits from '../model/circuits';
import {
  CircuitDefinition,
  ActionEvent,
  ActionEventType
} from '../model/types';
import CircuitView from './CircuitView';
import Circuit from '../model/Circuit';

export default class Actionbar extends EventEmitter<{
  action: ActionEvent
  }> {
  private itemMap: {[id: string]: ActionItem};
  private element: DynamicContent;

  public selectedItem: string;
  public defaultItem: string;

  public constructor(element: HTMLElement) {
    super();

    var sections = getDefaultSections();
    this.itemMap = {};

    this.element = new DynamicContent(element, sections);

    sections.forEach(section => {
      section.items.forEach(item => {
        item.on('click', () => this.handleClick(section.id, item));
        this.itemMap[section.id + ':' + item.name] = item;
      });
    });

    this.defaultItem = 'select:tool';
  }

  public init() {
    this.element.init();
    this.selectItem(null);
  }

  public setEnabled(itemId: string, isEnabled: boolean) {
    var item = this.itemMap[itemId];

    if (item) {
      item.setEnabled(isEnabled);
    }
  }

  public setVisible(itemId: string, isVisible: boolean) {
    var item = this.itemMap[itemId];

    if (item) {
      item.setVisible(isVisible);
    }
  }

  public isSelected(itemId: string): boolean {
    return this.itemMap[itemId].isSelected;
  }

  private handleClick(section: string, item: ActionItem) {
    var id = section + ':' + item.name;

    switch (item.type) {
    case 'button':
      this.emit('action', createActionEventFromId('click', id));
      break;
    case 'toggle':
      this.toggleItem(id);
      break;
    case 'unique':
      this.selectItem(id);
      break;
    }
  }

  private toggleItem(id: string) {
    var item = this.itemMap[id];

    if (item) {
      item.setSelected(!item.isSelected);

      this.emit('action', createActionEventFromId('toggle', id));
    }
  }

  private selectItem(id: string) {
    if (!this.itemMap[id]) {
      id = null;
    }

    if (!id || this.selectedItem === id) {
      id = this.defaultItem;
    }

    if (this.selectedItem === id) {
      return;
    }

    if (this.selectedItem) {
      this.emit('action',
        createActionEventFromId('deselect', this.selectedItem)
      );

      this.itemMap[this.selectedItem].setSelected(false);
    }

    this.selectedItem = id;

    if (this.selectedItem) {
      this.itemMap[id].setSelected(true);

      this.emit('action', createActionEventFromId('select', id));
    }
  }
}

class DynamicContent extends EventEmitter<{
  'visibility-change': void,
  click: void
  }> {
  private isVisible: boolean;
  private children: DynamicContent[];

  public element: HTMLElement;
  private content: HTMLElement;

  public constructor(
    element: HTMLElement,
    children: DynamicContent[] = [],
    content: HTMLElement = element
  ) {
    super();

    this.isVisible = true;
    this.children = children;
    this.element = element;
    this.content = content;

    children.forEach(
      x => x.on('visibility-change', () => this.render())
    );
  }

  public init() {
    this.children.forEach(child => child.init());
    this.render();
  }

  protected render() {
    if (!this.children.length) return;

    while (this.content.firstChild) {
      this.content.removeChild(this.content.firstChild);
    }

    var items = this.children
      .filter(item => item.isVisible)
      .map(item => item.element);

    if (items.length > 0) {
      this.formatContents(items).forEach(el => this.content.appendChild(el));
    }

    this.setVisible(items.length > 0);
  }

  protected formatContents(elements: HTMLElement[]): HTMLElement[] {
    return elements;
  }

  public setVisible(isVisible: boolean) {
    if (this.isVisible === isVisible) return;

    this.isVisible = isVisible;
    this.emit('visibility-change');
  }
}

class Section extends DynamicContent {
  public id: string;

  public items: ActionItem[];

  public constructor (
    label: string,
    id: string,
    groups: SectionGroup[]
  ) {
    var header = <div className='actionbar__section__header'>{label}</div>;
    var content = <div className='actionbar__section__content'>
      {groups.map(group => group.element)}
    </div>;
    var wrapper = <div className='actionbar__section'>{[header, content]}</div>;

    super(wrapper, groups, content);

    this.id = id;
    this.items = [].concat.apply([], groups.map(group => group.items));
  }
}

type SectionGroupStyle = 'columns' | 'normal';

class SectionGroup extends DynamicContent {
  public style: SectionGroupStyle;
  public items: ActionItem[];

  public constructor(style: SectionGroupStyle, items: ActionItem[]) {
    super(
      <div className={'actionbar__section__group '
        + 'actionbar__section__group--' + style} />,
      items
    );

    this.style = style;
    this.items = items;
  }

  protected formatContents(elements: HTMLElement[]): HTMLElement[] {
    if (this.style === 'normal') return super.formatContents(elements);

    var columns: HTMLElement[] = [];
    var curColumn: HTMLElement = null;

    elements.forEach(el => {
      if (curColumn) {
        curColumn.appendChild(el);
        curColumn = null;
      } else {
        curColumn = <div className='column'/>;
        curColumn.appendChild(el);
        columns.push(curColumn);
      }
    });

    return columns;
  }
}

type ActionItemType = 'unique' | 'button' | 'toggle';
type ActionItemStyle = 'small' | 'large';

class ActionItem extends DynamicContent {
  public name: string;
  public type: ActionItemType;

  public isSelected: boolean;
  public isEnabled: boolean;

  private constructor(
    name: string,
    type: ActionItemType,
    props: {[name: string]: string},
    style: ActionItemStyle,
    ...content: (string | HTMLElement)[]
  ) {
    props = props || {};
    props.className = 'action-item '
      + (style ? 'action-item--' + style + ' ' : '')
      + (props.className ? props.className : '');

    super(
      <div
        onclick={() => this.isEnabled && this.emit('click')}
        onmousedown={(e: MouseEvent) => e.preventDefault()}
        {...props}>{content}</div>
    );

    this.name = name;
    this.type = type;

    this.isSelected = !!props.className.match(/selected/);
    this.isEnabled = !props.className.match(/disabled/);
  }

  public setSelected(isSelected: boolean) {
    this.isSelected = isSelected;
    toggleClass(this.element, 'selected', isSelected);
  }

  public setEnabled(isEnabled: boolean) {
    this.isEnabled = isEnabled;
    toggleClass(this.element, 'disabled', !isEnabled);
  }

  public static withIcon(
    name: string,
    type: ActionItemType,
    icon: string,
    title: string,
    style: ActionItemStyle
  ) {
    return new ActionItem(name, type, { className: icon, title }, style);
  }

  public static withViewCanvas(
    name: string,
    type: ActionItemType,
    title: string,
    view: View
  ) {
    var canvas = <canvas width={30} height={30} />;

    drawViewOnPreviewCanvas(canvas, view);

    return new ActionItem(name, type, { title }, 'large', canvas);
  }
}

function drawViewOnPreviewCanvas(canvas: HTMLCanvasElement, view: View) {
  var size = 30 * (window.devicePixelRatio || 1);

  canvas.width = size;
  canvas.height = size;

  var dim = view.getDimensions();
  var context = canvas.getContext('2d');
  var scale = Math.min(size*.5, size*.8 / Math.max(dim.width, dim.height));
  var drawWidth = scale * dim.width;
  var drawHeight = scale * dim.height;
  var drawX = (size - drawWidth) / 2;
  var drawY = (size - drawHeight) / 2;

  context.lineWidth = 0.1;

  context.transform(
    scale, 0, 0, scale, drawX, drawY
  );

  view.draw(context);
}

function createActionEventFromId(
  type: ActionEventType,
  id: string
): ActionEvent {
  var [section, name] = id.split(':');
  return { type, section, name, id };
}

function getDefaultSections(): Section[] {
  var circuitList: CircuitDefinition[] = [];
  for (var name in circuits) {
    circuitList.push(circuits[name]);
  }

  var defaultSections = [
    new Section('Select', 'select', [
      new SectionGroup('normal', [
        ActionItem.withIcon(
          'tool', 'unique', 'fa fa-mouse-pointer', 'Select Items', 'large'
        )
      ]),
      new SectionGroup('columns', [
        ActionItem.withIcon(
          'all', 'button', 'fa fa-check-double', 'Select All', 'small'
        ),
        ActionItem.withIcon(
          'rotate', 'button',
          'fa fa-undo fa-flip-horizontal', 'Rotate 90°', 'small'
        ),
        ActionItem.withIcon(
          'delete', 'button', 'fa fa-trash', 'Delete', 'small'
        ),
        ActionItem.withIcon(
          'cancel', 'button', 'fa fa-times', 'Cancel', 'small'
        )
      ])
    ]),
    new Section('Drag', 'drag', [
      new SectionGroup('normal', [
        ActionItem.withIcon(
          'tool', 'unique',
          'fa fa-hand-rock', 'Drag Elements or the Grid', 'large'
        )
      ]),
      new SectionGroup('columns', [
        ActionItem.withIcon(
          'snap', 'toggle', 'fa fa-expand', 'Snap to Grid', 'small'
        )
      ])
    ]),
    new Section('Create', 'create', [
      new SectionGroup('normal', [
        ActionItem.withViewCanvas(
          'Node', 'unique', 'Node', new NodeView(new Node(), 0, 0)
        )
      ].concat(circuitList.map(def => ActionItem.withViewCanvas(
        def.key, 'unique', def.key, new CircuitView(new Circuit(def), 0, 0)
      ))))
    ]),
    new Section('Zoom', 'zoom', [
      new SectionGroup('columns', [
        ActionItem.withIcon(
          'in', 'button', 'fa fa-search-plus', 'Zoom In', 'small'
        ),
        ActionItem.withIcon(
          'out', 'button', 'fa fa-search-minus', 'Zoom Out', 'small'
        )
      ])
    ]),
    new Section('Data', 'data', [
      new SectionGroup('columns', [
        ActionItem.withIcon(
          'export', 'button', 'fa fa-save', 'Export Data', 'small'
        ),
        ActionItem.withIcon(
          'import', 'button', 'fa fa-folder-open', 'Import Data', 'small'
        )
      ])
    ]),
    new Section('Help', 'help', [
      new SectionGroup('columns', [
        ActionItem.withIcon(
          'show', 'button', 'fa fa-question-circle', 'Show Help Dialog', 'small'
        )
      ])
    ])
  ];

  if (__DEBUG__) {
    defaultSections.push(new Section('Debug', 'debug', [
      new SectionGroup('columns', [
        ActionItem.withIcon(
          'debug', 'toggle', 'fa fa-bug', 'Toggle Debugging', 'small'
        )
      ])
    ]));
  }

  return defaultSections;
}