type Callback<T> = T extends void ? () => any : (arg: T) => any;

type VoidKeys<T, K extends keyof T = keyof T> = K extends (
  T[K] extends void ? K : never
)
  ? K
  : never;
type Listeners<T> = {
  [K in string | keyof T]?: K extends keyof T ? ((arg: T) => any)[] : any;
};
type QueuedEvents<T> = {
  [K in string | keyof T]?: K extends keyof T ? T[K] : any;
};

export default class EventEmitter<
  T extends { [name: string]: any },
  VoidTypes = VoidKeys<T>,
  NonVoidTypes extends Exclude<keyof T, VoidTypes> = Exclude<keyof T, VoidTypes>
> {
  private _listeners: Listeners<T>;

  private _queued: QueuedEvents<T>;
  private _timeout: NodeJS.Timer;

  public constructor() {
    this._listeners = {};
    this._queued = {};
    this._timeout = null;
  }

  public on<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    let registered = this._listeners[type];

    if (!registered) {
      registered = [] as Listeners<T>[K];
      this._listeners[type] = registered;
    }

    registered.push(callback);
  }

  public emit<K extends NonVoidTypes>(type: K, arg: T[K]): void;
  public emit<K extends VoidTypes>(type: K): void;
  public emit<K extends keyof T>(type: K, arg?: T[K]): void {
    const registered = this._listeners[type];

    if (registered) {
      registered.forEach((cb: (arg: T) => any) => cb.call(this, arg));
    }
  }

  public emitOnceAsync<K extends NonVoidTypes>(type: K, arg: T[K]): void;
  public emitOnceAsync<K extends VoidTypes>(type: K): void;
  public emitOnceAsync<K extends keyof T>(type: K, arg?: T[K]): void {
    this._queued[type] = arg;

    if (!this._timeout) {
      this._timeout = setTimeout(() => {
        this._timeout = null;

        const queued = this._queued;
        this._queued = {};

        for (const type in queued) {
          this.emit(<any>type, queued[type]);
        }
      }, 0);
    }
  }

  public removeListener<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    const registered = this._listeners[type];

    if (registered) {
      const index = registered.indexOf(callback);

      if (index >= 0) {
        registered.splice(index, 1);
      }
    }
  }
}
