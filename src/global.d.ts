/* eslint-disable no-unused-vars */

declare var __DEBUG__: boolean;

interface Math {
  sign(x: number): -1|-0|0|1;
}

declare namespace JSX {
  type IntrinsicElements =
    {
      [T in keyof HTMLElementTagNameMap]: {
        [K in keyof HTMLElementTagNameMap[T]]?: K extends 'style'
          ? Partial<HTMLElementTagNameMap[T][K]>
          : HTMLElementTagNameMap[T][K]
      }
    };
}