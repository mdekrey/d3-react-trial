import React from 'react';
import * as d3Fetch from 'd3-fetch';
import * as d3Scale from 'd3-scale';
import * as d3Force from 'd3-force';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import { Data, DataNode, isLinked, PreLink, PostLink } from './force-directed-graph-types';

const scale = d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10);
const color = (d: { group: string }) => scale(d.group);
const width = 600;
const height = 600;
const asyncData = d3Fetch.json<Data>("https://gist.githubusercontent.com/mbostock/4062045/raw/5916d145c8c048a6e3086915a6be464467391c62/miserables.json");

const useForceUpdate = () => {
    const [, setIt] = React.useReducer((it) => !it, false);
    return setIt as () => void;
};

function getSvgCoords(e: React.MouseEvent<SVGGraphicsElement>, elem: SVGGraphicsElement): { x: number, y: number };
function getSvgCoords(e: MouseEvent, elem: SVGGraphicsElement): { x: number, y: number };
function getSvgCoords(e: React.MouseEvent<SVGGraphicsElement> | MouseEvent, elem: SVGGraphicsElement) {
    const ctm = elem.getScreenCTM();
    if (elem.ownerSVGElement && ctm) {
        const point = elem.ownerSVGElement.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const result = point.matrixTransform(ctm.inverse());
        return { x: result.x, y: result.y };
    }
    return { x: e.clientX, y: e.clientY };
}

const useDrag = (simulation: d3Force.Simulation<DataNode, undefined>) => {
    const [dragging, setDragging] = React.useState<{ data: DataNode, elem: SVGGraphicsElement } | null>(null);

    React.useEffect(() => {
        function mouseMove(e: MouseEvent) {
            if (dragging) {
                const coords = getSvgCoords(e, dragging.elem);
                dragging.data.fx = coords.x;
                dragging.data.fy = coords.y;
                e.stopPropagation();
            }
        }
        function mouseUp(e: MouseEvent) {
            if (dragging) {
                simulation.alphaTarget(0);
                dragging.data.fx = null;
                dragging.data.fy = null;
                e.stopPropagation();
                e.preventDefault();
                setDragging(null);
                document.removeEventListener("mousemove", mouseMove, true);
            }
        }
        document.addEventListener("mousemove", mouseMove, true)
        document.addEventListener("mouseup", mouseUp, true)

        return () => {
            document.removeEventListener("mousemove", mouseMove, true);
            document.removeEventListener("mouseup", mouseUp, true);
        }
    }, [dragging, setDragging, simulation])

    return (d: DataNode): Partial<React.SVGProps<SVGCircleElement>> => ({
        onMouseDownCapture: e => {
            simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            setDragging({ data: d, elem: e.currentTarget });
        }
    })
  }

export const Name = "force-directed-graph"
export const OriginalUrl = "https://observablehq.com/@d3/force-directed-graph";
export const Component: React.FC = () => {
    const forceUpdate = useForceUpdate();
    const [data, setData] = React.useState<Data>({ nodes: [], links: [] });
    React.useMemo(async () => asyncData.then(setData), []);
    const links = React.useMemo(() => data.links.map(d => Object.create(d) as PreLink), [data.links]);
    const nodes = React.useMemo(() => data.nodes.map(d => Object.create(d) as DataNode), [data.nodes]);

    const simulation = React.useMemo(() => d3Force.forceSimulation<DataNode>(nodes)
        .force("link", d3Force.forceLink<DataNode, d3Force.SimulationLinkDatum<DataNode>>(links).id(d => d.id))
        .force("charge", d3Force.forceManyBody())
        .force("center", d3Force.forceCenter(width / 2, height / 2)),
        [nodes, links]
    );

    React.useEffect(() => {
        simulation.on("tick", () => forceUpdate());
        return () => { simulation.stop() };
    }, [simulation, forceUpdate])

    const dragCallback = useDrag(simulation);

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
                    <circle key={d.id} r={5} fill={color(d)} cx={d.x} cy={d.y} {...dragCallback(d)}>
                        <title>{d.id}</title>
                    </circle>
                )}
            </g>
        </svg>
    );
}
