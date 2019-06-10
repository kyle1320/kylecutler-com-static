export default class Infobar {
  private element: HTMLElement;
  private data: {text: string, priority: number}[];

  public constructor (element: HTMLElement) {
    this.element = element;
    this.data = [];
  }

  public set(text: string, priority: number) {
    var i;
    var replace = false;

    for (i = 0; i < this.data.length; i++) {
      if (this.data[i].priority === priority) {
        this.data[i].text = text;
        replace = true;
        break;
      }
      if (this.data[i].priority >= priority) {
        break;
      }
    }

    if (i >= 0) {
      if (text) {
        this.data.splice(i, replace ? 1 : 0, { text, priority });
      } else {
        this.data.splice(i, replace ? 1 : 0);
      }
    }

    this.update();
  }

  private update() {
    if (this.data.length) {
      this.element.textContent = this.data[this.data.length - 1].text;
    }
  }
}