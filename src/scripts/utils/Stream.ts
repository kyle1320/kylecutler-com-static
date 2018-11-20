import EventEmitter from './EventEmitter';

export interface Writable<T> extends EventEmitter<{'can-write': void}> {
  canWrite(): boolean;
  write(chunk: T): void;
  reset(): void;
}

export interface Readable<T> extends EventEmitter<{'can-read': void}> {
  canRead(): boolean;
  read(): T;
  reset(): void;

  pipe<U extends Writable<T>>(dest: U): U;
}

export type ReadWritable<T, U> = Writable<T> & Readable<U>;

export class ReadableImpl<T> extends EventEmitter<{
  'can-read': void
  }> implements Readable<T> {

  private data: T[];

  public constructor () {
    super();

    this.data = [];
  }

  protected write(chunk: T) {
    this.data.push(chunk);

    if (this.data.length === 1) {
      this.emit('can-read');
    }
  }

  public canRead() {
    return this.data.length > 0;
  }

  public read() {
    return this.data.shift();
  }

  public reset() {
    this.data = [];
  }

  public pipe<U extends Writable<T>>(dest: U) {
    pipeImpl(this, dest);
    return dest;
  }
}

export class WritableImpl<T> extends EventEmitter<{
  'can-write': void
  }> implements Writable<T> {

  private onWrite: (data: T) => any;

  public constructor (onWrite: (data: T) => any) {
    super();

    this.onWrite = onWrite;
  }

  public write(data: T) {
    this.onWrite(data);
  }

  public canWrite() {
    return true;
  }

  public reset() {

  }
}

export class ReadWritableImpl<T> extends EventEmitter<{
  'can-write': void,
  'can-read': void
  }> implements ReadWritable<T, T> {

  private data: T[];
  private capacity: number;

  public constructor (capacity: number) {
    super();

    this.data = [];
    this.capacity = capacity;
  }

  public write(chunk: T) {
    if (this.canWrite()) {
      this.data.push(chunk);

      if (this.data.length === 1) {
        this.emit('can-read');
      }
    }
  }

  public canWrite() {
    return this.data.length < this.capacity;
  }

  public canRead() {
    return this.data.length > 0;
  }

  public read() {
    var res = this.data.shift();

    if (this.data.length === this.capacity - 1) {
      this.emit('can-write');
    }

    return res;
  }

  public reset() {
    this.data = [];
  }

  public pipe<U extends Writable<T>>(dest: U) {
    pipeImpl(this, dest);
    return dest;
  }
}

interface Processor<In, Out> {
  process(data: In, callback: (data: Out) => any): any;
  cancel(data: In): void;
}
type ProcessorOrFunc<In, Out> = Processor<In, Out> | ((data: In) => Out);

export class Transform<In, Out> extends EventEmitter<{
  'can-write': void,
  'can-read': void
  }> implements ReadWritable<In, Out> {

  private input: In[];
  private output: Out[];

  private capacity: number;
  private processor: Processor<In, Out>;

  public constructor (processor: ((data: In) => Out));
  public constructor (processor: Processor<In, Out>, capacity: number);
  public constructor (
    processor: ProcessorOrFunc<In, Out>,
    capacity: number = Infinity
  ) {
    super();

    this.input = [];
    this.output = [];
    this.capacity = capacity;

    if (typeof processor === 'function') {
      this.processor = {
        process: (item, cb) => cb(processor(item)),
        cancel: () => {}
      };
    } else {
      this.processor = processor;
    }
  }

  public write(input: In) {
    if (this.canWrite()) {
      this.input.push(input);

      this.processor.process(input, (data) => {
        this.remove(input);

        this.output.push(data);

        if (this.output.length === 1) {
          this.emit('can-read');
        }
      });
    }
  }

  public canWrite() {
    return (this.input.length + this.output.length) < this.capacity;
  }

  public canRead() {
    return this.output.length > 0;
  }

  public read() {
    var res = this.output.shift();

    if (this.input.length + this.output.length === this.capacity - 1) {
      this.emit('can-write');
    }

    return res;
  }

  private remove(input: In) {
    var index = this.input.indexOf(input);
    this.input.splice(index, 1);

    if (this.input.length + this.output.length === this.capacity - 1) {
      this.emit('can-write');
    }
  }

  public reset() {
    this.input.forEach(item => this.processor.cancel(item));
    this.input = [];
    this.output = [];
  }

  public pipe<U extends Writable<Out>>(dest: U) {
    pipeImpl(this, dest);
    return dest;
  }
}

export class Pipeline<T> {
  private source: Readable<T>;
  private all: (Readable<any> | Writable<any>)[];

  public constructor (source: Readable<T>) {
    this.source = source;
    this.all = [source];
  }

  public pipe<U>(dest: ReadWritable<T, U>): Pipeline<U>;
  public pipe(dest: Writable<T>): Pipeline<void>;
  public pipe<U>(dest: ReadWritable<T, U>) {
    this.all.push(dest);
    this.source.pipe(dest);

    if ('canRead' in dest) {
      let self = (this as any) as Pipeline<U>;
      self.source = dest as Readable<U>;
      return self;
    } else {
      this.source = null;
      return (this as any) as Pipeline<void>;
    }
  }

  public reset() {
    this.all.forEach(s => s.reset());
  }
}

function pipeImpl<T>(source: Readable<T>, dest: Writable<T>) {
  function fill() {
    while (source.canRead() && dest.canWrite()) {
      dest.write(source.read());
    }
  }

  source.on('can-read', fill);
  dest.on('can-write', fill);

  fill();
}
