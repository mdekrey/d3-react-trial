import * as D3HierarchyDemo from "./d3-hierarchy-demo";
import * as D3ForceDirectedGraph from "./force-directed-graph";

interface Demo {
  Name: string;
  OriginalUrl: string;
  Component: React.FC<{}>
}

export const demos: Demo[] = [D3HierarchyDemo, D3ForceDirectedGraph];
