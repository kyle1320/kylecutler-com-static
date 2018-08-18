export function importStylesheet(href) {

  // avoid duplicates
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].href === href) {
        return Promise.resolve();
    }
  }

  return new Promise((resolve, reject) => {
    var link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;

    document.head.appendChild(link);
  });
}

export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  });
}