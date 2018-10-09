import Interaction from '../Interaction';
import { findFirst } from '../treeUtils';

import NodeView from '../../view/NodeView';
import CircuitView from '../../view/CircuitView';
import ConnectionView from '../../view/ConnectionView';
import Itembar from '../../view/Itembar';
import { PositionalEvent, PositionalTree, Tool } from '../../model/types';
import View from '../../view/View';

export default class SelectInteraction extends Interaction {
  isClickCandidate: boolean;
  lastHoverTarget: View;

  reset() {
    this.isClickCandidate = true;
    this.lastHoverTarget = null;
  }

  handleMouseEvent(e: PositionalEvent) {
    if (this.controller.selectedTool !== 'point') return;

    var canvas = this.controller.canvas;

    var hoverTree =  findNode(e.root)
                  || findCircuit(e.root)
                  || findConnection(e.root);
    var hoverTarget = hoverTree && hoverTree.data;
    if (hoverTarget !== this.lastHoverTarget) {
      this.isClickCandidate = false;
    }
    this.lastHoverTarget = hoverTarget;

    switch (e.type) {
    case 'down':
      if (!canvas.selectionArea) {
        this.isClickCandidate = true;
        canvas.startSelection(e.root.x, e.root.y);
      }

      break;
    case 'move':
      if (canvas.selectionArea) {
        canvas.endSelection(e.root.x, e.root.y);
        this.controller.hover(canvas.getSelected());
      } else {
        this.controller.hover(hoverTarget && [hoverTarget]);
      }

      break;
    case 'up':
      if (this.isClickCandidate && hoverTarget) {
        if (hoverTarget instanceof NodeView) {
          var node = hoverTarget.data;
          node.set(!node.isSource);
        } else {
          this.selectSingle(hoverTarget, e.event.ctrlKey);
        }
      } else if (canvas.selectionArea) {
        this.select(canvas.getSelected(), e.event.ctrlKey);
      }

      canvas.clearSelection();

      break;
    }
  }

  handleKeyEvent(e: KeyboardEvent) {
    switch (e.keyCode) {
    case 65: // A
      if (e.ctrlKey) {
        e.preventDefault();
        this.select(this.controller.canvas.getAll());
      }
      break;
    case 27: // ESC
    case 13: // Enter
      e.preventDefault();
      this.select(null);
      break;
    }
  }

  handleSelectTool(tool: Tool) {
    if (tool.name !== 'point') return;

    this.handleSelectViews(this.controller.selected);
  }

  handleSelectViews(views: View[]) {
    if (this.controller.selectedTool !== 'point') return;

    var infobar = this.controller.infobar;

    infobar.clear();

    if (!views) {
      infobar.showGenericInfo('point');
      infobar.addItem(Itembar.makeItem(
        'Select All', null, () => this.select(this.controller.canvas.getAll())
      ));
      return;
    }

    infobar.addInfoText(
      `${views.length} element${views.length === 1 ? '' : 's'} selected`
    );

    if (views.length === 1) {
      var view = views[0];
      if (view instanceof CircuitView) {
        infobar.addItem(
          Itembar.makeItem('Rotate 90°', null, () => view.rotate(1))
        );
      }
    }

    infobar.addItem(Itembar.makeItem('Delete', null, () => {
      views.forEach(v => v.remove());
      this.select(null);
    }));

    infobar.addItem(Itembar.makeItem('Cancel', null, () => {
      this.select(null);
    }));
  }

  selectSingle(view: View, adding?: boolean) {
    var selected = this.controller.selected;

    if (selected && adding) {
      selected = selected.filter(v => v !== view);

      if (selected.length === this.controller.selected.length) {
        selected.push(view);
      }

      this.select(selected);
    } else if (selected && selected.length === 1 && selected[0] === view) {
      this.select(null);
    } else {
      this.select([view]);
    }
  }

  select(views: View[], adding?: boolean) {
    if (adding) {
      this.controller.addToSelection(views);
    } else {
      this.controller.select(views);
    }
  }
}

function findNode(tree: PositionalTree): PositionalTree {
  return findFirst(tree, x => x.data instanceof NodeView);
}

function findCircuit(tree: PositionalTree): PositionalTree {
  return findFirst(tree, x => x.data instanceof CircuitView);
}

function findConnection(tree: PositionalTree): PositionalTree {
  return findFirst(tree, x => x.data instanceof ConnectionView);
}