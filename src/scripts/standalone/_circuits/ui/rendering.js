import { getStyle } from "./styles";

// helper methods for rendering items
const rendering = {
  drawView: function(view, context) {
    var style = getStyle(view).general;

    if (view.attributes.hover) {
      context.fillStyle = style.highlightOverlayColor;
      context.rect(
        view.location.x - 0.5, view.location.y - 0.5,
        view.size.width + 1, view.size.height + 1
      );
      context.fill();
    }
  },

  drawNode: function(view, context) {
    rendering.drawView(view, context);

    var style = getStyle(view).node;

    var strokeColor = view.data.get()    ? style.strokeColorOn   : style.strokeColorOff;
    var fillColor   = view.data.isSource ? style.fillColorSource : style.fillColorReceiver;
    var {x, y} = view.location;

    context.fillStyle   = fillColor;
    context.strokeStyle = strokeColor;

    context.beginPath();
        context.arc(x, y, style.size, 0, 2 * Math.PI);
    context.closePath();

    context.fill();
    context.stroke();
  },

  drawAndGate: function (view, context) {
    rendering.drawView(view, context);

    var style = getStyle(view).general.gate;

    var {x, y} = view.location;
    var {width, height} = view.size;

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

    var {x, y} = view.location;
    var {width, height} = view.size;

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

    var {x, y} = view.location;
    var {width} = view.size;

    context.fillStyle = style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.beginPath();
      context.moveTo(x, y - 0.5);
      context.lineTo(x + width, y);
      context.lineTo(x, y + 0.5);
    context.closePath();

    context.fill();
    context.stroke();

    var nodeStyle = getStyle(view).node;

    context.fillStyle   = nodeStyle.fillColorReceiver;
    context.strokeStyle = view.data.pins[1].get()
      ? nodeStyle.strokeColorOn
      : nodeStyle.strokeColorOff;

    context.beginPath();
        context.arc(x + 1, y, nodeStyle.size, 0, 2 * Math.PI);
    context.closePath();

    context.fill();
    context.stroke();
  }
}

export default rendering;