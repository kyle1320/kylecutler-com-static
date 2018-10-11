import { EventEmitter } from 'events';
import { makeElement } from '../../../utils';
import ActionItem from './ActionItem';

type SectionData = {
  name: string,
  content: HTMLElement,
  wrapper: HTMLElement
};

type SectionID = number;

export default class Actionbar extends EventEmitter {
  private element: HTMLElement;
  private sections: SectionData[];

  constructor(element: HTMLElement) {
    super();

    this.element = element;
    this.sections = [];
  }

  public addSection(name: string): SectionID {
    var header = makeElement({ className: 'actionbar__section__header' }, name);
    var content = makeElement({ className: 'actionbar__section__content' });
    var wrapper = makeElement(
      { className: 'actionbar__section hide' },
      [ header, content ]
    );

    this.sections.push({ name, content, wrapper });

    this.element.appendChild(wrapper);

    return this.sections.length - 1;
  }

  public addItem(sectionId: SectionID, item: ActionItem) {
    var section = this.sections[sectionId];
    var identifier = section.name + ':' + item.name;
    item.onClick(() => this.emit('action', identifier));
    section.wrapper.className = 'actionbar__section';
    section.content.appendChild(item.element);
  }
}