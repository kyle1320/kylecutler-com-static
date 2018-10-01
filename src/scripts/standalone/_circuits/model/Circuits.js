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
      { "type": "output", "target": 2, "value": "$0 $1 &" }
    ],
    "path": "M0,0 1,0 A1,1 0 1,1 1,2 L0,2 Z"
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
      { "type": "output", "target": 2, "value": "$0 $1 |" }
    ],
    "path": "M0,0 C0,0 1.3,0 2,1 2,1 1.3,2 0,2 0,2 1,1 0,0 Z"
  },
  "Not": {
    "name": "Not",
    "size": { "width": 1, "height": 0 },
    "pins": [
      { "x": 0, "y": 0, "ignoreInput": false },
      { "x": 1, "y": 0, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 1, "value": "$0 !" }
    ],
    "path": "M0,-.5 1,0 0,.5 Z M.75,.01 A.25,.25 0 1,0 .75,-.01 Z"
  },
  "Diode": {
    "name": "Diode",
    "size": { "width": 1, "height": 0 },
    "pins": [
      { "x": 0, "y": 0, "ignoreInput": false },
      { "x": 1, "y": 0, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 1, "value": "$0" }
    ],
    "path": "M0,-.5 1,0 0,.5 Z"
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
      { "type": "output", "target": 2, "value": "$0 $1 ^" }
    ],
    "path": "M.2,0 C.2,0 1.4,0 2,1 2,1 1.4,2 .2,2 .2,2 1.2,1 .2,0 Z M0,0 C0,0 1,1 0,2 0,2 1,1 0,0 Z"
  },
};