const devWarn = process.env.NODE_ENV === 'development' ? 'warn' : 'error';

module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules": {
        "no-console": "off",
        "indent": [
            devWarn,
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            devWarn,
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            devWarn,
            {
                "vars": "local",
                "args": "none"
            }
        ],
        "max-len": [
            devWarn,
            {
                "code": 80,
                "ignoreStrings": true,
                "ignoreComments": true
            }
        ]
    }
};