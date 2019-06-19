export type Expression = (scope: Scope) => any;
export type Scope = {[key: string]: any};

// Parses a simple stack-based language.
export function parse(expr: string): Expression {
  var tokens = consume(expr, parseToken);
  var expressions = consume(tokens, parseExpr);

  return expressions.pop();
}

function consume<T>(
  arr: string | string[],
  consumer: (stream: ConsumableStream, stack: T[]) => T
): T[] {
  var stream = new ConsumableStream(arr);
  var res = [];
  while (stream.peek()) {
    var elem = consumer(stream, res);
    elem && res.push(elem);
  }
  return res;
}

function parseToken(stream: ConsumableStream): string {

  // skip past spaces
  stream.forward(x => x === ' ');

  var next = stream.next();

  if (!next) return null;

  // capture entire text between single quotes, otherwise only split by spaces
  if (next === '\'') {
    return [next].concat(stream.forward(x => x !== '\'', true)).join('');
  } else {
    return [next].concat(stream.forward(x => x && x !== ' ')).join('');
  }
}

function parseExpr(
  tokens: ConsumableStream,
  stack: Expression[]
): Expression {
  var next = tokens.next();

  // variables
  if (next[0] === '$') {
    return evalVar.bind(null, next.substring(1));

    // string literals
  } else if (next.match(/^'.*'$/)) {
    return evalLiteral.bind(null, next.substring(1, next.length - 1));

    // boolean literals
  } else if (next === 'true') {
    return evalLiteral.bind(null, true);
  } else if (next === 'false') {
    return evalLiteral.bind(null, false);

    // if statements
  } else if (next === 'if') {
    return evalIf.bind(null, stack.pop(), stack.pop(), stack.pop());

    // binary operators
  } else if (next === '|' || next === '&' || next === '^' || next === '+') {
    return evalBinaryOp.bind(null, next, stack.pop(), stack.pop());

    // unary operators
  } else if (next === '!') {
    return evalUnaryOp.bind(null, next, stack.pop());
  }

  throw new Error('Unexpected token "' + next + '"');
}

function evalBinaryOp(
  op: string,
  rhs: Expression,
  lhs: Expression,
  scope: Scope
): any {
  switch (op) {
  case '&': return lhs(scope) && rhs(scope);
  case '|': return lhs(scope) || rhs(scope);
  case '^': return lhs(scope) ^  rhs(scope);
  case '+': return lhs(scope) +  rhs(scope);
  }
}

function evalUnaryOp(
  op: string,
  val: Expression,
  scope: Scope
): any {
  switch (op) {
  case '!': return !val(scope);
  }
}

function evalIf(
  cond: Expression,
  ifFalse: Expression,
  ifTrue: Expression,
  scope: Scope
): any {
  return cond(scope) ? ifTrue(scope) : ifFalse(scope);
}

function evalVar(sym: string, scope: Scope): any {
  return scope[sym];
}

function evalLiteral(val: any, scope: Scope): any {
  return val;
}

class ConsumableStream {
  private arr: string | string[];
  private index: number;

  public constructor (arr: string | string[]) {
    this.arr = arr;
    this.index = 0;
  }

  public peek(): string {
    return this.arr[this.index];
  }

  public next(): string {
    return this.arr[this.index++];
  }

  public size(): number {
    return this.arr.length - this.index;
  }

  public forward(cond: (val: string) => boolean, takeLast: boolean = false) {
    var res = [];
    while (cond(this.peek())) {
      if (this.index >= this.arr.length) {
        throw new Error('Reached end of input unexpectedly');
      }
      res.push(this.next());
    }
    if (takeLast) {
      res.push(this.next());
    }
    return res;
  }
}