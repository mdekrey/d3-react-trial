export type LinkedSimulationLink<T extends d3.SimulationLinkDatum<any>> = Pick<
  T,
  Exclude<keyof T, "source" | "target">
> & {
  source: T extends d3.SimulationLinkDatum<infer U> ? U : never;
  target: T extends d3.SimulationLinkDatum<infer U> ? U : never;
};

export function isLinked<T extends d3.SimulationLinkDatum<any>>(
  link: any
): link is LinkedSimulationLink<T> {
  return (
    typeof link.source !== "string" &&
    typeof link.source !== "number" &&
    typeof link.target !== "string" &&
    typeof link.target !== "number"
  );
}

export interface Data {
  nodes: DataNode[];
  links: DataLink[];
}

export interface DataNode extends d3.SimulationNodeDatum {
  id: string;
  group: string;
}

export interface DataLink {
  source: string;
  target: string;
  value: number;
}

export type PreLink = d3.SimulationLinkDatum<DataNode> & DataLink;
export type PostLink = LinkedSimulationLink<
  d3.SimulationLinkDatum<DataNode> & DataLink
>;
