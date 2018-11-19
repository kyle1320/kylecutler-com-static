import EventEmitter from './EventEmitter';

export interface Writable<T> extends EventEmitter<{'can-write': void}> {
  canWrite(): boolean;
  write(chunk: T): void;
}

export interface Readable<T> extends EventEmitter<{'can-read': void}> {
  canRead(): boolean;
  read(): T;
}

export type ReadWritable<T, U> = Writable<T> & Readable<U>;

export class Queue<T> extends EventEmitter<{
  'can-write': void,
  'can-read': void,
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
}

type Processor<In, Out> =
  (data: In, callback: (err: Error, data: Out) => any) => any;

export class Transform<In, Out> extends EventEmitter<{
  'can-write': void,
  'can-read': void,
  }> implements ReadWritable<In, Out> {

  private input: In[];
  private output: Out[];

  private capacity: number;
  private process: Processor<In, Out>;

  public constructor (capacity: number, process: Processor<In, Out>) {
    super();

    this.input = [];
    this.output = [];
    this.capacity = capacity;
    this.process = process;
  }

  public write(input: In) {
    if (this.canWrite()) {
      this.input.push(input);

      this.process(input, (err, data) => {
        this.remove(input);

        if (err) return;

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
    return this.output.shift();
  }

  private remove(input: In) {
    var index = this.input.indexOf(input);
    this.input.splice(index, 1);

    if (this.input.length === this.capacity - 1) {
      this.emit('can-write');
    }
  }
}

export class Pipeline<T> {
  private source: Readable<T>;

  public constructor (source: Readable<T>) {
    this.source = source;
  }

  public pipe<U>(dest: ReadWritable<T, U>): Pipeline<U>;
  public pipe(dest: Writable<T>): void;
  public pipe<U>(dest: ReadWritable<T, U>) {
    var source = this.source;

    function fill() {
      while (source.canRead() && dest.canWrite()) {
        dest.write(source.read());
      }
    }

    source.on('can-read', fill);
    dest.on('can-write', fill);

    fill();

    if ('canRead' in dest) {
      return new Pipeline(dest);
    }

    return undefined;
  }
}
