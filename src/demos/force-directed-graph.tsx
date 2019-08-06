import React from 'react';
import * as d3 from 'd3';
import { Data, DataNode, isLinked, PreLink, PostLink } from './force-directed-graph-types';

const scale = d3.scaleOrdinal(d3.schemeCategory10);
const color = (d: { group: string }) => scale(d.group);
const width = 600;
const height = 600;
const asyncData = d3.json<Data>("https://gist.githubusercontent.com/mbostock/4062045/raw/5916d145c8c048a6e3086915a6be464467391c62/miserables.json");

const useForceUpdate = () => {
    const [, setIt] = React.useReducer((it) => !it, false);
    return setIt as () => void;
};

const drag = (simulation: d3.Simulation<DataNode, undefined>) => {
    function dragstarted(d: DataNode) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: DataNode) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d: DataNode) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag<Element, DataNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }

export const Name = "force-directed-graph"
export const OriginalUrl = "https://observablehq.com/@d3/force-directed-graph";
export const Component: React.FC = () => {
    const forceUpdate = useForceUpdate();
    const [data, setData] = React.useState<Data>({ nodes: [], links: [] });
    React.useMemo(async () => asyncData.then(setData), []);
    const links = React.useMemo(() => data.links.map(d => Object.create(d) as PreLink), [data.links]);
    const nodes = React.useMemo(() => data.nodes.map(d => Object.create(d) as DataNode), [data.nodes]);

    const simulation = React.useMemo(() => d3.forceSimulation<DataNode>(nodes)
        .force("link", d3.forceLink<DataNode, d3.SimulationLinkDatum<DataNode>>(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2)),
        [nodes, links]
    );

    React.useEffect(() => {
        simulation.on("tick", () => forceUpdate());
        return () => { simulation.stop() };
    }, [simulation, forceUpdate])

    const dragCallback = drag(simulation);

    return (
        <svg style={{ width: "100%", height: "100%", font: "10px sans-serif" }} viewBox={`${0},${0},${width},${height}`}>
            <g stroke="#999" strokeOpacity={0.6}>
                {links
                    // If we don't filter, source/target might not be set up yet, causing an error in our React key
                    .filter<PostLink>(isLinked)
                    .map(d =>
                        <line key={d.source.id + ' ' + d.target.id} strokeWidth={Math.sqrt(d.value)} x1={d.source.x} y1={d.source.y} x2={d.target.x} y2={d.target.y} />
                    )}
            </g>
            <g stroke="#fff" strokeWidth={1.5}>
                {nodes.map(d =>
                    <circle key={d.id} r={5} fill={color(d)} cx={d.x} cy={d.y}
                        // Rather than using ref here, React events should be used instead. This would avoid using d3.select.
                        ref={elem => elem && d3.select(elem as Element).datum(d).call(dragCallback)}>
                        <title>{d.id}</title>
                    </circle>
                )}
            </g>
        </svg>
    );
}
