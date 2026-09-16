/**
 * Turn the stream link an admin pasted into something the match page can show.
 *
 * YouTube links come in several shapes (watch?v=, youtu.be/, live/, embed/);
 * all of them become a privacy-enhanced embed. Anything else is not embedded -
 * the page offers a plain link instead - because we cannot know whether the
 * host allows framing, and a blank iframe is worse than a button.
 */

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,}$/;

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value.trim());
  } catch {
    return null;
  }
};

/** True for a value the admin form accepts: an absolute http(s) URL. */
export const isValidStreamUrl = (value: string): boolean => {
  const url = parseUrl(value);
  return url !== null && (url.protocol === "http:" || url.protocol === "https:");
};

/** The YouTube video id inside a link, or null for anything that is not YouTube. */
export const youtubeVideoId = (value: string): string | null => {
  const url = parseUrl(value);
  if (!url) return null;

  let candidate: string | null = null;

  if (url.hostname === "youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "watch") {
      candidate = url.searchParams.get("v");
    } else if (
      (parts[0] === "live" || parts[0] === "embed" || parts[0] === "shorts") &&
      parts[1]
    ) {
      candidate = parts[1];
    }
  }

  return candidate && YOUTUBE_ID.test(candidate) ? candidate : null;
};

/** The iframe `src` for a YouTube link, or null when the page should show a link instead. */
export const youtubeEmbedUrl = (value: string): string | null => {
  const id = youtubeVideoId(value);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
};
