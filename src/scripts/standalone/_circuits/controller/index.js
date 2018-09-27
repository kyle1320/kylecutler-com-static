import NodeView from "../view/NodeView";
import CircuitView from "../view/CircuitView";
import Circuit from "../model/Circuit";
import ConnectionView from "../view/ConnectionView";
import Node from "../model/Node";

export default class Controller {
  constructor (canvas, toolbar, sidebar) {
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.sidebar = sidebar;

    this.selectedTool = 'move';
    this.userDragging = false;
  }

  handleEvent(e) {
    switch (e.type) {
      case 'down':
        this.userDragging = true;

        var drag = getMoveableTarget(e.root);
        if (drag) {
          this.drag_target = drag.view
          var {x, y} = this.drag_target.getDimensions();
          this.drag_intermediateX = x;
          this.drag_intermediateY = y;
        }

        if (this.selectedTool === 'create' && !this.create_previewCircuit) {
          this.create_dragStart = findNodeView(e.root);
          if (this.create_dragStart) {
            this.create_dragEnd = new NodeView(new Node(), e.root.x, e.root.y);
            this.create_dragEnd.parent = this.canvas;
            this.create_previewCircuit = new ConnectionView(this.create_dragStart, this.create_dragEnd, this.canvas);
            this.create_previewCircuit.setAttribute('hidden', true);
            this.canvas.setPreviewChild(this.create_previewCircuit);
          }
        }

        this.drag_previousX = e.x;
        this.drag_previousY = e.y;

        break;
      case 'move':
        var grid = e.root.view;

        if (this.selectedTool === 'drag' && this.userDragging) {
          this.drag_intermediateX += (e.x - this.drag_previousX) / grid.attributes.scale;
          this.drag_intermediateY += (e.y - this.drag_previousY) / grid.attributes.scale;

          // TODO: if shift held, round these numbers to "snap" item
          if (e.event.shiftKey) {
            this.drag_target.move(
              Math.round(this.drag_intermediateX),
              Math.round(this.drag_intermediateY)
            );
          } else {
            this.drag_target.move(this.drag_intermediateX, this.drag_intermediateY);
          }

          this.drag_previousX = e.x;
          this.drag_previousY = e.y;
        } else if (this.create_dragEnd) {
          this.create_dragEnd.move(e.root.x, e.root.y);
        } else if (this.create_previewCircuit) {
          this.create_previewCircuit.setAttribute('hidden', false);
          this.create_previewCircuit.move(e.root.x, e.root.y);
        }

        // TODO: highlight hovered element

        break;
      case 'up':
        this.userDragging = false;

        if (this.selectedTool === 'point') {
          var nodeView = findNodeView(e.root);

          if (nodeView) {
            var node = nodeView.data;
            node.set(!node.isSource);
          }
        } else if (this.selectedTool === 'create') {
          if (this.create_dragStart) {
            var endNode = findNodeView(e.root);

            if (endNode && this.create_dragStart !== endNode) {
              this.create_previewCircuit.data[1] = endNode;
              this.create_dragStart.data.connect(endNode.data);
              this.canvas.addPreviewChild();
            }
          } else if (this.create_previewCircuit) {
            this.canvas.addPreviewChild();
            this.toolbar.selectTool('point');
          }
        }

        this.create_dragStart = null;
        this.create_dragEnd = null;
        this.create_previewCircuit = null;

        break;
      case 'enter':
        if (this.create_previewCircuit) {
          this.create_previewCircuit.move(e.root.x, e.root.y);
          this.create_previewCircuit.setAttribute('hidden', false);
        }

        break;
      case 'leave':
        if (this.create_previewCircuit) {
          this.create_previewCircuit.setAttribute('hidden', true);
        }

        break;
    }
  }

  selectTool(tool) {
    if (tool === this.selectedTool) return;

    this.canvas.canvas.style.cursor = tool.cursor;

    if (this.create_previewCircuit) {
      this.canvas.setPreviewChild(null);
      this.create_previewCircuit = null;
    }

    if (tool.name === 'create') {
      this.sidebar.showCircuitsList();
    }

    this.selectedTool = tool.name;
  }

  selectCircuit(circuit) {
    if (this.selectedTool === 'create') {
      this.create_previewCircuit = new CircuitView(new Circuit(circuit));
      this.create_previewCircuit.setAttribute('hidden', true);
      this.canvas.setPreviewChild(this.create_previewCircuit);
    }
  }
}

// TODO: move these functions into a helper file?

function getMoveableTarget(tree, level = 0) {
  if (!tree) return null;

  if (level === 1) {
    return tree;
  }

  if (!tree.children) return null;

  for (var i = 0; i < tree.children.length; i++) {
    var found = getMoveableTarget(tree.children[i], level + 1);

    if (found) return found;
  }

  return tree;
}

function findNodeView(tree) {
  if (!tree) return null;

  if (tree.view instanceof NodeView) return tree.view;

  if (!tree.children) return null;

  for (var i = 0; i < tree.children.length; i++) {
    var found = findNodeView(tree.children[i]);

    if (found) return found;
  }

  return null;
}