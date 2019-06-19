const posthtml  = require('posthtml');
const through2  = require('through2');
const vfs       = require('vinyl-fs');
const path      = require('path');
const merge     = require('merge-stream');
const Readable  = require('stream').Readable;
const duplexify = require('duplexify');

module.exports = function (options = {}) {
  const root = options.baseDir
    ? path.join(process.cwd(), options.baseDir)
    : process.cwd();

  const inputs = {
    html: through2.obj(function (file, enc, cb) {
      posthtml([
        postHtmlPlugin(consume.bind(null, file))
      ]).process(file.contents.toString(enc), options)
        .then((result) => {
          file.contents = new Buffer(result.html);
          cb(null, file);
        })
        .catch(cb);
    }),
    style:  simpleReadable(),
    script: simpleReadable(),
  };

  const output = merge();

  function pipe(name) {
    var handler = options[name] || (src => src);

    output.add(handler(inputs[name]));
  }

  inputs.html.on('end', function () {
    inputs.style.push(null);
    inputs.script.push(null);
  });

  pipe('html');
  pipe('script');
  pipe('style');

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

    return new Promise(function (resolve, reject) {
      vfs.src(asset, { base: root })
        .on('data', data => inputs[type].push(data))
        .on('end', () => resolve(renamed))
        .on('error', err => {
          reject(err);
          inputs[type].emit('error', err);
        });
    });
  }

  return duplexify(inputs.html, output, { objectMode: true });
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

function simpleReadable() {
  var stream = new Readable({ objectMode: true });
  stream._read = function () {};
  return stream;
}