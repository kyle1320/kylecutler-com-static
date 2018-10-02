import NodeView from "../view/NodeView";
import CircuitView from "../view/CircuitView";
import Circuit from "../model/Circuit";
import ConnectionView from "../view/ConnectionView";
import Node from "../model/Node";
import View from "../view/View";

export default class Controller {
  constructor (canvas, toolbar, sidebar) {
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.sidebar = sidebar;

    this.selectedTool = 'move';
    this.hoverTree = null;
    this.zIndex = 0;
  }

  hover(tree) {
    if (this.hoverTree === tree) return;

    switch (this.selectedTool) {
      case 'point':
        tree = findNode(tree);
        break;
      case 'create':
        tree = null;
        break;
      case 'drag':
        tree = getMoveableTarget(tree);
        tree.children = null;
        break;
    }

    diff(
      this.hoverTree,
      tree,
      x => x.setAttribute('hover', true),
      x => x.setAttribute('hover', false)
    );

    this.hoverTree = tree;
  }

  move(el, dx, dy) {
    el.setAttribute('zIndex', this.zIndex) && this.zIndex++;
    el.move(dx, dy);
  }

  handleMouseEvent(e) {
    this.hover(e.root);

    if (this.selectedTool === 'debug') {
      console.log(e);
    }

    switch (e.type) {
      case 'down':
        var drag = getMoveableTarget(e.root);
        if (drag) {
          this.drag_target = drag.view
          var {x, y} = this.drag_target.getDimensions();
          this.drag_intermediateX = x;
          this.drag_intermediateY = y;
        }

        if (this.selectedTool === 'create' || (e.event.buttons & 2)) {
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

        if (this.selectedTool === 'drag' && (e.event.buttons & 1)) {
          this.drag_intermediateX += (e.x - this.drag_previousX) / grid.attributes.scale;
          this.drag_intermediateY += (e.y - this.drag_previousY) / grid.attributes.scale;

          // TODO: if shift held, round these numbers to "snap" item
          if (e.event.shiftKey) {
            this.move(this.drag_target,
              Math.round(this.drag_intermediateX),
              Math.round(this.drag_intermediateY)
            );
          } else {
            this.move(this.drag_target, this.drag_intermediateX, this.drag_intermediateY);
          }

          this.drag_previousX = e.x;
          this.drag_previousY = e.y;
        } else if (this.create_dragStart) {
          var endNode = findNodeView(e.root);

          if (endNode) {
            var pos = View.getRelativePosition(endNode, this.canvas);
            this.move(this.create_dragEnd, pos.x, pos.y);
          } else {
            if (e.event.shiftKey) {
              this.move(this.create_dragEnd, Math.round(e.root.x), Math.round(e.root.y));
            } else {
              this.move(this.create_dragEnd, e.root.x, e.root.y);
            }
          }
        } else if (this.create_previewCircuit) {
          this.create_previewCircuit.setAttribute('hidden', false);
          if (e.event.shiftKey) {
            this.move(this.create_previewCircuit, Math.round(e.root.x), Math.round(e.root.y));
          } else {
            this.move(this.create_previewCircuit, e.root.x, e.root.y);
          }
        }

        // TODO: highlight hovered element

        break;
      case 'up':
        if (this.selectedTool === 'point') {
          var nodeView = findNodeView(e.root);

          if (nodeView) {
            var node = nodeView.data;
            node.set(!node.isSource);
          }
        }

        if (this.create_previewCircuit) {
          if (this.create_dragStart) {
            var endNode = findNodeView(e.root);

            if (!endNode) {
              this.canvas.addChild(this.create_dragEnd);
              endNode = this.create_dragEnd;
            }

            if (this.create_dragStart !== endNode) {
              this.create_previewCircuit.setEndpoint(1, endNode);
              this.create_dragStart.data.connect(endNode.data);
              this.canvas.addPreviewChild();
            }
          } else {
            this.canvas.addPreviewChild();
          }

          this.create_previewCircuit = null;

          if (this.selectedTool === 'create') {
            this.selectTool('point');
          }
        }

        this.create_dragStart = null;
        this.create_dragEnd = null;

        break;
      case 'enter':
        if (this.create_previewCircuit) {
          this.move(this.create_previewCircuit, e.root.x, e.root.y);
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

  handleKeyEvent(e) {
    switch (e.keyCode) {
      case 8:
      case 46:
        e.preventDefault();
        traverse(this.hoverTree, x => x.remove());
        break;
    }
  }

  selectTool(tool) {
    if (tool === this.selectedTool) return;

    this.selectedTool = tool.name;

    this.canvas.canvas.style.cursor = tool.cursor;

    if (this.create_previewCircuit) {
      this.canvas.setPreviewChild(null);
      this.create_previewCircuit = null;
    }

    if (tool.name === 'create') {
      this.sidebar.showCircuitsList();
      this.sidebar.selectCircuit('Node');
    } else {
      this.sidebar.showEmpty();
    }
  }

  selectCircuit(creator) {
    if (this.selectedTool === 'create') {
      this.create_previewCircuit = creator();
      this.create_previewCircuit.setAttribute('hidden', true);
      this.canvas.setPreviewChild(this.create_previewCircuit);
    }
  }
}

// TODO: move these functions into a helper file?

function diff(before, after, onInsert, onRemove) {
  if (!before || !after || before.view !== after.view) {
    if (before) traverse(before, onRemove);
    if (after)  traverse(after,  onInsert);
    return;
  }

  var childrenBefore = before.children || [];
  var childrenAfter = after.children || [];
  var count = Math.max(childrenBefore.length, childrenAfter.length);

  for (var i = 0; i < count; i++) {
    diff(childrenBefore[i], childrenAfter[i], onInsert, onRemove);
  }
}

function traverse(tree, cb) {
  if (!tree) return;

  cb(tree.view);

  if (!tree.children) return;

  for (var i = 0; i < tree.children.length; i++) {
    traverse(tree.children[i], cb);
  }
}

function findFirst(tree, predicate, level = 0) {
  if (!tree) return null;

  if (predicate(tree, level)) return tree;

  if (!tree.children) return null;

  for (var i = 0; i < tree.children.length; i++) {
    var found = findFirst(tree.children[i], predicate, level + 1);

    if (found) return found;
  }

  return null;
}

function getMoveableTarget(tree) {
  return findFirst(tree, (x, l) => l === 1 && !(x.view instanceof ConnectionView)) || tree;
}

function findNode(tree) {
  return findFirst(tree, x => x.view instanceof NodeView);
}

function findNodeView(tree) {
  var node = findNode(tree);
  return node && node.view;
}