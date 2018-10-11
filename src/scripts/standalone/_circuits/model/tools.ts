/* eslint-disable max-len */

import { Tool } from './types';

module.exports = [
  { name: 'point',   icon: 'fa fa-mouse-pointer',   cursor: null,       label: 'Interact with objects' },
  { name: 'drag',    icon: 'fa fa-hand-rock',       cursor: 'grab',     label: 'Move the canvas or objects' },
  { name: 'zoomin',  icon: 'fa fa-search-plus',     cursor: 'zoom-in',  label: 'Zoom in on the grid'},
  { name: 'zoomout', icon: 'fa fa-search-minus',    cursor: 'zoom-out', label: 'Zoom out on the grid'},
  { name: 'export',  icon: 'fa fa-save',            cursor: null,       label: 'Export data',          isAction: true},
  { name: 'import',  icon: 'fa fa-folder-open',     cursor: null,       label: 'Import data',          isAction: true},
  { name: 'help',    icon: 'fa fa-question-circle', cursor: null,       label: 'Open the Help dialog', isAction: true}
] as Tool[];

if (process.env.NODE_ENV === 'development') {
  module.exports.splice(2, 0,
    { name: 'debug', icon: 'fa fa-info', cursor: 'help', label: 'Debug events' }
  );
}