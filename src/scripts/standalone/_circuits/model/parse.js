export default function parse(expr) {
  var tokens = expr.split(/\s+/).filter(x => !!x);

  return parseExpr(new ConsumableStream(tokens));
}

function parseExpr(tokens) {
  var next, stack = [];

  while (next = tokens.peek()) {
    if (next.match(/\d+/)) {
      stack.push(evalVar.bind(null, tokens.next()));
    } else if (next.match(/[\|&\^]/)) {
      stack.push(evalBinaryOp.bind(null, stack.pop(), tokens.next(), stack.pop()));
    } else {
      stack.push(evalUnaryOp.bind(null, tokens.next(), stack.pop()));
    }
  }

  return stack.pop();
}

function evalBinaryOp(lhs, op, rhs, scope) {
  switch (op) {
    case '&': return lhs(scope) && rhs(scope);
    case '|': return lhs(scope) || rhs(scope);
    case '^': return lhs(scope) ^  rhs(scope);
  }
}

function evalUnaryOp(op, val, scope) {
  switch (op) {
    case '!': return !val(scope);
  }
}

function evalVar(sym, scope) {
  return scope[sym];
}

class ConsumableStream {
  constructor (arr) {
    this.arr = arr;
    this.index = 0;
  }

  peek() {
    return this.arr[this.index];
  }

  next() {
    return this.arr[this.index++];
  }

  size() {
    return this.arr.length - this.index;
  }
}