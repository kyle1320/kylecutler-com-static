// Parses a simple stack-based language.
export default function parse(expr) {
  var tokens = consume(expr, parseToken);
  var expressions = consume(tokens, parseExpr);

  return expressions.pop();
}

function consume(arr, consumer) {
  var stream = new ConsumableStream(arr);
  var res = [];
  while (stream.peek()) {
    var elem = consumer(stream, res);
    elem && res.push(elem);
  }
  return res;
}

function parseToken(stream) {

  // skip past spaces
  stream.forward(x => x === ' ');

  var next = stream.next();

  if (!next) return;

  // capture entire text between single quotes, otherwise only split by spaces
  if (next === '\'') {
    return [next].concat(stream.forward(x => x !== '\'', true)).join('');
  } else {
    return [next].concat(stream.forward(x => x && x !== ' ')).join('');
  }
}

function parseExpr(tokens, stack) {
  var next = tokens.next();

  // variables
  if (next.startsWith('$')) {
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

function evalBinaryOp(op, rhs, lhs, scope) {
  switch (op) {
    case '&': return lhs(scope) && rhs(scope);
    case '|': return lhs(scope) || rhs(scope);
    case '^': return lhs(scope) ^  rhs(scope);
    case '+': return lhs(scope) +  rhs(scope);
  }
}

function evalUnaryOp(op, val, scope) {
  switch (op) {
    case '!': return !val(scope);
  }
}

function evalIf(cond, ifFalse, ifTrue, scope) {
  return cond(scope) ? ifTrue(scope) : ifFalse(scope);
}

function evalVar(sym, scope) {
  return scope[sym];
}

function evalLiteral(val, scope) {
  return val;
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

  forward(cond, takeLast = false) {
    var res = [];
    while (cond(this.peek())) {
      if (this.index >= this.arr.length)
        throw new Error('Reached end of input unexpectedly');
      res.push(this.next());
    }
    if (takeLast) {
      res.push(this.next());
    }
    return res;
  }
}