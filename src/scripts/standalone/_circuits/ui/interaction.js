import Node from '../model/Node';
import { makeElement } from '../../../utils';

var selectedTool;

function init(ui) {
  addTools(ui);
  addEventListeners(ui);
}

function addTools(ui) {
  const tools = [
    { name: 'point',  icon: 'fa fa-mouse-pointer', cursor: null,   label: 'Interact with objects' },
    { name: 'drag',   icon: 'fa fa-hand-rock',     cursor: 'grab', label: "Move the canvas or objects" },
    { name: 'create', icon: 'fa fa-plus',          cursor: null,   label: "Create new objects" },
    { name: 'save',   icon: 'fa fa-save',          cursor: null,   label: "Save the current workspace" },
    { name: 'load',   icon: 'fa fa-folder-open',   cursor: null,   label: "Load a previously saved workspace" }
  ];

  function selectTool(name) {
    selectedTool = name;

    tools.forEach(function (tool) {
      tool.element.className = tool.element.className.replace(/\s*selected/g, '');

      if (tool.name === name) {
        tool.element.className += ' selected';

        ui.canvas.style.cursor = tool.cursor;
      }
    });
  }

  tools.forEach(function (tool) {
    tool.element = makeElement({
        className: `tool ${tool.icon}`,
        id: `tool-${tool.name}`,
        title: tool.label
      }, '', {
        click: () => selectTool(tool.name)
    });
    ui.toolbar.appendChild(tool.element);
  });

  selectTool(tools[0].name);
}

function addEventListeners(ui) {
  var hoverItem;
  var userDragging = false;
  var previousX, previousY;
  var intermediateX, intermediateY;

  // TODO: add support for touch events

  ui.canvas.addEventListener("mousedown", e => {
    userDragging = true;
  });

  ui.canvas.addEventListener("mousemove", e => {
    var grid = ui.grid;

    if (selectedTool === 'drag' && userDragging) {
      if (hoverItem) {
        var prevX = Math.round(intermediateX),
            prevY = Math.round(intermediateY);
        intermediateX += (e.offsetX - previousX) / grid.renderParams.scale;
        intermediateY += (e.offsetY - previousY) / grid.renderParams.scale;
        var x = Math.round(intermediateX),
            y = Math.round(intermediateY);

        if (x !== prevX || y !== prevY) {
          grid.move(hoverItem, x, y);
        }
      } else {
        grid.scroll(
          -(e.offsetX - previousX) / grid.renderParams.scale,
          -(e.offsetY - previousY) / grid.renderParams.scale
        );
      }
    } else {
      var x = (e.offsetX / grid.renderParams.scale) + grid.renderParams.offsetX;
      var y = (e.offsetY / grid.renderParams.scale) + grid.renderParams.offsetY;

      var hover = grid.find(x, y)[0];

      if (hoverItem) {
        if (hoverItem !== hover) {
          hoverItem.setAttribute('hover', false);
        }
      }

      if (hover) {
        hover.setAttribute('hover', true);
        var {x, y} = hover.location;
        intermediateX = x;
        intermediateY = y;
      }

      hoverItem = hover;
    }

    previousX = e.offsetX;
    previousY = e.offsetY;
  });

  ui.canvas.addEventListener("mouseup", e => {
    userDragging = false;
  });

  ui.canvas.addEventListener("click", e => {
    if (selectedTool === 'point' && hoverItem) {
      var item = hoverItem.data;

      if (item instanceof Node) {
        item.set(!item.isSource);
      }
    }
  });
}

export {
  init
};