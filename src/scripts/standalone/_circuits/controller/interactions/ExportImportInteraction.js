import Interaction from "../Interaction";

export default class ExportImportInteraction extends Interaction {
  handleSelectTool(tool) {

    // TODO: error handling

    if (tool.name === 'export') {
      this.controller.modal.showTextboxDialog(
        "Export Data",
        "Copy the text below and save it somewhere. Then it can be imported later.",
        this.controller.export()
      );
    } else if (tool.name === 'import') {
      this.controller.modal.showTextboxInputDialog(
        "Import Data",
        "Paste your previously exported data snippet here and click 'Import' to add it to the current grid.",
        "Import",
        text => this.controller.import(text)
      );
    }
  }
}