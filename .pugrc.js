module.exports = {
    basedir: "src/",
    locals: {
      __DEBUG__: process.env.NOVE_ENV === "development",
      obfuscate: function obfuscate(attributes) {
        var attrs = {};
        for (var key in attributes) {
          attrs[key] = Buffer.from(attributes[key]).toString('base64');
        }
        return {'data-obf': attrs};
      }
    }
};