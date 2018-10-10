import { toggleClass } from '../../../utils';
import Itembar from './Itembar';
import { Tool } from '../model/types';

export default class Toolbar extends Itembar {
  private tools: Tool[];
  private toolMap: {[name: string]: {
    tool: Tool,
    item: HTMLElement,
    enabled: boolean
  }};

  constructor (element: HTMLElement, tools: Tool[]) {
    super(element);

    this.setTools(tools);
  }

  private setTools(tools: Tool[]) {
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

  public selectTool(name: string) {
    var data = this.toolMap[name];

    if (!data.enabled) return;

    if (!data.tool.isAction) {
      this.selectItem(data.item);
    }

    this.emit('change', data.tool);
  }

  public setEnabled(toolName: string, enabled: boolean) {
    this.toolMap[toolName].enabled = enabled;
    toggleClass(this.toolMap[toolName].item, 'disabled', !enabled);
  }
}