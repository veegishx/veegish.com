import type { Commit } from "../../lib/github";
import { formatDate } from "../../lib/github";

interface CommitListProps {
  commits: Commit[];
}

export default function CommitList({ commits }: CommitListProps) {
  console.log("CommitList rendering with", commits.length, "commits");

  if (commits.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        No recent commits
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {commits.map((commit, index) => (
        <a
          key={`${commit.sha}-${index}`}
          href={`https://github.com/${commit.repo}/commit/${commit.sha}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
        >
          <span className="flex-shrink-0 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 group-hover:text-(--color-zag-accent-dark) dark:group-hover:text-(--color-zag-accent-light)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <line x1="1.05" y1="12" x2="7" y2="12" />
              <line x1="17.01" y1="12" x2="22.96" y2="12" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
              {commit.message}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
              {commit.repo.split("/")[1]} · {formatDate(commit.date)}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
