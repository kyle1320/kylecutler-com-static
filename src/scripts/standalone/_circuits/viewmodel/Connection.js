import BoundingBox from "./spatial/BoundingBox";
import View from "./View";

export default class Connection extends View {
  constructor (pointA, pointB, drawFunc) {
    super([pointA, pointB], {}, drawFunc);

    const _genDimensions = () => {
      var aPos = View.GetViewFromDatasource(this.data[0]).getDimensions();
      var bPos = View.GetViewFromDatasource(this.data[1]).getDimensions();

      this.attributes.dimensions = {
        x: Math.min(aPos.x, bPos.x),
        y: Math.min(aPos.y, bPos.y),
        width: Math.abs(aPos.x - bPos.x),
        height: Math.abs(aPos.y - bPos.y)
      };
    }

    const _update = () => {
      _genDimensions();

      this.emit('move');
    }

    pointA.on('move', _update);
    pointB.on('move', _update);

    _genDimensions();
  }
}