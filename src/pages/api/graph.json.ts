import { getCollection } from "astro:content";
import { getAllLinks } from "../../lib/backlinks";

export const prerender = true;

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]/g, "");
}

export async function GET() {
	const blogEntries = await getCollection("blog");
	const projectEntries = await getCollection("project");
	const links = await getAllLinks();

	const nodes = [
		...blogEntries.map((entry) => ({
			id: entry.data.slug || slugify(entry.id),
			title: entry.data.title,
			collection: "blog" as const,
			description: entry.data.description,
			backlinkCount: links.filter((l) => l.target === (entry.data.slug || slugify(entry.id))).length,
		})),
		...projectEntries.map((entry) => ({
			id: entry.data.slug || slugify(entry.id),
			title: entry.data.title,
			collection: "projects" as const,
			description: entry.data.description,
			backlinkCount: links.filter((l) => l.target === (entry.data.slug || slugify(entry.id))).length,
		})),
	];

	const edges = links.map((link) => ({
		source: link.source,
		target: link.target,
	}));

	return new Response(
		JSON.stringify({
			nodes,
			edges,
			stats: {
				totalNodes: nodes.length,
				totalEdges: edges.length,
				blogPosts: blogEntries.length,
				projects: projectEntries.length,
			},
		}),
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
}