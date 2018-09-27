import { EventEmitter } from "events";
import { makeElement } from "../../../utils";

export default class Toolbar extends EventEmitter {
  constructor (element, tools) {
    super();

    this.element = element;

    this.setTools(tools);
  }

  setTools(tools) {
    this.tools = tools;
    this.toolMap = {};

    tools.forEach(tool => {
      this.toolMap[tool.name] = {
        tool: tool,
        element: null
      }
    });
  }

  updateHTML() {
    const selectTool = (name) => {
      this.tools.forEach(tool => {
        var element = this.toolMap[tool.name].element;

        element.className = element.className.replace(/\s*selected/g, '');

        if (tool.name === name) {
          element.className += ' selected';
        }
      });
      this.emit('change', this.toolMap[name].tool);
    }

    this.tools.forEach(tool => {
      var element = makeElement({
          className: `tool ${tool.icon}`,
          id: `tool-${tool.name}`,
          title: tool.label
        }, '', {
          click: () => selectTool(tool.name)
      });
      this.toolMap[tool.name].element = element;
      this.element.appendChild(element);
    });

    selectTool(this.tools[0].name);
  }
}