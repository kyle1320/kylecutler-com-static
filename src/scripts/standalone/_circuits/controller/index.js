import NodeView from "../view/NodeView";

export default class Controller {
  constructor (canvas, toolbar, sidebar) {
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.sidebar = sidebar;

    this.selectedTool = 'move';

    // TODO: break this up into smaller components

    this.shared_userDragging = false;

    this.drag_target = null;
    this.drag_previousX = null
    this.drag_previousY = null;
    this.drag_intermediateX = null
    this.drag_intermediateY = null;

    this.create_dragStart = null;
  }

  handleEvent(e) {
    switch (e.type) {
      case 'down':
        this.shared_userDragging = true;

        var drag = getMoveableTarget(e.root);
        if (drag) {
          this.drag_target = drag.view
          var {x, y} = this.drag_target.getDimensions();
          this.drag_intermediateX = x;
          this.drag_intermediateY = y;
        }

        this.create_dragStart = findNodeView(e.root);

        this.drag_previousX = e.x;
        this.drag_previousY = e.y;

        break;
      case 'move':
        var grid = e.root.view;

        if (this.selectedTool === 'drag' && this.shared_userDragging) {
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
        }
        // else {
        //   var hover = e.root;

        //   this.shared_hoverItem && traverse(this.shared_hoverItem, x => x.setAttribute('hover', false));

        //   // TODO: make this more efficient
        //   traverse(hover, x => x.setAttribute('hover', true));

        //   this.shared_hoverItem = hover;
        // }

        break;
      case 'up':
        this.shared_userDragging = false;

        var endNode = findNodeView(e.root);
        if (this.selectedTool === 'create' && this.create_dragStart && endNode) {
          if (this.create_dragStart !== endNode) {
            this.create_dragStart.data.connect(endNode.data);
          }
        }

        this.create_dragStart = null;

        break;
      case 'click':
        if (this.selectedTool === 'point') {
          var nodeView = findNodeView(e.root);

          if (nodeView) {
            var node = nodeView.data;
            node.set(!node.isSource);
          }
        }

        break;
    }
  }

  selectTool(tool) {
    this.canvas.canvas.style.cursor = tool.cursor;

    this.selectedTool = tool.name;
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