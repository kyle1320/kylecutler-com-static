export function diff(before, after, onChange) {
  if (!before || !after || before.view !== after.view) {
    if (before) traverse(before, x => onChange(x, false));
    if (after)  traverse(after,  x => onChange(x, true));
    return;
  }

  var childrenBefore = before.children || [];
  var childrenAfter = after.children || [];
  var count = Math.max(childrenBefore.length, childrenAfter.length);

  for (var i = 0; i < count; i++) {
    diff(childrenBefore[i], childrenAfter[i], onChange);
  }
}

export function mapTree(tree, mapFunc, level = 0) {
  if (!tree) return tree;

  tree = mapFunc(tree, level);

  if (!tree.children) return tree;

  tree.children = tree.children
    .map(x => mapTree(x, mapFunc, level + 1))
    .filter(x => !!x);

  return tree;
}

export function traverse(tree, cb) {
  if (!tree) return;

  cb && cb(tree.view, tree);

  if (!tree.children) return;

  for (var i = 0; i < tree.children.length; i++) {
    traverse(tree.children[i], cb);
  }
}

export function findFirst(tree, predicate, level = 0) {
  if (!tree) return null;

  if (predicate(tree, level)) return tree;

  if (!tree.children) return null;

  for (var i = 0; i < tree.children.length; i++) {
    var found = findFirst(tree.children[i], predicate, level + 1);

    if (found) return found;
  }

  return null;
}