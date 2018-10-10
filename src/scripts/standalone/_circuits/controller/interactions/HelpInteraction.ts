/* eslint-disable max-len */

import Interaction from '../Interaction';
import { Tool } from '../../model/types';

export default class HelpInteraction extends Interaction {
  public handleSelectTool(tool: Tool) {
    if (tool.name === 'help') {
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
<p>Available actions are grouped into various tools, each of which allows the user to interact with objects in different ways.</p>
<p>A tool can be selected by clicking on its icon in the toolbar at the very top of the page. Information relevant to the selected tool will be display in the info bar just below the toolbar at the top of the page.</p>
<p>What follows is a list of the available tools and their uses:</p>

<h3>The Pointer Tool</h3>
<p>The pointer tool allows the user to select and interact with objects on the grid.</p>
<p>A circuit or connection can be selected by clicking on it. Once selected, the info bar will show options for the selected element like deleting or rotating it.</p>
<p>If a node is clicked, it will be toggled on or off.</p>
<p>Multiple elements can be selected by clicking and dragging over multiple elements.</p>
<p>The Ctrl key can be held down while selecting elements in order to modify the current selection.</p>
<p>All elements in the workspace can be selected quickly by using the Ctrl+A keyboard shortcut.</p>

<h3>The Drag Tool</h3>
<p>The drag tool allows the user to move elements or the grid.</p>
<p>Simply click and drag an element in order to move it around the grid.</p>
<p>If multiple elements are selected, they will all be moved together.</p>
<p>By default, elements can be placed anywhere on the grid. In order to ensure a clean workspace, elements can be "snapped" to the grid. To enable this, either selecting the "snap to grid" option in the info bar, or hold the Shift key while dragging an element.</p>

<h3>The Add Tool</h3>
<p>The add tool allows the user to create new nodes, circuits, and connections.</p>
<p>To create a new node or circuit, simply select the desired element from the info bar and click anywhere in the design area to add the element to the workspace.</p>
<p>To create connections, click and drag from any node. When the mouse is released, if the drag ended on an existing node, that node will be connected to the starting node. Otherwise a new node will be created and connected.</p>

<h3>The Zoom In / Out Tools</h3>
<p>The zool tools allow the user to zoom in and out of the grid. Simply select one of the tools and click anywhere on the grid.</p>
<p>Scrolling the mouse (or pinching with two fingers on mobile) will also allow zooming at any time, even if another tool is selected.</p>

<h3>The Import / Export Tools</h3>
<p>The import / export tools allow the user to save and load their creations.</p>
<p>When using the export tool, any currently selected elements will be added to the data to be exported. If no elements are selected, then all elements in the workspace will be included.</p>
<p>When exporting, save the generated text somewhere safe so it can be imported later.</p>
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