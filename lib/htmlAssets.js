const posthtml  = require('posthtml');
const through2  = require('through2');
const path      = require('path');

module.exports = function (options = {}) {
  const root = options.baseDir
    ? path.join(process.cwd(), options.baseDir)
    : process.cwd();

  function resolveAsset(base, name) {
    if (path.isAbsolute(name)) {
      return path.join(root, name);
    } else {
      return path.join(base, name);
    }
  }

  function renameAsset(base, name) {
    const parsed = path.parse(name);
    delete parsed.base;

    options.rename && options.rename(parsed);

    return path.format(parsed);
  }

  function consume(file, name, type) {
    const base = path.dirname(file.path);
    const asset = resolveAsset(base, name);
    const renamed = renameAsset(base, name);
    const relative = path.relative(process.cwd(), asset);

    switch (type) {
    case 'style':
      options.onStyle && options.onStyle(relative);
      break;
    case 'script':
      options.onScript && options.onScript(relative);
      break;
    }

    return renamed;
  }

  return through2.obj(function (file, enc, cb) {
    posthtml([
      postHtmlPlugin(consume.bind(null, file))
    ]).process(file.contents.toString(enc), options)
      .then((result) => {
        file.contents = new Buffer(result.html);
        cb(null, file);
      })
      .catch(cb);
  });
};

function postHtmlPlugin(consume) {
  return (tree) => {
    function handleNode(node) {
      const attr = {
        script: 'src',
        link:   'href'
      }[node.tag];
      const type = {
        script: 'script',
        link:   'style'
      }[node.tag];

      if (!node.attrs || !node.attrs[attr]) return node;

      // Don't compile URL resources
      if (node.attrs[attr].match(/^https?:\/\//)) return node;

      node.attrs[attr] = consume(node.attrs[attr], type);

      return node;
    }

    tree.match([
      { tag: 'script' },
      { tag: 'link', attrs: { rel: 'stylesheet' } }
    ], handleNode);
  };
}
