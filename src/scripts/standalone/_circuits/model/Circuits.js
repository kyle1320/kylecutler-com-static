module.exports = {
  "And": {
    "name": "And",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0, "y": 0, "type": false },
      { "x": 0, "y": 2, "type": false },
      { "x": 2, "y": 1, "type": true }
    ],
    "rules": [
      { "type": "output", "target": 2, "value": "0 & 1" }
    ],
    "path": "M0,0 L1,0 A1,1 0 1,1 1,2 L0,2 Z"
  },
  "Or": {
    "name": "Or",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0, "y": 0, "type": false },
      { "x": 0, "y": 2, "type": false },
      { "x": 2, "y": 1, "type": true }
    ],
    "rules": [
      { "type": "output", "target": 2, "value": "0 | 1" }
    ],
    "path": "M0,0 L2,1 L0,2 Z"
  },
  "Not": {
    "name": "Not",
    "size": { "width": 1, "height": 0 },
    "pins": [
      { "x": 0, "y": 0, "type": false },
      { "x": 1, "y": 0, "type": true }
    ],
    "rules": [
      { "type": "output", "target": 1, "value": "! 0" }
    ],
    "path": "M0,-.5 L1,0 L0,.5 Z"
  }
};