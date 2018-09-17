// Location and size are used to attach properties
//   even to items which do not have a view.
// For example, pins on a circuit may not have their own view,
//   but we still need to know where they are.
var Location = (function () {
  var _sym = Symbol("location");

  function get(obj) {
    return obj[_sym];
  }

  function set(obj, x, y) {
    obj[_sym] = {x, y};
  }

  return {get, set};
}());

var Size = (function () {
  var _sym = Symbol("size");

  function get(obj) {
    return obj[_sym];
  }

  function set(obj, width, height) {
    obj[_sym] = {width, height};
  }

  return {get, set};
}());

export {Location, Size};