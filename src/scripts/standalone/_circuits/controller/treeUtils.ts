
/* eslint-disable no-unused-vars */
import { Tree, BasicTree } from '../model/types';
/* eslint-enable no-unused-vars */

export function diff<T>(
  before: BasicTree<T>,
  after: BasicTree<T>,
  onChange?: (data: T, added: boolean) => void
) {
  if (!before || !after || before.data !== after.data) {
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

export function mapTree<T, U>(
  tree: BasicTree<T>,
  mapFunc: (data: T, level: number) => U,
  level: number = 0
): BasicTree<U> {
  if (!tree) return null;

  return {
    data: mapFunc(tree.data, level),
    children: tree.children &&
      tree.children
        .map(t => mapTree(t, mapFunc, level + 1))
  };
}

export function flatten<T>(tree: BasicTree<T>): T[] {
  if (!tree) return null;

  if (!tree.children) return [tree.data];

  return tree.children.reduce((arr, node) => {
    return arr.concat(flatten(node));
  }, [tree.data]);
}

export function traverse<T>(
  tree: BasicTree<T>,
  cb?: (data: T, tree: BasicTree<T>) => void
) {
  if (!tree) return;

  cb && cb(tree.data, tree);

  if (!tree.children) return;

  for (var i = 0; i < tree.children.length; i++) {
    traverse(tree.children[i], cb);
  }
}

export function findFirst<T, X extends Tree<T, X>>(
  tree: X,
  predicate: (tree: X, level: number) => boolean,
  level: number = 0
): X {
  if (!tree) return null;

  if (predicate(tree, level)) return tree;

  if (!tree.children) return null;

  for (var i = 0; i < tree.children.length; i++) {
    var found = findFirst(tree.children[i], predicate, level + 1);

    if (found) return found;
  }

  return null;
}