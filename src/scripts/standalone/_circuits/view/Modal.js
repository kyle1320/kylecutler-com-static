import { makeElement } from '../../../utils';

export default class Modal {
  constructor(container) {
    this.elements = {
      container: container,
      modal: null,
      header: null,
      title: null,
      content: null,
      footer: null
    };

    this.elements.container.className = "modal-container";
    this.elements.container.appendChild(
      this.elements.modal = makeElement({ className: "modal" }, [
        this.elements.header = makeElement({ className: "modal__header" }, [
          this.elements.title = makeElement({ className: "modal__header__title" }),
          makeElement({ className: "modal__header__close-btn fa fa-times" }, '', {
            click: () => this.hideDialog()
          })
        ]),
        this.elements.content = makeElement({ className: "modal__content" }),
        this.elements.footer = makeElement({ className: "modal__footer" })
      ])
    );
  }

  setTitle(title) {
    this.elements.title.textContent = title;
  }

  setContent(content) {
    this.elements.content.innerHTML = "";
    if (typeof content === 'string') {
      this.elements.content.innerHTML = content;
    } else if (content instanceof Array) {
      content.forEach(el => this.elements.content.appendChild(el))
    } else {
      this.elements.content.appendChild(el);
    }
  }

  clearButtons() {
    this.elements.footer.innerHTML = '';
  }

  addButton(name, style, onclick) {
    this.elements.footer.appendChild(makeElement(
      { className: `modal__footer__button${style ? " modal__footer__button--" + style : ""}` },
      name,
      { click: onclick }
    ));
  }

  setButtons(content) {
    if (typeof content === 'string') {
      this.elements.content.innerHTML = content;
    } else if (content instanceof Array) {
      content.forEach(el => this.elements.content.appendChild(el))
    } else {
      this.elements.content.appendChild(el);
    }
  }

  showDialog() {
    this.elements.container.className = "modal-container show";
  }

  hideDialog() {
    this.elements.container.className = "modal-container";
  }
}