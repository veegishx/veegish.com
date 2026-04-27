import { getCollection } from "astro:content";

export interface Backlink {
	slug: string;
	title: string;
	description: string;
	url: string;
	collection: "blog" | "projects";
}

interface BacklinkEntry {
	backlinks: Backlink[];
}

let backlinkCache: Map<string, BacklinkEntry> | null = null;
let allLinksCache: { source: string; target: string; collection: "blog" | "projects" }[] | null = null;

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]/g, "");
}

function getWikiLinks(content: string): string[] {
	const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
	const matches: string[] = [];
	let match;
	while ((match = wikiLinkRegex.exec(content)) !== null) {
		const linkTarget = match[1].trim();
		if (!linkTarget.startsWith("http") && !linkTarget.startsWith("/")) {
			matches.push(linkTarget);
		}
	}
	return matches;
}

function getNormalizedSlug(title: string): string {
	return slugify(title);
}

export async function getBacklinksForPost(
	slug: string
): Promise<Backlink[]> {
	if (!backlinkCache) {
		await buildBacklinkCache();
	}

	const entry = backlinkCache?.get(slug);
	return entry?.backlinks || [];
}

export async function getAllLinks(): Promise<{
	source: string;
	target: string;
	collection: "blog" | "projects";
}[]> {
	if (allLinksCache) {
		return allLinksCache;
	}

	await buildBacklinkCache();
	return allLinksCache || [];
}

async function buildBacklinkCache(): Promise<void> {
	const blogEntries = await getCollection("blog");
	const projectEntries = await getCollection("project");

	const allEntries = [
		...blogEntries.map((e) => ({ ...e, collection: "blog" as const })),
		...projectEntries.map((e) => ({ ...e, collection: "projects" as const })),
	];

	const slugToEntry = new Map<string, (typeof allEntries)[0]>();
	const titleToSlug = new Map<string, string>();

	for (const entry of allEntries) {
		const entrySlug = entry.data.slug || slugify(entry.id);
		slugToEntry.set(entrySlug, entry);
		slugToEntry.set(slugify(entry.data.title), entry);
		titleToSlug.set(entry.data.title.toLowerCase(), entrySlug);
	}

	backlinkCache = new Map();
	allLinksCache = [];

	for (const entry of allEntries) {
		const entrySlug = entry.data.slug || slugify(entry.id);
		const wikiLinks = getWikiLinks(entry.body);

		for (const linkTarget of wikiLinks) {
			const normalizedLink = slugify(linkTarget);
			const targetSlug = titleToSlug.get(linkTarget.toLowerCase()) || normalizedLink;
			const targetEntry = slugToEntry.get(normalizedLink) || slugToEntry.get(targetSlug);

			if (targetEntry) {
				const targetEntrySlug =
					targetEntry.data.slug || slugify(targetEntry.id);

				allLinksCache.push({
					source: entrySlug,
					target: targetEntrySlug,
					collection: entry.collection,
				});

				if (!backlinkCache.has(targetEntrySlug)) {
					backlinkCache.set(targetEntrySlug, { backlinks: [] });
				}

				const existingBacklink = backlinkCache
					.get(targetEntrySlug)!
					.backlinks.find((b) => b.slug === entrySlug);

				if (!existingBacklink) {
					backlinkCache.get(targetEntrySlug)!.backlinks.push({
						slug: entrySlug,
						title: entry.data.title,
						description: entry.data.description,
						url: `/${entry.collection}/${entrySlug}`,
						collection: entry.collection,
					});
				}
			}
		}
	}
}

export async function getAllPostsWithBacklinks(): Promise<
	{ slug: string; backlinks: Backlink[] }[]
> {
	if (!backlinkCache) {
		await buildBacklinkCache();
	}

	const result: { slug: string; backlinks: Backlink[] }[] = [];

	backlinkCache?.forEach((entry, slug) => {
		if (entry.backlinks.length > 0) {
			result.push({ slug, backlinks: entry.backlinks });
		}
	});

	return result;
}

export async function getBacklinkCount(slug: string): Promise<number> {
	const backlinks = await getBacklinksForPost(slug);
	return backlinks.length;
}