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
      { "type": "output", "target": 2, "value": "0 & 1" }
    ]
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
      { "type": "output", "target": 2, "value": "0 | 1" }
    ]
  },
  "Not": {
    "name": "Not",
    "size": { "width": 1, "height": 0 },
    "pins": [
      { "x": 0, "y": 0, "ignoreInput": false },
      { "x": 1, "y": 0, "ignoreInput": true }
    ],
    "rules": [
      { "type": "output", "target": 1, "value": "! 0" }
    ]
  }
};