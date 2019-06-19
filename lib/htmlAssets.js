const posthtml = require('posthtml');
const through2 = require('through2');
const vfs      = require('vinyl-fs');
const path     = require('path');

module.exports = function (options = {}, plugins = []) {
  const root = options.baseDir
    ? path.join(process.cwd(), options.baseDir)
    : process.cwd();

  const defaultHandler = (src, dest) => src.pipe(dest);

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
    const self = this;

    // TODO: don't process files twice

    return new Promise(function (resolve, reject) {
      (options[type] || defaultHandler)(
        vfs.src(asset, { base: root }),
        through2.obj(function (file, enc, cb) {
          // TODO: automatically determine new filename
          self.push(file);
          cb();
        }).on('finish', () => resolve(renamed))
          .on('error', reject)
      );
    });
  }

  return through2.obj(function (file, enc, cb) {
    posthtml([
      postHtmlPlugin(consume.bind(this, file)),
      ...plugins
    ]).process(file.contents.toString(enc), options)
      .then((result) => {
        file.contents = new Buffer(result.html);
        cb(null, file);
      })
      .catch(cb);
  });
};

function postHtmlPlugin(consume) {
  return (tree, cb) => {
    var count = 0;

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

      count++;

      consume(node.attrs[attr], type)
        .then(name => {
          // console.log('processed', node, name);
          node.attrs[attr] = name;
          if (!--count) cb(null, tree);
        })
        .catch(err => cb(err));

      return node;
    }

    tree.match([
      { tag: 'script' },
      { tag: 'link', attrs: { rel: 'stylesheet' } }
    ], handleNode);
  };
}