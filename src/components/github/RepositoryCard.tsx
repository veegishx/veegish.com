import type { Repository } from "../../lib/github";
import { getLanguageColor, formatDate } from "../../lib/github";

interface RepositoryCardProps {
	repo: Repository;
}

export default function RepositoryCard({ repo }: RepositoryCardProps) {
	return (
		<a
			href={repo.html_url}
			target="_blank"
			rel="noopener noreferrer"
			className="group block p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
		>
			<div className="flex items-start justify-between gap-2 mb-2">
				<div className="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-zinc-400"
					>
						<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
						<path d="M9 18c-4.51 2-5-2-7-2" />
					</svg>
					<h3 className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
						{repo.name}
					</h3>
				</div>
			</div>

			<p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
				{repo.description || "No description"}
			</p>

			<div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
				{repo.language && (
					<span className="flex items-center gap-1">
						<span
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: getLanguageColor(repo.language) }}
						/>
						{repo.language}
					</span>
				)}

				<span className="flex items-center gap-1">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					{repo.stargazers_count}
				</span>

				<span className="flex items-center gap-1">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="6" y1="3" x2="6" y2="15" />
						<circle cx="18" cy="6" r="3" />
						<circle cx="6" cy="18" r="3" />
						<path d="M18 9a9 9 0 0 1-9 9" />
					</svg>
					{repo.forks_count}
				</span>

				<span className="ml-auto">
					Updated {formatDate(repo.updated_at)}
				</span>
			</div>

			{repo.topics.length > 0 && (
				<div className="flex flex-wrap gap-1 mt-3">
					{repo.topics.slice(0, 5).map((topic) => (
						<span
							key={topic}
							className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded"
						>
							{topic}
						</span>
					))}
				</div>
			)}
		</a>
	);
}