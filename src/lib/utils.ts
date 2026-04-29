import { type CollectionEntry, getCollection } from "astro:content";

export const READING_WPM = 180;

export const calculateReadingTime = (content: string | undefined): number => {
	if (!content) return 0;
	const wordCount = content.split(/\s+/).filter(Boolean).length;
	return Math.ceil(wordCount / READING_WPM);
};

export const getShortDescription = (content: string, maxLength = 20) => {
	const splitByWord = content.split(" ");
	const length = splitByWord.length;
	return length > maxLength
		? `${splitByWord.slice(0, maxLength).join(" ")}...`
		: content;
};

export const processArticleDate = (date: Date) => {
	const monthSmall = date.toLocaleString("default", { month: "short" });
	const day = date.getDate();
	const year = date.getFullYear();
	return `${monthSmall} ${day}, ${year}`;
};

let configCache: CollectionEntry<"configuration"> | null = null;

export const getConfigurationCollection = async (): Promise<
	CollectionEntry<"configuration">
> => {
	if (configCache) return configCache;

	const configs = await getCollection("configuration");
	if (configs.length !== 1) {
		throw new Error(
			"Configuration file not found or multiple configuration files present.",
		);
	}
	configCache = configs[0];
	return configs[0];
};

export {
  getRepositories,
  getRecentEvents,
  getRecentCommits,
  getContributions,
  getEventIcon,
  getEventDescription,
  formatDate,
  getLanguageColor,
} from "./github";

export type {
  Repository,
  GitHubEvent,
  ContributionDay,
  ContributionData,
  Commit,
} from "./github";