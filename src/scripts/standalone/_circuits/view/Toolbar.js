import { EventEmitter } from "events";
import { makeElement, toggleClass } from "../../../utils";

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
        element: null,
        enabled: true
      };
    });

    this.updateHTML();
  }

  selectTool(name) {
    var tool = this.toolMap[name].tool;

    if (!this.toolMap[name].enabled) return;

    if (!tool.isAction) {
      this.tools.forEach(tool => {
        var element = this.toolMap[tool.name].element;

        toggleClass(element, 'selected', tool.name === name);
      });
    }

    this.emit('change', tool);
  }

  updateHTML() {
    this.tools.forEach(tool => {
      var element = makeElement({
          className: `item__content item__content--icon ${tool.icon}`,
          id: `tool-${tool.name}`,
          title: tool.label
        }, '', {
          click: () => this.selectTool(tool.name)
      });
      this.toolMap[tool.name].element = element;
      this.element.appendChild(makeElement({ className: 'item' }, [element]));
    });
  }

  setEnabled(toolName, enabled) {
    this.toolMap[toolName].enabled = enabled;
    toggleClass(this.toolMap[toolName].element, 'disabled', !enabled);
  }
}