export function gaSend() {
  var tracker = ga.getAll()[0];

  if (tracker) {
    tracker.send.apply(tracker, arguments);
  }
}