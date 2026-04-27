import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async () => {
	const username = "veegishx";

	try {
		const calendarUrl = `https://github-contributions-api.deno.dev/${username}.json`;
		const response = await fetch(calendarUrl);

		if (!response.ok) {
			return new Response(JSON.stringify({ total: 0, contributions: [] }), {
				headers: { "Content-Type": "application/json" },
			});
		}

		const data = await response.json();

		const contributions = data.contributions.map(
			(c: { date: string; level: number; contributionCount: number }) => ({
				date: c.date,
				level: c.level || 0,
				contributionCount: c.contributionCount || 0,
			})
		);

		return new Response(
			JSON.stringify({
				total: data.totalContributions || 0,
				contributions,
			}),
			{
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Failed to fetch contributions:", error);
		return new Response(JSON.stringify({ total: 0, contributions: [] }), {
			headers: { "Content-Type": "application/json" },
		});
	}
};