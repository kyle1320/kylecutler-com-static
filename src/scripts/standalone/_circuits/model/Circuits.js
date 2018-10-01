module.exports = {
  "And": {
    "name": "And",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0, "y": 0, "ignoreInput": false },
      { "x": 0, "y": 2, "ignoreInput": false },
      { "x": 2, "y": 1, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 2, "value": "0 1 &" }
    ],
    "path": "M0,0 L1,0 A1,1 0 1,1 1,2 L0,2 Z"
  },
  "Or": {
    "name": "Or",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0, "y": 0, "ignoreInput": false },
      { "x": 0, "y": 2, "ignoreInput": false },
      { "x": 2, "y": 1, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 2, "value": "0 1 |" }
    ],
    "path": "M0,0 S1.3,0 2,1 M0,2 S1.3,2 2,1 M0,0 S1,1 0,2"
  },
  "Not": {
    "name": "Not",
    "size": { "width": 1, "height": 0 },
    "pins": [
      { "x": 0, "y": 0, "ignoreInput": false },
      { "x": 1, "y": 0, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 1, "value": "0 !" }
    ],
    "path": "M0,-.5 L1,0 L0,.5 Z M.75,.01 A.25,.25 0 1,0 .75,-.01 Z"
  },
  "Diode": {
    "name": "Diode",
    "size": { "width": 1, "height": 0 },
    "pins": [
      { "x": 0, "y": 0, "ignoreInput": false },
      { "x": 1, "y": 0, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 1, "value": "0" }
    ],
    "path": "M0,-.5 L1,0 L0,.5 Z"
  },
  "Xor": {
    "name": "Xor",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0, "y": 0, "ignoreInput": false },
      { "x": 0, "y": 2, "ignoreInput": false },
      { "x": 2, "y": 1, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 2, "value": "0 1 ^" }
    ],
    "path": "M.2,0 S1.4,0 2,1 M.2,2 S1.4,2 2,1 M.2,0 S1.2,1 .2,2 M0,0 S1,1 0,2"
  },
};