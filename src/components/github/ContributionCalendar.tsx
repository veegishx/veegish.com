import { useState, useMemo } from "react";
import type { ContributionData, ContributionDay } from "../../lib/github";

interface ContributionCalendarProps {
	data: ContributionData;
}

function getLevelColor(level: number, isDark: boolean): string {
	const colors = isDark
		? ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
		: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
	return colors[level] || colors[0];
}

export default function ContributionCalendar({ data }: ContributionCalendarProps) {
	const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	const [isDark, setIsDark] = useState(false);

	const weeks = useMemo(() => {
		const result: ContributionDay[][] = [];
		let currentWeek: ContributionDay[] = [];

		if (data.contributions.length === 0) return result;

		const firstDay = new Date(data.contributions[0].date);
		const paddingDays = firstDay.getDay();

		for (let i = 0; i < paddingDays; i++) {
			currentWeek.push({ date: "", level: 0, contributionCount: 0 });
		}

		for (const day of data.contributions) {
			currentWeek.push(day);
			if (currentWeek.length === 7) {
				result.push(currentWeek);
				currentWeek = [];
			}
		}

		if (currentWeek.length > 0) {
			result.push(currentWeek);
		}

		return result;
	}, [data.contributions]);

	const months = useMemo(() => {
		const result: { name: string; weekIndex: number }[] = [];
		let lastMonth = -1;

		weeks.forEach((week, weekIndex) => {
			const validDay = week.find((d) => d.date);
			if (validDay) {
				const date = new Date(validDay.date);
				const month = date.getMonth();
				if (month !== lastMonth) {
					result.push({
						name: date.toLocaleString("en-US", { month: "short" }),
						weekIndex,
					});
					lastMonth = month;
				}
			}
		});

		return result;
	}, [weeks]);

	const totalContributions = data.total || data.contributions.reduce(
		(sum, day) => sum + day.contributionCount,
		0
	);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-display">
					{totalContributions.toLocaleString()} contributions in the last year
				</h3>
				<button
					onClick={() => setIsDark(!isDark)}
					className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
				>
					{isDark ? "Light" : "Dark"} mode
				</button>
			</div>

			<div className="overflow-x-auto">
				<svg
					width="100%"
					className="min-w-[800px]"
					viewBox={`0 0 ${weeks.length * 14 + 40} 120`}
				>
					<g transform="translate(40, 0)">
						{months.map((month, i) => (
							<text
								key={`month-${i}`}
								x={month.weekIndex * 14}
								y="0"
								fontSize="10"
								fill={isDark ? "#8b949e" : "#666"}
							>
								{month.name}
							</text>
						))}

						{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
							<text
								key={`day-${i}`}
								x="-10"
								y={i * 14 + 18}
								fontSize="9"
								fill={isDark ? "#8b949e" : "#666"}
								textAnchor="end"
							>
								{i % 2 === 1 ? day.substring(0, 3) : ""}
							</text>
						))}

						{weeks.map((week, weekIndex) => (
							<g key={`week-${weekIndex}`} transform={`translate(${weekIndex * 14}, 12)`}>
								{week.map((day, dayIndex) => {
									if (!day.date) {
										return (
											<rect
												key={`empty-${dayIndex}`}
												x="0"
												y={dayIndex * 14}
												width="12"
												height="12"
												fill="transparent"
											/>
										);
									}

									return (
										<rect
											key={day.date}
											x="0"
											y={dayIndex * 14}
											width="12"
											height="12"
											rx="2"
											fill={getLevelColor(day.level, isDark)}
											className="cursor-pointer transition-opacity hover:opacity-80"
											onMouseEnter={(e) => {
												setHoveredDay(day);
												const rect = e.currentTarget.getBoundingClientRect();
												setTooltipPos({
													x: rect.left + rect.width / 2,
													y: rect.top - 10,
												});
											}}
											onMouseLeave={() => setHoveredDay(null)}
										/>
									);
								})}
							</g>
						))}
					</g>
				</svg>
			</div>

			<div className="flex items-center justify-end gap-2 text-xs text-zinc-500">
				<span>Less</span>
				{[0, 1, 2, 3, 4].map((level) => (
					<span
						key={level}
						className="w-3 h-3 rounded-sm"
						style={{ backgroundColor: getLevelColor(level, isDark) }}
					/>
				))}
				<span>More</span>
			</div>

			{hoveredDay && (
				<div
					className="fixed z-50 px-3 py-2 text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg shadow-lg pointer-events-none"
					style={{
						left: tooltipPos.x,
						top: tooltipPos.y,
						transform: "translate(-50%, -100%)",
					}}
				>
					<p className="font-medium">
						{hoveredDay.contributionCount} contribution{hoveredDay.contributionCount !== 1 ? "s" : ""}
					</p>
					<p className="text-xs text-zinc-400 dark:text-zinc-500">
						{new Date(hoveredDay.date).toLocaleDateString("en-US", {
							weekday: "long",
							month: "long",
							day: "numeric",
							year: "numeric",
						})}
					</p>
				</div>
			)}
		</div>
	);
}