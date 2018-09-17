import {Location, Size} from '../../utils/props';

// helper methods for rendering items
const rendering = {
  drawNode: function (node, context, params, connectionsOnly) {
    node.connections.forEach(nbnode => {
      if (nbnode._id > node._id) {
        rendering.drawConnection(node, nbnode, context, params);
      }
    });

    if (!connectionsOnly) {
      var style = params.style.node;

      var strokeColor = node.get()    ? style.strokeColorOn   : style.strokeColorOff;
      var fillColor   = node.isSource ? style.fillColorSource : style.fillColorReceiver;
      var {x, y} = Location.get(node);

      context.fillStyle   = fillColor;
      context.strokeStyle = strokeColor;

      context.beginPath();
          context.arc(x, y, style.size, 0, 2 * Math.PI);
      context.closePath();

      context.fill();
      context.stroke();
    }
  },

  drawConnection: function (fromNode, toNode, context, params) {
    var style = params.style.connection;

    var color = (fromNode.get() || toNode.get()) ? style.colorOn : style.colorOff;
    var {x: fromX, y: fromY} = Location.get(fromNode);
    var {x: toX, y: toY} = Location.get(toNode);

    // TODO: find path between nodes

    context.strokeStyle = color;

    context.beginPath();
      context.moveTo(fromX, fromY);
      context.lineTo(toX, toY);
    context.closePath();

    context.stroke();
  },

  drawAndGate: function (item, context, params) {
    var style = params.style.general.gate;

    var {x, y} = Location.get(item);
    var {width, height} = Size.get(item);

    context.fillStyle = style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width / 2, y);
      context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, -Math.PI / 2, Math.PI / 2);
      context.lineTo(x, y + height);
    context.closePath();

    context.fill();
    context.stroke();

    rendering.drawNode(item.pins[0], context, params, true);
    rendering.drawNode(item.pins[1], context, params, true);
    rendering.drawNode(item.pins[2], context, params, true);
  },

  drawOrGate: function (item, context, params) {
    var style = params.style.general.gate;

    var {x, y} = Location.get(item);
    var {width, height} = Size.get(item);

    context.fillStyle = style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width, y + height / 2);
      context.lineTo(x, y + height);
    context.closePath();

    context.fill();
    context.stroke();

    rendering.drawNode(item.pins[0], context, params, true);
    rendering.drawNode(item.pins[1], context, params, true);
    rendering.drawNode(item.pins[2], context, params, true);
  },

  drawNotGate: function (item, context, params) {
    var style = params.style.general.gate;

    var {x, y} = Location.get(item);
    var {width} = Size.get(item);

    context.fillStyle = style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.beginPath();
      context.moveTo(x, y - 0.5);
      context.lineTo(x + width, y);
      context.lineTo(x, y + 0.5);
    context.closePath();

    context.fill();
    context.stroke();

    rendering.drawNode(item.pins[0], context, params, true);
    rendering.drawNode(item.pins[1], context, params);
  }
}

export default rendering;