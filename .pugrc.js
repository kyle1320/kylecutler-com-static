module.exports = {
  locals: {
    __DEBUG__: (process.env.NODE_ENV !== 'production'),
    obfuscate: function (attributes) {
      var attrs = {};
      for (var key in attributes) {
        attrs[key] = Buffer.from(attributes[key]).toString('base64');
      }
      return {'data-obf': attrs};
    }
  }
};