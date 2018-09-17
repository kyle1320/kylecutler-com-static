const bufferMap = new Map();

export default function bufferEvent(name, callback) {
  if (!bufferMap[name]) {
    bufferMap[name] = new Set();
  }

  var events = bufferMap[name];

  if (events.size === 0) {
    setTimeout(function () {
      var callbacks = Array.from(events.values());
      events.clear();
      callbacks.forEach(cb => cb());
    });
  }

  bufferMap[name].add(callback);
};