export default function parse(expr) {
  var tokens = expr.split(/\s+/).filter(x => !!x);

  return parseExpr(new ConsumableStream(tokens));
}

function parseExpr(tokens, stack = []) {
  var next;

  while (next = tokens.peek()) {
    if (next.match(/\d+/)) {
      stack.push(parseVar(tokens));
    } else {
      stack.push(parseOp(tokens, stack));
    }
  }

  return stack.pop();
}

function parseOp(tokens, stack) {
  var op = tokens.next();

  if (op.match(/[\|&]/)) {
    return evalBinaryOp.bind(null, stack.pop(), op, stack.pop());
  } else {
    return evalUnaryOp.bind(null, op, stack.pop());
  }
}

function parseVar(tokens) {
  return evalVar.bind(null, tokens.next());
}

function evalBinaryOp(lhs, op, rhs, scope) {
  switch (op) {
    case '&': return lhs(scope) && rhs(scope);
    case '|': return lhs(scope) || rhs(scope);
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