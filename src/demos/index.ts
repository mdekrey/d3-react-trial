import * as D3HierarchyDemo from "./d3-hierarchy-demo";

interface Demo {
  Name: string;
  OriginalUrl: string;
  Component: React.FC<{}>
}

export const demos: Demo[] = [D3HierarchyDemo];
