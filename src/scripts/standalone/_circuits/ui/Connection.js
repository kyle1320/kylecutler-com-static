import BoundingBox from "../viewmodel/spatial/BoundingBox";
import { getStyle } from "./styles";

export default class Connection {
  constructor (nodeA, nodeB, pointA, pointB) {
    // TODO: make another abstraction that supports independent nodes
    //       as well as pins on circuits

    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.pointA = pointA;
    this.pointB = pointB;

    this.boundingBox = new BoundingBox(
      Math.min(pointA.x, pointB.x),
      Math.min(pointA.y, pointB.y),
      Math.abs(pointA.x - pointB.x),
      Math.abs(pointA.y - pointB.y)
    );
  }

  draw(context) {
    var style = getStyle(null).connection; // TODO: base style on something...

    var color = (nodeA.get() || nodeB.get()) ? style.colorOn : style.colorOff;

    // TODO: find path between nodes

    context.strokeStyle = color;

    context.beginPath();
      context.moveTo(this.pointA.x, this.pointA.y);
      context.lineTo(this.pointB.x, this.pointB.y);
    context.closePath();

    context.stroke();
  }
}