export function pushEvent(event, attributes) {
  attributes.event = event;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(attributes);
}
