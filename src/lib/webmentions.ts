export interface WebmentionAuthor {
  type: "card";
  name: string;
  photo?: string;
  url?: string;
}

export interface WebmentionEntry {
  type: "entry";
  author: WebmentionAuthor;
  url: string;
  published?: string;
  "wm-received"?: string;
  "wm-id"?: number;
  content?: { text?: string; html?: string };
  "wm-property": string;
}

export interface GroupedWebmentions {
  likes: WebmentionEntry[];
  reposts: WebmentionEntry[];
  replies: WebmentionEntry[];
  bookmarks: WebmentionEntry[];
}

const WMIO_API = "https://webmention.io/api/mentions.jf2";

export async function fetchWebmentions(targetUrl: string): Promise<GroupedWebmentions> {
  const grouped: GroupedWebmentions = {
    likes: [],
    reposts: [],
    replies: [],
    bookmarks: [],
  };

  try {
    const url = new URL(WMIO_API);
    url.searchParams.set("target", targetUrl);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Veegish-Webmentions/1.0" },
    });

    if (!res.ok) return grouped;

    const data = (await res.json()) as {
      type: "feed";
      name: string;
      children: WebmentionEntry[];
    };

    for (const entry of data.children ?? []) {
      switch (entry["wm-property"]) {
        case "like-of":
          grouped.likes.push(entry);
          break;
        case "repost-of":
          grouped.reposts.push(entry);
          break;
        case "in-reply-to":
          grouped.replies.push(entry);
          break;
        case "bookmark-of":
          grouped.bookmarks.push(entry);
          break;
      }
    }
  } catch {
    // Silently fail so builds never break
  }

  return grouped;
}
