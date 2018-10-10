const bufferMap = new Map<string, Set<() => any>>();

export default function bufferEvent(
  name: string,
  callback: () => any,
  animation?: boolean
) {
  if (!bufferMap.get(name)) {
    bufferMap.set(name, new Set());
  }

  var events = bufferMap.get(name);

  if (events.size === 0) {
    const cb = function () {
      var callbacks = Array.from(events.values());
      events.clear();
      callbacks.forEach(cb => cb());
    };

    if (animation) {
      requestAnimationFrame(cb);
     } else {
      setTimeout(cb, 0);
     }
  }

  events.add(callback);
}