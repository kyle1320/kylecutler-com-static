import { makeElement } from '../../../utils';

declare type Content = string | Node[] | Node;

export default class Modal {
  elements: {[name: string]: HTMLElement};

  constructor(container: HTMLElement) {
    this.elements = {
      container: container,
      modal: null,
      header: null,
      title: null,
      content: null,
      footer: null
    };

    this.elements.container.className = 'modal-container';
    this.elements.container.addEventListener('click', () => this.hideDialog());
    this.elements.container.appendChild(
      this.elements.modal = makeElement(
        { className: 'modal' },
        [
          this.elements.header = makeElement(
            { className: 'modal__header' },
            [
              this.elements.title = makeElement(
                { className: 'modal__header__title' }
              ),
              makeElement(
                { className: 'modal__header__close-btn fa fa-times' },
                '',
                { click: () => this.hideDialog() }
              )
            ]
          ),
          this.elements.content = makeElement({ className: 'modal__content' }),
          this.elements.footer = makeElement({ className: 'modal__footer' })
        ],
        {
          click: (e: Event) => e.stopPropagation(),
          keydown: (e: Event) => e.stopPropagation()
        }
      )
    );
  }

  showTextboxDialog(
    title: string,
    info: string,
    content: Content
  ) {
    this.setTitle(title);
    this.setContent([
      makeElement('p', info),
      makeElement('textarea', content, {
        focus: (e: MouseEvent) => (e.target as HTMLTextAreaElement).select()
      })
    ]);
    this.clearButtons();
    this.addButton('OK', 'confirm', () => this.hideDialog());
    this.showDialog();
  }

  showTextboxInputDialog(
    title: string,
    placeholder: string,
    okLabel: string,
    onSubmit: (text: string) => boolean | void
  ) {
    var text = makeElement({ tag: 'textarea', placeholder });
    this.setTitle(title);
    this.setContent(text);
    this.clearButtons();
    this.addButton('Cancel', 'error', () => this.hideDialog());
    this.addButton(okLabel, 'confirm', () => {
      if (onSubmit(text.value) !== false) {
        this.hideDialog();
      }
    });
    this.showDialog();
  }

  showErrorDialog(title: string, content: Content) {
    this.setTitle(title);
    this.setContent([makeElement('p', content)]);
    this.clearButtons();
    this.addButton('OK', '', () => this.hideDialog());
    this.showDialog();
  }

  setTitle(title: string) {
    this.elements.title.textContent = title;
  }

  setContent(content: Content) {
    this.elements.content.innerHTML = '';
    if (typeof content === 'string') {
      this.elements.content.innerHTML = content;
    } else if (content instanceof Array) {
      content.forEach(el => this.elements.content.appendChild(el));
    } else {
      this.elements.content.appendChild(content);
    }
  }

  clearButtons() {
    this.elements.footer.innerHTML = '';
  }

  addButton(name: string, style: string, onclick: (event?: MouseEvent) => any) {
    this.elements.footer.appendChild(makeElement(
      { className: 'modal__footer__button' +
        (style ? ' modal__footer__button--' + style : '')
      },
      name,
      { click: onclick }
    ));
  }

  showDialog() {
    this.elements.container.className = 'modal-container show';
  }

  hideDialog() {
    this.elements.container.className = 'modal-container';
  }
}