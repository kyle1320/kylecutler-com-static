export function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function count<T>(max: number, callback: (n: number) => T): T[] {
  var arr = [];
  for (var i = 0; i < max; i++) {
    arr[i] = callback(i);
  }
  return arr;
}

export * from './color';
export * from './dom';
export { default as EventEmitter } from './EventEmitter';
export * from './gtm';
export { default as QuadTree } from './QuadTree';
export * from './Stream';