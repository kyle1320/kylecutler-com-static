export default function parse(expr) {
  var tokens = expr.split(/\s+/).filter(x => !!x);

  return parseExpr(new ConsumableStream(tokens));
}

function parseExpr(tokens) {
  var first = tokens.peek();

  // TODO: flesh this out more

  if (first.match(/\d+/)) {
    return parseBinaryOp(tokens);
  } else {
    return parseUnaryOp(tokens);
  }
}

function parseBinaryOp(tokens) {
  return evalBinaryOp.bind(null, parseVar(tokens), tokens.next(), parseVar(tokens));
}

function parseUnaryOp(tokens) {
  return evalUnaryOp.bind(null, tokens.next(), parseVar(tokens));
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
}