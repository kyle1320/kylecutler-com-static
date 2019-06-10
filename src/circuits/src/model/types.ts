import View from '../view/View';

export interface Tree<T, X extends Tree<T, X>> {
  data: T,
  children: X[]
}

export interface BasicTree<X> extends Tree<X, BasicTree<X>> { }

export interface PositionalTree extends Tree<View, PositionalTree> {
  x: number,
  y: number
}

export type PositionalEventType
  = 'up' | 'down' | 'enter' | 'leave' | 'move' | 'scroll';

export interface PositionalEvent {
  type: PositionalEventType,
  event: MouseEvent | TouchEvent | WheelEvent,
  x: number,
  y: number,
  root: PositionalTree
}

export interface Position {
  x: number,
  y: number
}

export interface Dimensions extends Position {
  width: number,
  height: number
}

export interface CircuitRule {
  type: string, target: number, value: string
}

export interface CircuitDefinition {
  key: string,
  size: { width: number, height: number },
  pins: { x: number, y: number, ignoreInput: boolean }[],
  rules: CircuitRule[],
  style: {
    fillColor?: string,
    path: string
  }
}

export type ActionEventType = 'select' | 'deselect' | 'click' | 'toggle';

export interface ActionEvent {
  type: ActionEventType,
  section: string,
  name: string,
  id: string
}