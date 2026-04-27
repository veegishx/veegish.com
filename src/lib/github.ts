const GITHUB_USERNAME = "veegishx";
const GITHUB_API = "https://api.github.com";
const CONTRIBUTIONS_API = "https://github-contributions-api.com";

export interface Repository {
	id: number;
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
	updated_at: string;
	topics: string[];
	fork: boolean;
	archived: boolean;
	homepage: string | null;
}

export interface GitHubEvent {
	type: string;
	repo: { name: string; url: string };
	payload: {
		commits?: Array<{ message: string; sha: string }>;
		action?: string;
		pr?: { title: string; number: number };
		issue?: { title: string; number: number };
	};
	created_at: string;
}

export interface ContributionDay {
	date: string;
	level: number;
	contributionCount: number;
}

export interface ContributionData {
	total: number;
	contributions: ContributionDay[];
}

export async function getRepositories(): Promise<Repository[]> {
	try {
		const response = await fetch(
			`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30&type=owner`,
			{
				headers: {
					"Accept": "application/vnd.github.v3+json",
				},
			}
		);

		if (!response.ok) {
			console.error(`GitHub API error: ${response.status}`);
			return [];
		}

		const repos: Repository[] = await response.json();
		return repos.filter((repo) => !repo.fork && !repo.archived);
	} catch (error) {
		console.error("Failed to fetch repositories:", error);
		return [];
	}
}

export async function getRecentEvents(): Promise<GitHubEvent[]> {
	try {
		const response = await fetch(
			`${GITHUB_API}/users/${GITHUB_USERNAME}/events/public?per_page=50`,
			{
				headers: {
					"Accept": "application/vnd.github.v3+json",
				},
			}
		);

		if (!response.ok) {
			console.error(`GitHub API error: ${response.status}`);
			return [];
		}

		const events: GitHubEvent[] = await response.json();
		return events.slice(0, 20);
	} catch (error) {
		console.error("Failed to fetch events:", error);
		return [];
	}
}

export async function getContributions(): Promise<ContributionData> {
	try {
		const response = await fetch(
			`${CONTRIBUTIONS_API}/v1/users/${GITHUB_USERNAME}/contributions`
		);

		if (!response.ok) {
			console.error(`Contributions API error: ${response.status}`);
			return { total: 0, contributions: [] };
		}

		const data = await response.json();
		return {
			total: data.total,
			contributions: data.contributions.map((c: { date: string; level: number; count: number }) => ({
				date: c.date,
				level: c.level,
				contributionCount: c.count,
			})),
		};
	} catch (error) {
		console.error("Failed to fetch contributions:", error);
		return { total: 0, contributions: [] };
	}
}

export function getEventIcon(type: string): string {
	switch (type) {
		case "PushEvent":
			return "commit";
		case "CreateEvent":
			return "plus";
		case "DeleteEvent":
			return "trash";
		case "IssuesEvent":
			return "alert-circle";
		case "IssueCommentEvent":
			return "message-circle";
		case "PullRequestEvent":
			return "git-pull-request";
		case "PullRequestReviewEvent":
			return "check";
		case "ForkEvent":
			return "git-branch";
		case "WatchEvent":
			return "star";
		case "ReleaseEvent":
			return "tag";
		case "RefCreateEvent":
			return "bookmark";
		default:
			return "activity";
	}
}

export function getEventDescription(event: GitHubEvent): string {
	const repoName = event.repo.name.split("/")[1] || event.repo.name;

	switch (event.type) {
		case "PushEvent":
			const commitCount = event.payload.commits?.length || 0;
			const verb = commitCount === 1 ? "pushed" : "pushed";
			return `${verb} ${commitCount} commit${commitCount !== 1 ? "s" : ""} to ${repoName}`;

		case "CreateEvent":
			return `created a branch in ${repoName}`;

		case "DeleteEvent":
			return `deleted a branch in ${repoName}`;

		case "IssuesEvent":
			const issueAction = event.payload.action === "opened" ? "opened" : event.payload.action;
			return `${issueAction} issue in ${repoName}`;

		case "IssueCommentEvent":
			const commentAction = event.payload.action === "created" ? "commented on" : event.payload.action;
			return `${commentAction} issue in ${repoName}`;

		case "PullRequestEvent":
			const prAction = event.payload.action === "opened" ? "opened" : event.payload.action;
			return `${prAction} PR in ${repoName}`;

		case "PullRequestReviewEvent":
			return `reviewed a PR in ${repoName}`;

		case "ForkEvent":
			return `forked ${repoName}`;

		case "WatchEvent":
			return `starred ${repoName}`;

		case "ReleaseEvent":
			return `published a release in ${repoName}`;

		case "RefCreateEvent":
			return `created a tag in ${repoName}`;

		default:
			return `${event.type.replace("Event", "")} in ${repoName}`;
	}
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 60) {
		return `${diffMins}m ago`;
	} else if (diffHours < 24) {
		return `${diffHours}h ago`;
	} else if (diffDays < 7) {
		return `${diffDays}d ago`;
	} else {
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	}
}

export function getLanguageColor(language: string | null): string {
	const colors: Record<string, string> = {
		JavaScript: "#f1e05a",
		TypeScript: "#3178c6",
		Python: "#3572A5",
		Java: "#b07219",
		"C#": "#178600",
		"C++": "#f34b7d",
		C: "#555555",
		Ruby: "#701516",
		Go: "#00ADD8",
		Rust: "#dea584",
		Swift: "#F05138",
		Kotlin: "#A97BFF",
		PHP: "#4F5D95",
		Dart: "#00B4AB",
		Shell: "#89e051",
		HTML: "#e34c26",
		CSS: "#563d7c",
		Vue: "#41b883",
		Svelte: "#ff3e00",
		Astro: "#ff5a03",
		"MDX": "#fcb32c",
		Markdown: "#083fa1",
	};

	return language ? colors[language] || "#8b949e" : "#8b949e";
}