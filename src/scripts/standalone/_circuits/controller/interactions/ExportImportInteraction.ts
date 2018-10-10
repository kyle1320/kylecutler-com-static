import Interaction from '../Interaction';
import { Tool } from '../../model/types';

export default class ExportImportInteraction extends Interaction {
  public handleSelectTool(tool: Tool) {
    if (tool.name === 'export') {
      this.controller.modal.showTextboxDialog(
        'Export Data',
        'Copy the text below and save it somewhere. ' +
          'Then it can be imported later.',
        this.controller.export()
      );
    } else if (tool.name === 'import') {
      this.controller.modal.showTextboxInputDialog(
        'Import Data',
        'Paste your previously exported data snippet here ' +
          'and click \'Import\' to add it to the current grid.',
        'Import',
        (text: string): boolean | void => {
          try {
            this.controller.import(text);
          } catch (e) {
            this.controller.modal.showErrorDialog(
              'An Error Occured',
              'Sorry, something went wrong while importing your data.'
            );
            return false;
          }
        }
      );
    }
  }
}