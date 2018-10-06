module.exports = [
  { name: 'point',   icon: 'fa fa-mouse-pointer', cursor: null,       label: 'Interact with objects' },
  { name: 'drag',    icon: 'fa fa-hand-rock',     cursor: 'grab',     label: "Move the canvas or objects" },
  { name: 'create',  icon: 'fa fa-plus',          cursor: null,       label: "Create new objects" },
  // { name: 'debug',   icon: 'fa fa-info',          cursor: 'help',     label: "Debug the target view(s)" },
  { name: 'zoomin',  icon: 'fa fa-search-plus',   cursor: 'zoom-in',  label: "Zoom in on the grid"},
  { name: 'zoomout', icon: 'fa fa-search-minus',  cursor: 'zoom-out', label: "Zoom out on the grid"},
  { name: 'export',  icon: 'fa fa-save',          cursor: null,       label: "Export data", isAction: true},
  { name: 'import',  icon: 'fa fa-folder-open',   cursor: null,       label: "Import data", isAction: true}
];