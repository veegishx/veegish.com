import { useState } from "react";

interface CounterProps {
	initialCount?: number;
}

export default function Counter({ initialCount = 0 }: CounterProps) {
	const [count, setCount] = useState(initialCount);

	return (
		<div className="flex flex-col items-center gap-4 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
			<p className="text-4xl font-bold" data-testid="counter-value">
				{count}
			</p>
			<div className="flex gap-2">
				<button
					onClick={() => setCount(count - 1)}
					className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors"
					aria-label="Decrement"
				>
					-
				</button>
				<button
					onClick={() => setCount(count + 1)}
					className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
					aria-label="Increment"
				>
					+
				</button>
				<button
					onClick={() => setCount(0)}
					className="px-4 py-2 bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500 rounded-lg transition-colors"
					aria-label="Reset"
				>
					Reset
				</button>
			</div>
		</div>
	);
}