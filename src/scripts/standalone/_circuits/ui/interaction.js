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
  var shared_hoverItem;
  var shared_userDragging = false;

  var drag_previousX, drag_previousY;
  var drag_intermediateX, drag_intermediateY;

  var create_dragStart;

  // TODO: add support for touch events

  ui.canvas.addEventListener("mousedown", e => {
    shared_userDragging = true;

    if (shared_hoverItem) {
      var {x, y} = shared_hoverItem.getDimensions();
      drag_intermediateX = x;
      drag_intermediateY = y;

      create_dragStart = shared_hoverItem;
    }

    drag_previousX = e.offsetX;
    drag_previousY = e.offsetY;
  });

  ui.canvas.addEventListener("mousemove", e => {
    var grid = ui.grid;

    if (selectedTool === 'drag' && shared_userDragging) {
      if (shared_hoverItem) {
        drag_intermediateX += (e.offsetX - drag_previousX) / grid.renderParams.scale;
        drag_intermediateY += (e.offsetY - drag_previousY) / grid.renderParams.scale;

        shared_hoverItem.move(
          Math.round(drag_intermediateX),
          Math.round(drag_intermediateY)
        );
      } else {
        grid.scroll(
          -(e.offsetX - drag_previousX) / grid.renderParams.scale,
          -(e.offsetY - drag_previousY) / grid.renderParams.scale
        );
      }

      drag_previousX = e.offsetX;
      drag_previousY = e.offsetY;
    } else {
      var x = (e.offsetX / grid.renderParams.scale) + grid.renderParams.offsetX;
      var y = (e.offsetY / grid.renderParams.scale) + grid.renderParams.offsetY;

      var hover = grid.find(x, y)[0];

      if (shared_hoverItem !== hover) {
        shared_hoverItem && shared_hoverItem.setAttribute('hover', false);
        hover            && hover.setAttribute('hover', true);
      }

      shared_hoverItem = hover;
    }
  });

  ui.canvas.addEventListener("mouseup", e => {
    shared_userDragging = false;

    if (selectedTool === 'create' && create_dragStart && shared_hoverItem) {
      if (create_dragStart !== shared_hoverItem) {
        create_dragStart.data.connect(shared_hoverItem);
      }
    }

    create_dragStart = null;
  });

  ui.canvas.addEventListener("click", e => {
    if (selectedTool === 'point' && shared_hoverItem) {
      var item = shared_hoverItem.data;

      if (item instanceof Node) {
        item.set(!item.isSource);
      }
    }
  });
}

export {
  init
};