type Callback<T> = T extends void ? () => any : (arg: T) => any;

// eslint-disable-next-line no-unused-vars
type VoidKeys<T, K extends keyof T = keyof T> =
  K extends (T[K] extends void ? K : never) ? K : never;

export default class EventEmitter<
T extends {[name: string]: any},
VoidTypes = VoidKeys<T>,
NonVoidTypes extends Exclude<keyof T, VoidTypes> = Exclude<keyof T, VoidTypes>
> {
  private _listeners: {[K in keyof T]?: ((arg: T) => any)[]};

  constructor() {
    this._listeners = {};
  }

  public on<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    var registered = this._listeners[type];

    if (!registered) {
      registered = [];
      this._listeners[type] = registered;
    }

    registered.push(callback);
  }

  public emit<K extends NonVoidTypes>(type: K, arg: T[K]): void;
  public emit<K extends VoidTypes>(type: K): void;
  public emit<K extends keyof T>(type: K, arg?: T[K]): void {
    var registered = this._listeners[type];

    if (registered) {
      registered.forEach(cb => cb.call(this, arg));
    }
  }

  public removeListener<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    var registered = this._listeners[type];

    if (registered) {
      var index = registered.indexOf(callback);

      if (index >= 0) {
        registered.splice(index, 1);
      }
    }
  }
}