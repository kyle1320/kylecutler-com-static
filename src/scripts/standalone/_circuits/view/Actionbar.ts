import { EventEmitter } from 'events';
import { makeElement, toggleClass } from '../../../utils';
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

var defaultSections: Section[];

export default class Actionbar extends EventEmitter {
  private element: HTMLElement;
  private itemMap: {[id: string]: ActionItem};

  public selectedItem: string;
  public defaultItem: string;

  constructor(element: HTMLElement) {
    super();

    this.element = element;
    this.itemMap = {};

    this.addSections(defaultSections);

    this.defaultItem = 'select:tool';
  }

  public init() {
    this.selectItem(null);
  }

  public setEnabled(itemId: string, isEnabled: boolean) {
    var item = this.itemMap[itemId];

    if (item) {
      item.setEnabled(isEnabled);
    }
  }

  public isSelected(itemId: string): boolean {
    return this.itemMap[itemId].isSelected;
  }

  private addSections(sections: Section[]) {
    sections.forEach(section => {
      this.element.appendChild(section.wrapper);

      section.items.forEach(item => {
        item.on('click', () => this.handleClick(section.id, item));
        this.itemMap[section.id + ':' + item.name] = item;
      });
    });
  }

  // TODO: handle uniqueness, etc.
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

class Section {
  public id: string;
  public wrapper: HTMLElement;
  public header: HTMLElement;
  public content: HTMLElement;

  public groups: SectionGroup[];
  public items: ActionItem[];

  constructor (
    label: string,
    id: string,
    content: SectionGroup[]
  ) {
    this.id = id;
    this.header = makeElement(
      { className: 'actionbar__section__header' },
      label
    );
    this.content = makeElement(
      { className: 'actionbar__section__content' },
      content.map(group => group.element)
    );
    this.wrapper = makeElement(
      { className: 'actionbar__section' },
      [ this.header, this.content ]
    );

    this.groups = content;
    this.items = [];

    content.forEach(group => {
      group.items.forEach(item => {
        item.section = id;

        this.items.push(item);
      });
    });
  }
}

type SectionGroupStyle = 'columns' | 'normal';

class SectionGroup {
  public style: SectionGroupStyle;
  public element: HTMLElement;
  public items: ActionItem[];

  constructor(style: SectionGroupStyle, items: ActionItem[]) {
    this.style = style;
    this.items = items;
    this.element = makeElement(
      { className: 'actionbar__section__group '
        + 'actionbar__section__group--' + style },
      this.getInternalItems()
    );
  }

  getInternalItems() {
    if (this.style === 'columns') {
      var items: HTMLElement[] = [];
      var curColumn: HTMLElement = null;

      this.items.forEach(item => {
        if (curColumn) {
          curColumn.appendChild(item.element);
          items.push(curColumn);
          curColumn = null;
        } else {
          curColumn = makeElement({ className: 'column' });
          curColumn.appendChild(item.element);
        }
      });

      if (curColumn) {
        items.push(curColumn);
      }

      return items;
    } else {
      return this.items.map(item => item.element);
    }
  }
}

type ActionItemType = 'unique' | 'button' | 'toggle';
type ActionItemStyle = 'small' | 'large';

class ActionItem extends EventEmitter {
  public name: string;
  public type: ActionItemType;
  public section: string;
  public element: HTMLElement;

  public isSelected: boolean;
  public isEnabled: boolean;

  private constructor(
    name: string,
    type: ActionItemType,
    props: {[name: string]: string},
    content: string | [HTMLElement],
    style: ActionItemStyle
  ) {
    super();

    props = props || {};
    props.className = 'action-item '
      + (style ? 'action-item--' + style + ' ' : '')
      + (props.className ? props.className : '');

    this.name = name;
    this.type = type;
    this.element = makeElement(props, content, {
      click: () => this.isEnabled && this.emit('click')
    });

    this.isSelected = !!props.className.match(/selected/);
    this.isEnabled = true;
  }

  setSelected(isSelected: boolean) {
    this.isSelected = isSelected;
    toggleClass(this.element, 'selected', isSelected);
  }

  setEnabled(isEnabled: boolean) {
    this.isEnabled = isEnabled;
    toggleClass(this.element, 'disabled', !isEnabled);
  }

  static withIcon(
    name: string,
    type: ActionItemType,
    icon: string,
    title: string,
    style: ActionItemStyle
  ) {
    return new ActionItem(name, type, { className: icon, title }, '', style);
  }

  static withViewCanvas(
    name: string,
    type: ActionItemType,
    title: string,
    view: View
  ) {
    var canvas = makeElement({ tag: 'canvas', width: 30, height: 30 });

    drawViewOnPreviewCanvas(canvas, view);

    return new ActionItem(name, type, { title }, [canvas], 'large');
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

var circuitList: CircuitDefinition[] = [];
for (var name in circuits) {
  circuitList.push(circuits[name]);
}
defaultSections = [
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