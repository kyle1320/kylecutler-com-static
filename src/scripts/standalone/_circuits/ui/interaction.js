import {Location, Size} from '../utils/props';
import Node from '../model/Node';

var selectedItem;
var userDragging = false;
var userDidDrag = false;
var previousX, previousY;
var intermediateX, intermediateY;

export function init(ui) {
  addEventListeners(ui);
}

function addEventListeners(ui) {
  // TODO: add support for touch events

  ui.canvas.addEventListener("mousedown", e => {
    userDragging = true;
  });

  ui.canvas.addEventListener("mousemove", e => {
    if (userDragging) {
      if (selectedItem) {
        var prevX = Math.round(intermediateX),
            prevY = Math.round(intermediateY);
        intermediateX += (e.offsetX - previousX) / ui.viewParams.scale;
        intermediateY += (e.offsetY - previousY) / ui.viewParams.scale;
        var x = Math.round(intermediateX),
            y = Math.round(intermediateY);

        if (x !== prevX || y !== prevY) {
          try {
            ui.grid.move(selectedItem, x, y);
          } catch (e) {
            // TODO: show invalid location (instead of actual?)
          }

          userDidDrag = true;
        }
      } else {
        ui.viewParams.offsetX -= (e.offsetX - previousX) / ui.viewParams.scale;
        ui.viewParams.offsetY -= (e.offsetY - previousY) / ui.viewParams.scale;

        ui.refresh();
      }
    } else {
      var x = (e.offsetX / ui.viewParams.scale) + ui.viewParams.offsetX;
      var y = (e.offsetY / ui.viewParams.scale) + ui.viewParams.offsetY;

      var selected = ui.grid.find(x, y);

      if (selectedItem) {
        if (selectedItem !== selected) {
          selectedItem.setHover(false);
        }
      }

      if (selected) {
        selected.setHover(true);
        var {x, y} = Location.get(selected.item);
        intermediateX = x;
        intermediateY = y;
      }

      selectedItem = selected;
    }

    previousX = e.offsetX;
    previousY = e.offsetY;
  });

  ui.canvas.addEventListener("mouseup", e => {
    userDragging = false;
  });

  ui.canvas.addEventListener("click", e => {
    if (!userDidDrag && selectedItem) {
      var item = selectedItem.item;

      if (item instanceof Node) {
        item.set(!item.isSource);
      }
    }

    userDidDrag = false;
  });
}