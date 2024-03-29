import Feature from '../Feature';

import { findFirst } from '../treeUtils';

import Node from '../../model/Node';
import Circuit from '../../model/Circuit';
import circuits from '../../model/Circuits';

import View from '../../view/View';
import NodeView from '../../view/NodeView';
import CircuitView from '../../view/CircuitView';
import ConnectionView from '../../view/ConnectionView';
import Controller from '../index';
import {
  PositionalTree,
  PositionalEvent,
  ActionEvent
} from '../../model/types';

export default class CreateFeature extends Feature {
  private circuits: string[];
  private circuitsMap: { [name: string]: () => View };
  private selectedCircuit: string;

  private dragStart: NodeView;
  private dragEnd: NodeView;
  private dragging: boolean;
  private previewCircuit: View;

  public constructor(controller: Controller) {
    super(controller);

    this.circuits = [];
    this.circuitsMap = {};

    this.reset();

    const addCircuit = (name: string, creator: () => View) => {
      this.circuits.push(name);
      this.circuitsMap[name] = creator;
    };

    addCircuit('Node', () => new NodeView(new Node(), 0, 0));

    for (const name in circuits) {
      const def = circuits[name];
      addCircuit(name, () => new CircuitView(new Circuit(def), 0, 0));
    }
  }

  public handleActionEvent(e: ActionEvent) {
    if (e.section !== 'create') return;

    this.selectCircuit(e.type === 'select' ? e.name : null);
  }

  public handleMouseEvent(e: PositionalEvent) {
    if (!this.selectedCircuit) return;

    const targetView = findNode(e.root);
    const targetPos =
      targetView &&
      View.getRelativePosition(targetView, this.controller.canvas);

    switch (e.type) {
      case 'down':
        if (targetView) {
          this.dragStart = targetView;
          this.dragEnd = new NodeView(new Node(), targetPos.x, targetPos.y);
          this.dragEnd.setParent(this.controller.canvas);
          this.previewCircuit = new ConnectionView(
            this.dragStart,
            this.dragEnd,
            this.controller.canvas
          );
          this.controller.canvas.setPreviewChild(this.previewCircuit);
        }

        this.dragging = true;

        break;
      case 'move':
        this.controller.hover(targetView && [targetView]);

        if (this.dragStart) {
          this.previewCircuit.setAttribute('hidden', false);

          if (targetView) {
            this.controller.move(
              this.dragEnd,
              targetPos.x,
              targetPos.y,
              false,
              false
            );
          } else {
            this.controller.move(
              this.dragEnd,
              e.root.x,
              e.root.y,
              e.event.shiftKey
            );
          }
        } else if (this.previewCircuit) {
          this.previewCircuit.setAttribute(
            'hidden',
            !this.dragging && !!targetView
          );
          this.controller.move(
            this.previewCircuit,
            e.root.x - this.previewCircuit.getDimensions().width / 2,
            e.root.y - this.previewCircuit.getDimensions().height / 2,
            e.event.shiftKey
          );
        }

        break;
      case 'up':
        if (this.previewCircuit && this.dragStart) {
          if (targetView) {
            (this.previewCircuit as ConnectionView).setEndpoint(1, targetView);
            this.dragEnd = targetView;
          } else {
            this.controller.canvas.addChild(this.dragEnd);
          }

          if (!this.dragStart.data.connect(this.dragEnd.data)) {
            this.controller.canvas.setPreviewChild(null);
            this.previewCircuit = null;
          }
        }

        if (this.previewCircuit) {
          this.previewCircuit.setAttribute('hidden', false);
          this.controller.canvas.addPreviewChild();
        }

        this.dragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.previewCircuit = null;

        this.createNew();

        break;
      case 'enter':
        if (this.previewCircuit) {
          this.controller.move(
            this.previewCircuit,
            e.root.x - this.previewCircuit.getDimensions().width / 2,
            e.root.y - this.previewCircuit.getDimensions().height / 2
          );
          this.previewCircuit.setAttribute('hidden', false);
        }

        break;
      case 'leave':
        if (this.previewCircuit) {
          this.previewCircuit.setAttribute('hidden', true);
        }

        break;
    }
  }

  private selectCircuit(name: string) {
    if (!name) {
      this.reset();
      return;
    }

    this.selectedCircuit = name;

    this.createNew();
  }

  protected reset() {
    this.dragStart = null;
    this.dragEnd = null;
    this.dragging = false;
    this.previewCircuit = null;
    this.selectedCircuit = null;
  }

  private createNew() {
    if (this.selectedCircuit) {
      this.previewCircuit = this.circuitsMap[this.selectedCircuit]();
      this.previewCircuit.setAttribute('hidden', true);
      this.controller.canvas.setPreviewChild(this.previewCircuit);
    }
  }
}

function findNode(tree: PositionalTree): NodeView {
  const node = findFirst(tree, (x) => x.data instanceof NodeView);
  return node && (node.data as NodeView);
}
