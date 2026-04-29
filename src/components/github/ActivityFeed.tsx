import type { GitHubEvent } from "../../lib/github";
import { getEventIcon, getEventDescription, formatDate } from "../../lib/github";

interface ActivityFeedProps {
	events: GitHubEvent[];
}

function EventIcon({ type }: { type: string }) {
	const iconName = getEventIcon(type);

	const icons: Record<string, JSX.Element> = {
		commit: (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="4" />
				<line x1="1.05" y1="12" x2="7" y2="12" />
				<line x1="17.01" y1="12" x2="22.96" y2="12" />
			</svg>
		),
		plus: (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<line x1="12" y1="5" x2="12" y2="19" />
				<line x1="5" y1="12" x2="19" y2="12" />
			</svg>
		),
		trash: (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M3 6h18" />
				<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
				<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
			</svg>
		),
		"alert-circle": (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
		),
		"message-circle": (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
			</svg>
		),
		"git-pull-request": (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="18" cy="18" r="3" />
				<circle cx="6" cy="6" r="3" />
				<path d="M13 6h3a2 2 0 0 1 2 2v7" />
				<line x1="6" y1="9" x2="6" y2="21" />
			</svg>
		),
		check: (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="20 6 9 17 4 12" />
			</svg>
		),
		"git-branch": (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<line x1="6" y1="3" x2="6" y2="15" />
				<circle cx="18" cy="6" r="3" />
				<circle cx="6" cy="18" r="3" />
				<path d="M18 9a9 9 0 0 1-9 9" />
			</svg>
		),
		star: (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
			</svg>
		),
		tag: (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
				<line x1="7" y1="7" x2="7.01" y2="7" />
			</svg>
		),
		bookmark: (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
			</svg>
		),
		activity: (
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
			</svg>
		),
	};

	return icons[iconName] || icons.activity;
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
	if (events.length === 0) {
		return (
			<p className="text-zinc-500 dark:text-zinc-400 text-sm">
				No recent activity
			</p>
		);
	}

	return (
		<div className="space-y-3">
			{events.map((event, index) => (
				<a
					key={`${event.type}-${event.created_at}-${index}`}
					href={`https://github.com/${event.repo.name}`}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
				>
					<span className="flex-shrink-0 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 group-hover:text-(--color-zag-accent-dark) dark:group-hover:text-(--color-zag-accent-light)">
						<EventIcon type={event.type} />
					</span>
					<div className="flex-1 min-w-0">
						<p className="text-sm text-zinc-700 dark:text-zinc-300">
							{getEventDescription(event)}
						</p>
						<p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
							{formatDate(event.created_at)}
						</p>
					</div>
					<span className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-600 font-mono">
						{event.repo.name.split("/")[1]}
					</span>
				</a>
			))}
		</div>
	);
}