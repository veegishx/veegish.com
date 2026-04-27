import type { CollectionEntry } from "astro:content";

export type ArticleFrontmatter = CollectionEntry<"blog">["data"] & {
	url: string;
	updatedAt: Date;
};

export type ProjectFrontmatter = CollectionEntry<"project">["data"] & {
  url: string;
};
