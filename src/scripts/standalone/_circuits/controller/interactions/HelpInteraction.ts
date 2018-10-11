/* eslint-disable max-len */

import Interaction from '../Interaction';
import { ActionEvent } from '../../model/types';

export default class HelpInteraction extends Interaction {
  public handleActionEvent(e: ActionEvent) {
    if (e.id === 'help:show') {
      this.controller.modal.showInfoDialog(
        'About This App',
        `
<p>Circuits is a boolean logic circuit designer and simulator.</p>
<p>It lets you design and interact with logic circuits.</p>

<h2>What's a logic circuit?</h2>
<p>Unlike a regular electronic circuit, which deals with continuously variable voltages, currents, etc., a boolean logic circuit is only concerned with two voltage values: 0 and 1.</p>
<p>This simplification makes these types of circuits much easier to build and understand than a traditional circuit.</p>
<p>Logic circuits are typically composed of gates, and connections between those gates.</p>
<p>A gate can be understood as a set of input and output pins, each of which is either on or off. When the inputs change, the outputs change according to the type of each particular gate.</p>
<p>As an example, some of the most common gates are AND and OR gates. An AND gate consists of two inputs and one output. if both of the inputs are on, then the input is turned on, otherwise the output is turned off. OR gates work similarly, but the output is turned on whenever either of the inputs are on.</p>
<p>Circuits can be connected together by their pins. Whenever either connected pin is turned on, the value propagates to the other pin. This lets you chain gates together and build more complex circuits.</p>
<p>Pins can have multiple connections, in which case they will be turned on if any of their connected pins are turned on.</p>
<p>Gates can be connected together in many different ways, and can be used to simulate anything a computer can do!</p>

<h2>How do I use this app?</h2>
<p>The center design area holds the elements in the current workspace. It consists of an unbounded grid where elements can be added, removed, moved, and modified as desired.</p>
<p>There are a few different types of elements: nodes, connections, and circuits. Nodes are a single point of connection without any logic. Circuits are, well, circuits, and can be anything from a simple AND gate to something much more complicated. Connections are the lines between nodes, and will propagate any signal from one node to the other.</p>
<p>The Action Bar at the top of the screen shows the various available tools and actions, grouped into sections. A brief description of each element in the action bar can be seen by hovering over the item.</p>
<p>There are three types of elements within the action bar: buttons, toggles, and tools.</p>
<p>Buttons perform an instantaneous action, like deleting an element or showing this help dialog.</p>
<p>Toggles control whether or not an option is enabled or disabled.</p>
<p>Tools are similar to toggles, but only one can be selected at a time. The selected tool dictates what actions can be performed when interacting with the grid.</p>
<p>What follows is a list of the action bar sections and the options available in each.</p>

<h3>Select</h3>
<p>The select section consists of the Select tool, as well as various buttons for interacting with selections.</p>
<h4>The Select Tool</h4>
<p>The select tool allows the user to select and interact with objects on the grid, and is the default tool used if no other tool is selected.</p>
<p>When this tool is selected, A circuit or connection can be selected by clicking on it. Once selected, relevant action buttons will be enabled to allow actions like deleting or rotating the selected element(s).</p>
<p>If a node is clicked, it will be toggled on or off.</p>
<p>Multiple elements can be selected by clicking and dragging over multiple elements.</p>
<p>The Ctrl key can be held down while selecting elements in order to modify the current selection.</p>
<p>All elements in the workspace can be selected quickly by using the Ctrl+A keyboard shortcut.</p>

<h3>Drag</h3>
<p>The drag section consists of the Drag tool, and the "Snap to Grid" toggle.</p>
<h4>The Drag Tool</h4>
<p>The drag tool allows the user to move elements or the grid.</p>
<p>When this tool is selected, simply click and drag an element in order to move it around the grid.</p>
<p>If multiple elements are selected, when one if dragged they will all be moved together.</p>
<h4>Snap to Grid</h4>
<p>When this toggle is enabled, instead of allowing elements to be positioned anywhere, elements will be "snapped" to the gridlines.</p>

<h3>Create</h3>
<p>The create section contains several creation-related tools, each one of which corresponds with an element that can be created.</p>
<p>To create a new node or circuit, simply select the desired tool and click anywhere in the design area to add the element to the workspace.</p>
<p>To create connections, select any tool in this section, then click and drag from any node. When the mouse is released, if the drag ended on an existing node, that node will be connected to the starting node. Otherwise a new node will be created and connected.</p>

<h3>Zoom</h3>
<p>The zoom section contains buttons for zooming in and out. Simply click one of the tools and the grid will zoom in or out.</p>
<p>In addition to these buttons, scrolling the mouse over the grid (or pinching with two fingers on mobile) will also allow zooming at any time.</p>

<h3>Data</h3>
<p>The data section provides buttons for saving and loading data. It contains buttons for exporting and importing data. Clicking either of the buttons will open a dialog window.</p>
<p>When exporting, any currently selected elements will be added to the data to be exported. If no elements are selected, then all elements in the workspace will be included. Save the generated text somewhere safe so it can be imported later.</p>
<p>When importing, simply paste the previously exported text and click "Import" to load the previously saved data.</p>

<h3>Keyboard Shortcuts</h3>
<p>In addition to the above tools, various keyboard shortcuts can be used to interact with the workspace:</p>
<ul>
  <li><strong>Ctrl + A</strong> will select all elements in the workspace, regardless of the selected tool.</li>
  <li><strong>Ctrl + C</strong> will copy any selected elements.</li>
  <li><strong>Ctrl + V</strong> will paste the previously copied elements.</li>
  <li><strong>Delete</strong>, <strong>Backspace</strong> will delete any selected elements. If no elements are selected, and the cursor is hovering over an element (as indicated by a grey border), that element will be deleted.</li>
</ul>
        `
      );
    }
  }
}