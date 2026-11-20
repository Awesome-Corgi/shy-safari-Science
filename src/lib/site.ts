/**
 * Where qui-et lives on the web, for the few places that need absolute
 * addresses: canonical links, social previews, structured data and the
 * sitemap. Search engines are pointed at this one and nowhere else, so change
 * it rarely: settings and Notes are saved per origin (ADR 0013).
 */

export const SITE_URL = "https://qui-et.pages.dev";

/** Every page a search engine should know about, in sitemap order. */
export const PAGES = ["/", "/privacy"] as const;

export type PagePath = (typeof PAGES)[number];

/**
 * The picture link previews show: the savanna with a few animals out and the
 * name over it. A 1200×630 capture of the real Scene, in `static/`.
 */
export const PREVIEW_IMAGE = `${SITE_URL}/og-image.png`;

export function absoluteUrl(path: PagePath): string {
  return new URL(path, SITE_URL).href;
}
