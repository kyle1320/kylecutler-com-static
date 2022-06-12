export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function range(to: number): number[];
export function range(from: number, to: number): number[];
export function range(from: number, to: number, step: number): number[];
export function range(from: number, to?: number, step?: number): number[] {
  if (typeof to === 'undefined') {
    to = from;
    from = 0;
  }

  if (typeof step === 'undefined') {
    step = Math.sign(to - from);
  }

  if (step === 0) return [];

  const res = [];
  while (step > 0 ? to > from : to < from) {
    res.push(from);
    from += step;
  }

  return res;
}

export * from './color';
export * from './dom';
export { default as EventEmitter } from './EventEmitter';
export * from './gtm';
export { default as QuadTree } from './QuadTree';
export * from './Stream';
