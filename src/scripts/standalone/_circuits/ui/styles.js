export const defaultStyle = {
  general: {
    lineWidth: 0.1,
    gridColor: "#eeeeee",
    highlightOverlayColor: "rgba(0, 0, 0, 0.1)",
    gate: {
      strokeColor: "#333333",
      fillColor: "#FFFFFF"
    }
  },
  node: {
    strokeColorOn: "#00FF00",
    strokeColorOff: "#A08080",
    fillColorSource: "#00FF00",
    fillColorReceiver: "#FFFFFF",
    size: 0.25
  },
  connection: {
    colorOn: "#00FF00",
    colorOff: "#A08080"
  }
};

export const errorStyle = {
  general: {
    lineWidth: 0.1,
    gridColor: "#eeeeee",
    highlightOverlayColor: "rgba(255, 0, 0, 0.1)",
    gate: {
      strokeColor: "#FF3333",
      fillColor: "#FFA0A0"
    }
  },
  node: {
    strokeColorOn: "#80FF00",
    strokeColorOff: "#FF8080",
    fillColorSource: "#80FF00",
    fillColorReceiver: "#FFA0A0",
    size: 0.25
  },
  connection: {
    colorOn: "#00FF00",
    colorOff: "#A08080"
  }
};

export function getStyle(view) {
  return defaultStyle;
}