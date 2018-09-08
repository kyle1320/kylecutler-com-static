export function pushEvent(event, attributes) {
  attributes.event = event;
  dataLayer.push(attributes);
}