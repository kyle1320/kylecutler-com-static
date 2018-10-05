import { toggleClass } from "../../../utils";
import Itembar from "./Itembar";

export default class Toolbar extends Itembar {
  constructor (element, tools) {
    super();

    this.element = element;

    this.setTools(tools);
  }

  setTools(tools) {
    this.tools = tools;
    this.toolMap = {};

    tools.forEach(tool => {
      var item = Itembar.makeIconItem(
        tool.icon,
        { id: `tool-${tool.name}`, title: tool.label },
        () => this.selectTool(tool.name)
      );

      this.toolMap[tool.name] = { tool, item, enabled: true };
    });

    this.clear();
    this.tools.forEach(tool => this.addItem(this.toolMap[tool.name].item));
  }

  selectTool(name) {
    var data = this.toolMap[name];

    if (!data.enabled) return;

    if (!data.tool.isAction) {
      this.selectItem(data.item);
    }

    this.emit('change', data.tool);
  }

  setEnabled(toolName, enabled) {
    this.toolMap[toolName].enabled = enabled;
    toggleClass(this.toolMap[toolName].item, 'disabled', !enabled);
  }
}