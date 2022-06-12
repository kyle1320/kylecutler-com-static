import { ElementContent } from '~/src/common/js/utils';

type Content = string | HTMLElement | HTMLElement[];

export default class Modal {
  private elements: {[name: string]: HTMLElement};

  public constructor(container: HTMLElement) {
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
      this.elements.modal = <div
        className='modal'
        onclick={(e: Event) => e.stopPropagation()}
        onkeydown={(e: Event) => e.stopPropagation()}>
        {[
          this.elements.header = <div className='modal__header'>
            {this.elements.title = <div className='modal__header__title' />}
            <div
              className='modal__header__close-btn fa fa-times'
              onclick={() => this.hideDialog()} />
          </div>,
          this.elements.content = <div className='modal__content' />,
          this.elements.footer = <div className='modal__footer' />
        ]}
      </div>
    );
  }

  public showTextboxDialog(
    title: string,
    info: string,
    content: ElementContent
  ) {
    this.setTitle(title);
    this.setContent([
      <p>{info}</p>,
      <textarea
        onfocus={(e: FocusEvent) => (e.target as HTMLTextAreaElement).select()}>
        {content}
      </textarea>
    ]);
    this.clearButtons();
    this.addButton('OK', 'confirm', () => this.hideDialog());
    this.showDialog();
  }

  public showTextboxInputDialog(
    title: string,
    placeholder: string,
    okLabel: string,
    onSubmit: (text: string) => boolean | void
  ) {
    var text = <textarea placeholder={placeholder} />;
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

  public showErrorDialog(title: string, content: ElementContent) {
    this.setTitle(title);
    this.setContent(<p>{content}</p>);
    this.clearButtons();
    this.addButton('OK', '', () => this.hideDialog());
    this.showDialog();
  }

  public showInfoDialog(title: string, content: string) {
    this.setTitle(title);
    this.setContent(content);
    this.clearButtons();
    this.addButton('OK', 'info', () => this.hideDialog());
    this.showDialog();
  }

  public setTitle(title: string) {
    this.elements.title.textContent = title;
  }

  public setContent(content: Content) {
    this.elements.content.innerHTML = '';
    if (typeof content === 'string') {
      this.elements.content.innerHTML = content;
    } else if (content instanceof Array) {
      content.forEach(el => this.elements.content.appendChild(el));
    } else {
      this.elements.content.appendChild(content);
    }
  }

  public clearButtons() {
    this.elements.footer.innerHTML = '';
  }

  public addButton(
    name: string,
    style: string,
    onclick: (event?: MouseEvent) => any
  ) {
    this.elements.footer.appendChild(<div
      className={'modal__footer__button' +
        (style ? ' modal__footer__button--' + style : '')}
      onclick={onclick}>{name}</div>);
  }

  public showDialog() {
    this.elements.container.className = 'modal-container show';
  }

  public hideDialog() {
    this.elements.container.className = 'modal-container';
  }
}