import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface GraphNode {
	id: string;
	title: string;
	collection: "blog" | "projects";
	description: string;
	backlinkCount: number;
	x?: number;
	y?: number;
	fx?: number | null;
	fy?: number | null;
}

interface GraphEdge {
	source: string | GraphNode;
	target: string | GraphNode;
}

interface GraphData {
	nodes: GraphNode[];
	edges: GraphEdge[];
	stats: {
		totalNodes: number;
		totalEdges: number;
		blogPosts: number;
		projects: number;
	};
}

interface GraphProps {
	className?: string;
}

export default function Graph({ className = "" }: GraphProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [data, setData] = useState<GraphData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

	useEffect(() => {
		fetch("/api/graph.json")
			.then((res) => res.json())
			.then((d: GraphData) => {
				setData(d);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		if (!data || !svgRef.current || !containerRef.current) return;

		const container = containerRef.current;
		const width = container.clientWidth;
		const height = container.clientHeight || 600;

		d3.select(svgRef.current).selectAll("*").remove();

		const svg = d3
			.select(svgRef.current)
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", [0, 0, width, height]);

		const g = svg.append("g");

		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 4])
			.on("zoom", (event) => {
				g.attr("transform", event.transform);
			});

		svg.call(zoom);

		const simulation = d3
			.forceSimulation<GraphNode>(data.nodes)
			.force(
				"link",
				d3
					.forceLink<GraphNode, GraphEdge>(data.edges)
					.id((d) => d.id)
					.distance(100)
			)
			.force("charge", d3.forceManyBody().strength(-300))
			.force("center", d3.forceCenter(width / 2, height / 2))
			.force("collision", d3.forceCollide().radius(40));

		const link = g
			.append("g")
			.attr("stroke", "#999")
			.attr("stroke-opacity", 0.6)
			.selectAll("line")
			.data(data.edges)
			.join("line")
			.attr("stroke-width", 1);

		const node = g
			.append("g")
			.selectAll("g")
			.data(data.nodes)
			.join("g")
			.attr("cursor", "pointer")
			.call(
				d3
					.drag<SVGGElement, GraphNode>()
					.on("start", (event, d) => {
						if (!event.active) simulation.alphaTarget(0.3).restart();
						d.fx = d.x;
						d.fy = d.y;
					})
					.on("drag", (event, d) => {
						d.fx = event.x;
						d.fy = event.y;
					})
					.on("end", (event, d) => {
						if (!event.active) simulation.alphaTarget(0);
						d.fx = null;
						d.fy = null;
					})
			);

		node
			.append("circle")
			.attr("r", (d) => Math.min(20 + d.backlinkCount * 2, 35))
			.attr("fill", (d) => (d.collection === "blog" ? "#6366f1" : "#22c55e"))
			.attr("stroke", "#fff")
			.attr("stroke-width", 2);

		node
			.append("text")
			.text((d) => d.title.substring(0, 15) + (d.title.length > 15 ? "..." : ""))
			.attr("text-anchor", "middle")
			.attr("dy", (d) => Math.min(20 + d.backlinkCount * 2, 35) + 15)
			.attr("font-size", "10px")
			.attr("fill", "currentColor")
			.attr("class", "dark:fill-white fill-zinc-800");

		node
			.on("mouseover", (event, d) => {
				setHoveredNode(d);
				setTooltipPos({ x: event.pageX, y: event.pageY });
			})
			.on("mouseout", () => {
				setHoveredNode(null);
			})
			.on("click", (_, d) => {
				const path = d.collection === "blog" ? `/${d.id}` : `/${d.collection}/${d.id}`;
				window.location.href = path;
			});

		simulation.on("tick", () => {
			link
				.attr("x1", (d) => (d.source as GraphNode).x!)
				.attr("y1", (d) => (d.source as GraphNode).y!)
				.attr("x2", (d) => (d.target as GraphNode).x!)
				.attr("y2", (d) => (d.target as GraphNode).y!);

			node.attr("transform", (d) => `translate(${d.x},${d.y})`);
		});

		return () => {
			simulation.stop();
		};
	}, [data]);

	if (loading) {
		return (
			<div className={`flex items-center justify-center h-96 ${className}`}>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
			</div>
		);
	}

	if (error) {
		return (
			<div className={`flex items-center justify-center h-96 text-red-500 ${className}`}>
				<p>Error loading graph: {error}</p>
			</div>
		);
	}

	return (
		<div ref={containerRef} className={`relative ${className}`}>
			<svg ref={svgRef} className="w-full h-auto" style={{ minHeight: "500px" }} />
			{hoveredNode && (
				<div
					className="fixed z-50 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg p-3 pointer-events-none max-w-xs"
					style={{
						left: tooltipPos.x + 10,
						top: tooltipPos.y + 10,
					}}
				>
					<p className="font-medium text-sm">{hoveredNode.title}</p>
					<p className="text-xs text-zinc-500 mt-1 line-clamp-2">
						{hoveredNode.description}
					</p>
					<p className="text-xs text-zinc-400 mt-2">
						{hoveredNode.backlinkCount} backlink{hoveredNode.backlinkCount !== 1 ? "s" : ""}
					</p>
				</div>
			)}
			{data && (
				<div className="absolute bottom-4 left-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-xs">
					<p>
						<span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-1" /> Blog ({data.stats.blogPosts})
					</p>
					<p>
						<span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" /> Projects ({data.stats.projects})
					</p>
					<p className="text-zinc-500 mt-2">{data.stats.totalEdges} connections</p>
				</div>
			)}
		</div>
	);
}