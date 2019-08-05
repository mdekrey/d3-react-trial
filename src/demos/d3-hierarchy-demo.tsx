import React from 'react';
import * as d3Fetch from 'd3-fetch';
import * as d3Hierarchy from 'd3-hierarchy';
import * as d3Shape from 'd3-shape';

const data = d3Fetch.json<DataNode>("https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json");
const width = 975;
const radius = width / 2;
const tree = d3Hierarchy.cluster<DataNode>().size([2 * Math.PI, radius - 100]);

interface DataNode {
  name: string;
  children: DataNode[];
}

export const Name = "radial-dendrogram"
export const OriginalUrl = "https://observablehq.com/@d3/radial-dendrogram?collection=@d3/d3-hierarchy";
export const Component: React.FC = () => {
  const [actualData, setData] = React.useState<DataNode>({ name: "unknown", children: [] });
  React.useMemo(async () => data.then(setData), []);

  const root = tree(d3Hierarchy.hierarchy(actualData)
    .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name)));
  const pathDFunc = d3Shape.linkRadial<{}, d3Hierarchy.HierarchyPointNode<DataNode>>()
    .angle(d => d.x)
    .radius(d => d.y);

  return (
    <svg style={{ width: "100%", height: "100%", font: "10px sans-serif" }} viewBox={`${-radius},${-radius},${width},${width}`}>
      <g fill="none" stroke="#555" strokeOpacity="0.4" strokeWidth="1.5">
        {root.links().map(link => <path key={link.source.data.name + "--->" + link.target.data.name} d={pathDFunc(link) || undefined} />)}
      </g>
      <g strokeLinejoin="round" strokeWidth="3">
        {root.descendants().reverse().map(d =>
          <g transform={`
          rotate(${d.x * 180 / Math.PI - 90})
          translate(${d.y},0)
        `} key={d.data.name + d.depth}>
            <circle fill={d.children ? "#555" : "#999"} r={2.5}></circle>
            <text dy="0.31em"
                  x={(d.x < Math.PI) === !d.children ? 6 : -6}
                  textAnchor={(d.x < Math.PI) === !d.children ? "start" : "end"}
                  transform={d.x >= Math.PI ? "rotate(180)" : undefined}
                  stroke="white">{d.data.name}</text>
            <text dy="0.31em"
                  x={(d.x < Math.PI) === !d.children ? 6 : -6}
                  textAnchor={(d.x < Math.PI) === !d.children ? "start" : "end"}
                  transform={d.x >= Math.PI ? "rotate(180)" : undefined}>{d.data.name}</text>
          </g>)}
      </g>
    </svg>
  );
}
