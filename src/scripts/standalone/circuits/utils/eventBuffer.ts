const bufferMap: {[name: string]: (() => any)[]} = {};

export default function bufferEvent(
  name: string,
  callback: () => any,
  animation?: boolean
) {
  if (!bufferMap[name]) {
    bufferMap[name] = [];
  }

  var events = bufferMap[name];

  if (events.length === 0) {
    const cb = function () {
      events.splice(0, events.length).forEach(cb => cb());
    };

    if (animation) {
      requestAnimationFrame(cb);
    } else {
      setTimeout(cb, 0);
    }
  }

  if (events.indexOf(callback) < 0) events.push(callback);
}