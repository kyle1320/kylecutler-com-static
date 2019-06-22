
import { Tree, BasicTree } from '../model/types';

export function flatten<T>(tree: BasicTree<T>): T[] {
  if (!tree) return null;

  if (!tree.children) return [tree.data];

  return tree.children.reduce((arr, node) => {
    return arr.concat(flatten(node));
  }, [tree.data]);
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