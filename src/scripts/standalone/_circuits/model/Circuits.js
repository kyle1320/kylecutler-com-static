module.exports = {
  "And": {
    "name": "And",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0, "y": 0.3, "ignoreInput": false },
      { "x": 0, "y": 1.7, "ignoreInput": false },
      { "x": 2, "y": 1,   "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 2, "value": "$0 $1 &" }
    ],
    "style": {
      "path": "M0,0 1,0 A1,1 0 1,1 1,2 L0,2 Z"
    }
  },
  "Or": {
    "name": "Or",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0.2, "y": 0.3, "ignoreInput": false },
      { "x": 0.2, "y": 1.7, "ignoreInput": false },
      { "x": 2,   "y": 1,   "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 2, "value": "$0 $1 |" }
    ],
    "style": {
      "path": "M0,0 C0,0 1.3,0 2,1 2,1 1.3,2 0,2 0,2 1,1 0,0 Z"
    }
  },
  "Not": {
    "name": "Not",
    "size": { "width": 1.2, "height": 0 },
    "pins": [
      { "x": 0,   "y": 0, "ignoreInput": false },
      { "x": 1.2, "y": 0, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 1, "value": "$0 !" }
    ],
    "style": {
      "path": "M0,-.5 1,0 0,.5 Z M.95,.01 A.25,.25 0 1,0 .95,-.01 Z"
    }
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
    "style": {
      "path": "M0,-.5 1,0 0,.5 Z"
    }
  },
  "Xor": {
    "name": "Xor",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0.2, "y": 0.3, "ignoreInput": false },
      { "x": 0.2, "y": 1.7, "ignoreInput": false },
      { "x": 2,   "y": 1,   "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 2, "value": "$0 $1 ^" }
    ],
    "style": {
      "path": "M.2,0 C.2,0 1.4,0 2,1 2,1 1.4,2 .2,2 .2,2 1.2,1 .2,0 Z M0,0 C0,0 1,1 0,2 0,2 1,1 0,0 Z"
    }
  },
  "RGB": {
    "name": "RGB",
    "size": { "width": 2, "height": 2 },
    "pins": [
      { "x": 0, "y": 0.3, "ignoreInput": false },
      { "x": 0, "y": 1,   "ignoreInput": false },
      { "x": 0, "y": 1.7, "ignoreInput": false }
    ],
    "rules": [],
    "style": {
      "fillColor": "'#FFFFFF' '#FFFF00' $2 if '#FF00FF' '#FF0000' $2 if $1 if '#00FFFF' '#00FF00' $2 if '#0000FF' '#000000' $2 if $1 if $0 if",
      "path": "M0,0 2,0 2,2 0,2 Z"
    }
  },
};