import NodeView from "../view/NodeView";
import CircuitView from "../view/CircuitView";
import Circuit from "../model/Circuit";
import ConnectionView from "../view/ConnectionView";
import Node from "../model/Node";
import View from "../view/View";

export default class Controller {
  constructor (canvas, toolbar, infobar) {
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.infobar = infobar;

    this.selectedTool = 'move';
    this.hoverTree = null;
    this.zIndex = 0;
  }

  hover(tree) {
    if (this.hoverTree === tree) return;

    switch (this.selectedTool) {
      case 'point':
        tree = findNode(tree) || findCircuit(tree) || findConnection(tree);
        break;
      case 'drag':
        tree = getMoveableTarget(tree);
        tree.children = null;
        break;
      case 'debug':
        break;
      default:
        tree = null;
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

  move(el, dx, dy, shouldSnap) {
    el.setAttribute('zIndex', this.zIndex) && this.zIndex++;

    if (shouldSnap) el.move(Math.round(dx), Math.round(dy));
    else            el.move(dx, dy);
  }

  zoom(delta, cx = 0, cy = 0) {
    var { x, y } = this.canvas.getDimensions();
    var curScale = this.canvas.attributes.scale;
    var newScale = Math.min(70, Math.max(5, curScale + delta));
    var factor = curScale / newScale;
    var offsetX = (cx + x) * (1 - factor);
    var offsetY = (cy + y) * (1 - factor);
    this.canvas.move(x - offsetX, y - offsetY);
    this.canvas.setAttribute('scale', newScale);
  }

  select(view) {
    if (view === this.canvas) view = null;
    else if (view instanceof NodeView) {
      var node = view.data;
      node.set(!node.isSource);
      return;
    }

    if (this.select_selectedView) {
      this.select_selectedView.setAttribute('active', false);
    }

    view && view.setAttribute('active', true);
    this.select_selectedView = view;

    if (this.selectedTool === 'point') {
      this.infobar.editView(view);
    }
  }

  createNew() {
    if (this.create_creator) {
      this.create_previewCircuit = this.create_creator();
      this.create_previewCircuit.setAttribute('hidden', true);
      this.canvas.setPreviewChild(this.create_previewCircuit);
    }
  }

  handleMouseEvent(e) {
    this.hover(e.root);

    if (this.selectedTool === 'debug') {
      console.log(e);
    }

    switch (e.type) {
      case 'down':
        if (this.selectedTool === 'zoomin') {
          this.zoom(5, e.root.x, e.root.y);
        } else if (this.selectedTool === 'zoomout') {
          this.zoom(-5, e.root.x, e.root.y);
        } else if (this.selectedTool === 'drag' && (e.event.buttons & 1)) {
          var drag = getMoveableTarget(e.root);
          if (drag) {
            this.drag_target = drag.view;
            this.drag_offsetX = drag.x;
            this.drag_offsetY = drag.y;
          }
        } else if (this.selectedTool === 'create' || (e.event.buttons & 2)) {
          this.create_dragStart = findNodeView(e.root);
          if (this.create_dragStart) {
            this.create_dragEnd = new NodeView(new Node(), e.root.x, e.root.y);
            this.create_dragEnd.parent = this.canvas;
            this.create_previewCircuit = new ConnectionView(this.create_dragStart, this.create_dragEnd, this.canvas);
            this.create_previewCircuit.setAttribute('hidden', true);
            this.canvas.setPreviewChild(this.create_previewCircuit);
          }
        }

        break;
      case 'move':
        if (this.drag_target) {
          if (this.drag_target === this.canvas) {
            var {x, y} = this.canvas.dimensions;
            e.root.x += x;
            e.root.y += y;
          }
          this.move(
            this.drag_target,
            e.root.x - this.drag_offsetX,
            e.root.y - this.drag_offsetY,
            e.event.shiftKey
          );
        } else if (this.create_dragStart) {
          var endNode = findNodeView(e.root);

          this.create_previewCircuit && this.create_previewCircuit.setAttribute('hidden', false);

          if (endNode) {
            var pos = View.getRelativePosition(endNode, this.canvas);
            this.move(this.create_dragEnd, pos.x, pos.y);
          } else {
            this.move(this.create_dragEnd, e.root.x, e.root.y, e.event.shiftKey);
          }
        } else if (this.create_previewCircuit) {
          this.create_previewCircuit.setAttribute('hidden', false);
          this.move(
            this.create_previewCircuit,
            e.root.x - this.create_previewCircuit.dimensions.width / 2,
            e.root.y - this.create_previewCircuit.dimensions.height / 2,
            e.event.shiftKey
          );
        }

        break;
      case 'up':
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
            this.createNew();
          }
        } else if (this.selectedTool === 'point') {
          this.select(this.hoverTree && this.hoverTree.view);
        }

        this.create_dragStart = null;
        this.create_dragEnd = null;

        this.drag_target = null;

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
      case 'scroll':
        this.zoom(-e.event.deltaY / 20, e.root.x, e.root.y);
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
    if (tool.name === this.selectedTool) return;

    this.selectedTool = tool.name;

    this.canvas.canvas.style.cursor = tool.cursor;

    if (this.create_previewCircuit) {
      this.canvas.setPreviewChild(null);
      this.create_previewCircuit = null;
    }

    this.select(null);

    if (tool.name === 'create') {
      this.infobar.showCircuitsList();
      this.infobar.selectCircuit('Node');
    } else if (tool.name === 'point') {

    } else {
      this.infobar.showEmpty();
    }
  }

  selectCircuit(creator) {
    if (this.selectedTool === 'create') {
      this.create_creator = creator;
      this.createNew();
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

function findCircuit(tree) {
  return findFirst(tree, x => x.view instanceof CircuitView);
}

function findConnection(tree) {
  return findFirst(tree, x => x.view instanceof ConnectionView);
}