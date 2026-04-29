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

  const feedId = `${config.site.baseUrl}/articles/atom.xml`;
  const updated = sorted[0]
    ? new Date(sorted[0].data.timestamp).toISOString()
    : new Date().toISOString();

  const entries = sorted
    .map((post) => {
      const link = `${config.site.baseUrl}/${post.data.slug}`;
      const published = new Date(post.data.timestamp).toISOString();
      const entryUpdated = post.data.updatedAt
        ? new Date(post.data.updatedAt).toISOString()
        : published;
      const categories = (post.data.tags ?? [])
        .map((tag) => `    <category term="${escapeXml(tag)}" />`)
        .join("\n");

      return `  <entry>
    <title>${escapeXml(post.data.title)}</title>
    <link href="${escapeXml(link)}" />
    <id>${escapeXml(link)}</id>
    <published>${published}</published>
    <updated>${entryUpdated}</updated>
    <summary>${escapeXml(post.data.description)}</summary>
    <author>
      <name>${escapeXml(config.personal.name)}</name>
      ${
        config.personal.twitterProfile
          ? `<uri>${escapeXml(config.personal.twitterProfile)}</uri>`
          : ""
      }
    </author>
${categories}
  </entry>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.blogMeta.title)}</title>
  <link href="${escapeXml(config.site.baseUrl)}" />
  <link href="${escapeXml(feedId)}" rel="self" type="application/atom+xml" />
  <subtitle>${escapeXml(config.blogMeta.description)}</subtitle>
  <id>${escapeXml(feedId)}</id>
  <updated>${updated}</updated>
  <rights>Copyright ${new Date().getFullYear()} ${escapeXml(config.personal.name)}</rights>
  <author>
    <name>${escapeXml(config.personal.name)}</name>
    ${
      config.personal.twitterProfile
        ? `<uri>${escapeXml(config.personal.twitterProfile)}</uri>`
        : ""
    }
  </author>
  <generator>Astro</generator>
${entries}
</feed>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
};
