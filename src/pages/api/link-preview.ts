import type { APIRoute } from "astro";

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");

  if (!target) return json({ error: "Missing url parameter" }, 400);

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return json({ error: "Invalid URL" }, 400);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return json({ error: "Only HTTP/HTTPS URLs are supported" }, 400);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Veegish-LinkPreview/1.0)",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return json({ error: `Failed to fetch URL (HTTP ${res.status})` }, 502);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return json({ error: "URL does not point to an HTML page" }, 400);
    }

    const html = await res.text();
    const preview = extractPreview(html, parsed);

    return json(preview);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return json({ error: "Request timed out" }, 504);
    }
    return json({ error: "Failed to fetch URL" }, 502);
  }
};

function extractPreview(html: string, parsed: URL) {
  const titleMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  );
  const descMatch = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
  );
  const imageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  );
  const titleFallback = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  let favicon: string | null = null;
  const iconMatch = html.match(
    /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i,
  ) ||
    html.match(
      /<link[^>]+href=["']([^"']+favicon[^"']*)["'][^>]+rel=["'](?:icon|shortcut icon)["']/i,
    );

  if (iconMatch) {
    try {
      favicon = new URL(iconMatch[1], parsed.origin).toString();
    } catch {
      favicon = null;
    }
  }

  if (!favicon) {
    favicon = `${parsed.origin}/favicon.ico`;
  }

  let imageUrl: string | null = null;
  if (imageMatch) {
    try {
      imageUrl = new URL(imageMatch[1], parsed.origin).toString();
    } catch {
      imageUrl = null;
    }
  }

  return {
    title: (titleMatch?.[1] ?? titleFallback?.[1]?.trim() ?? parsed.hostname).trim(),
    description: descMatch?.[1]?.trim() ?? null,
    image: imageUrl,
    favicon,
    url: parsed.toString(),
  };
}
