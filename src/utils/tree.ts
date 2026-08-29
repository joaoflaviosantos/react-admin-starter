export function flattenTrees<T extends { children?: T[] }>(trees: T[] = []): T[] {
  return trees.flatMap((node) => {
    const children = node.children ?? [];
    return [node, ...flattenTrees(children)];
  });
}
