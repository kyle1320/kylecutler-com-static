import { getStyle } from "./styles";
import View from "../viewmodel/View";

// helper methods for rendering items
const rendering = {
  drawView: function(view, context) {
    var style = getStyle(view).general;

    var {x, y, width, height} = view.getDimensions();

    if (view.attributes.hover) {
      context.fillStyle = style.highlightOverlayColor;
      context.rect(x - 0.5, y - 0.5, width + 1, height + 1);
      context.fill();
    }
  },

  drawNode: function(view, context) {
    rendering.drawView(view, context);

    var style = getStyle(view).node;

    var strokeColor = view.data.get()    ? style.strokeColorOn   : style.strokeColorOff;
    var fillColor   = view.data.isSource ? style.fillColorSource : style.fillColorReceiver;
    var {x, y} = view.getDimensions();

    context.fillStyle = fillColor;
    context.strokeStyle = strokeColor;

    context.beginPath();
        context.arc(x, y, style.size, 0, 2 * Math.PI);
    context.closePath();

    context.fill();
    context.stroke();
  },

  drawConnection: function(view, context) {
    var style = getStyle(view).connection;

    var strokeColor = style.colorOff;
    var {x: xa, y: ya} = View.GetViewFromDatasource(view.data[0]).getDimensions();
    var {x: xb, y: yb} = View.GetViewFromDatasource(view.data[1]).getDimensions();

    context.strokeStyle = strokeColor;

    context.beginPath();
      context.moveTo(xa, ya);
      context.lineTo(xb, yb);
    context.closePath();

    context.stroke();
  },

  drawAndGate: function (view, context) {
    rendering.drawView(view, context);

    var style = getStyle(view).general.gate;

    var {x, y, width, height} = view.getDimensions();

    context.fillStyle = style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width / 2, y);
      context.ellipse(
        x + width / 2, y + height / 2, width / 2, height / 2,
        0, -Math.PI / 2, Math.PI / 2
      );
      context.lineTo(x, y + height);
    context.closePath();

    context.fill();
    context.stroke();
  },

  drawOrGate: function (view, context) {
    rendering.drawView(view, context);

    var style = getStyle(view).general.gate;

    var {x, y, width, height} = view.getDimensions();

    context.fillStyle = style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width, y + height / 2);
      context.lineTo(x, y + height);
    context.closePath();

    context.fill();
    context.stroke();
  },

  drawNotGate: function (view, context) {
    rendering.drawView(view, context);

    var style = getStyle(view).general.gate;

    var {x, y, width} = view.getDimensions();

    context.fillStyle = style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.beginPath();
      context.moveTo(x, y - 0.5);
      context.lineTo(x + width, y);
      context.lineTo(x, y + 0.5);
    context.closePath();

    context.fill();
    context.stroke();
  }
}

export default rendering;