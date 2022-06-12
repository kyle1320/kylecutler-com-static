import EventEmitter from './EventEmitter';

export type Transform<T, U> = (data: T) => U;
export type AsyncTransform<T, U> = (data: T, cb: Transform<U, any>) => void;

export interface Consumer<T> extends EventEmitter<{ 'can-write': void }> {
  write(data: T): void;
  canWrite(): boolean;

  clear(): void;
}

export interface Producer<T>
  extends EventEmitter<{
    'can-read': void;
    clear: void;
  }> {
  read(data: T): void;
  canRead(): boolean;

  clear(): void;

  map<U>(transform: Transform<T, U>, capacity?: number): Producer<U>;
  mapAsync<U>(
    transform: AsyncTransform<T, U>,
    abort: (item: T) => any,
    capacity?: number
  ): Producer<U>;

  filter(pred: Transform<T, boolean>, capacity?: number): Producer<T>;
  filterAsync(
    pred: AsyncTransform<T, boolean>,
    abort: (item: T) => any,
    capacity?: number
  ): Producer<T>;

  forEach(callback: Transform<T, any>): void;

  pipe<U extends Consumer<T>>(dest: U): U;
}

export class Stream<In, Out = In>
  extends EventEmitter<{
    'can-read': void;
    'can-write': void;
    clear: void;
  }>
  implements Consumer<In>, Producer<Out>
{
  protected data: (In | Out)[];
  protected capacity: number;

  public constructor(capacity: number) {
    super();

    this.data = [];
    this.capacity = capacity;
  }

  public map<U>(
    transform: Transform<Out, U>,
    capacity = Infinity
  ): Producer<U> {
    return this.mapAsync((x, cb) => cb(transform(x)), null, capacity);
  }

  public mapAsync<U>(
    transform: AsyncTransform<Out, U>,
    abort?: Transform<Out, any>,
    capacity = Infinity
  ): Producer<U> {
    return this.pipe(new Transformer<Out, U>(transform, abort, capacity));
  }

  public filter(
    predicate: Transform<Out, boolean>,
    capacity = Infinity
  ): Producer<Out> {
    return this.filterAsync((x, cb) => cb(predicate(x)), null, capacity);
  }

  public filterAsync(
    predicate: AsyncTransform<Out, boolean>,
    abort?: Transform<Out, any>,
    capacity = Infinity
  ): Producer<Out> {
    return this.pipe(new Filter<Out>(predicate, abort, capacity));
  }

  public forEach(callback: Transform<Out, any>): void {
    const fill = () => {
      while (this.canRead()) {
        callback(this.read());
      }
    };

    this.on('can-read', fill);

    fill();
  }

  public pipe<T extends Consumer<Out>>(dest: T): T {
    const fill = () => {
      // TODO: Break this up if the streams have unlimited bandwidth
      while (this.canRead() && dest.canWrite()) {
        dest.write(this.read());
      }
    };

    this.on('can-read', fill);
    dest.on('can-write', fill);

    this.on('clear', dest.clear.bind(dest));

    fill();

    return dest;
  }

  public clear() {
    this.data = [];
    this.emit('clear');
  }

  public canRead() {
    return this.data.length > 0;
  }

  public read(): Out {
    const res = this.data.shift();

    if (this.data.length === this.capacity - 1) {
      // This prevents infinite recursion when piping A=>B=>C
      //   where A and C have unlimited bandwidth and B has a capacity of 1:
      //   [can-write B]>(pipe A=>B)>[can-read B]>(pipe B=>C)>[can-write B]>...
      // If B has a capacity of greater than 1, this becomes:
      //   [can-write B]>(pipe A=>B)>[can-read B]>(pipe B=>C)
      //                            >[can-read B]>(pipe B=>C)
      //                            >...
      //   because writing from B does not cause its length to be (capacity-1),
      //   so the [can-write B] event does not get triggered during (pipe B=>C).
      // This delays the [can-write B] event if capacity === 1, so it becomes:
      //   [can-write B]>(pipe A=>B)>[can-read B]>(pipe B=>C)>[setTimeout]
      //   [can-write B]>(pipe A=>B)>[can-read B]>(pipe B=>C)>[setTimeout]
      //   ...
      // This will be slower, but hey, that's what you get ¯\_(ツ)_/¯
      if (this.capacity === 1) {
        this.emitOnceAsync('can-write');
      } else {
        this.emit('can-write');
      }
    }

    return res as Out;
  }

  public canWrite() {
    return this.data.length < this.capacity;
  }

  public write(chunk: In) {
    if (this.canWrite()) {
      this.data.push(chunk);

      if (this.data.length === 1) {
        this.emit('can-read');
      }
    }
  }
}

class Transformer<In, Out> extends Stream<In, Out> {
  private transform: AsyncTransform<In, Out>;
  private abort: Transform<In, any>;
  private numReady: number;

  public constructor(
    transform: AsyncTransform<In, Out>,
    abort: Transform<In, any>,
    capacity: number
  ) {
    super(capacity);

    this.transform = transform;
    this.abort = abort;
    this.numReady = 0;
  }

  public canRead() {
    return this.numReady > 0;
  }

  public read(): Out {
    this.numReady--;

    return super.read();
  }

  public write(chunk: In) {
    super.write(chunk);

    this.transform(chunk, (data) => {
      const index = this.data.indexOf(chunk);
      this.data.splice(index, 1);
      this.data.splice(this.numReady, 0, data);
      this.numReady++;

      if (this.numReady === 1) {
        this.emit('can-read');
      }
    });
  }

  public clear() {
    if (this.abort) {
      for (let i = this.numReady; i < this.data.length; i++) {
        this.abort(this.data[i] as In);
      }
    }

    super.clear();
  }
}

class Filter<T> extends Stream<T> {
  private predicate: AsyncTransform<T, boolean>;
  private abort: Transform<T, any>;

  public constructor(
    predicate: AsyncTransform<T, boolean>,
    abort: Transform<T, any>,
    capacity: number
  ) {
    super(capacity);

    this.predicate = predicate;
    this.abort = abort;
  }

  public write(chunk: T) {
    this.predicate(chunk, (x) => x && super.write(chunk));
  }

  public clear() {
    if (this.abort) {
      this.data.forEach((data) => this.abort(data));
    }

    super.clear();
  }
}
