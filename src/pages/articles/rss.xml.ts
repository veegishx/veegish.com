import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getConfigurationCollection } from "../../lib/utils";

export const prerender = true;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", (e) => e.data.published === true);
  const { data: config } = await getConfigurationCollection();

  const sorted = posts.sort(
    (a, b) => b.data.timestamp.valueOf() - a.data.timestamp.valueOf(),
  );

  const buildDate = new Date().toUTCString();
  const lastBuild = sorted[0]
    ? new Date(sorted[0].data.timestamp).toUTCString()
    : buildDate;

  const items = sorted
    .map((post) => {
      const pubDate = new Date(post.data.timestamp).toUTCString();
      const link = `${config.site.baseUrl}/${post.data.slug}`;
      const categories = (post.data.tags ?? [])
        .map((tag) => `    <category>${escapeXml(tag)}</category>`)
        .join("\n");

      return `  <item>
    <title>${escapeXml(post.data.title)}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <description>${escapeXml(post.data.description)}</description>
    <pubDate>${pubDate}</pubDate>
    <author>${escapeXml(config.personal.name)}</author>
${categories}
  </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.blogMeta.title)}</title>
    <link>${escapeXml(config.site.baseUrl)}</link>
    <description>${escapeXml(config.blogMeta.description)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(`${config.site.baseUrl}/articles/rss.xml`)}" rel="self" type="application/rss+xml" />
    <generator>Astro</generator>
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
