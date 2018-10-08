const bufferMap = new Map();

export default function bufferEvent(name, callback, animation) {
  if (!bufferMap[name]) {
    bufferMap[name] = new Set();
  }

  var events = bufferMap[name];

  if (events.size === 0) {
    (animation ? requestAnimationFrame : setTimeout)(function () {
      var callbacks = Array.from(events.values());
      events.clear();
      callbacks.forEach(cb => cb());
    });
  }

  bufferMap[name].add(callback);
}