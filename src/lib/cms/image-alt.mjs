/**
 * Shared default alt text for CMS images.
 *
 * Every image on the site should carry alt text written for that image. When
 * an editor leaves the field empty, this default keeps the image from
 * rendering with no description at all. It names the item the image belongs
 * to, so a screen reader hears something specific rather than a bare
 * "image". Used by the site components and by the news intake script, so
 * both paths produce the same fallback.
 *
 * @param {string | null | undefined} title  Title of the item the image belongs to.
 * @param {string} [kind='news article']       What the item is, for the phrasing.
 * @returns {string}
 */
export function defaultImageAlt(title, kind = 'news article') {
  const t = (title || '').trim();
  return t ? `Image for the WAVES ${kind} "${t}"` : `Image for a WAVES ${kind}`;
}

/**
 * Alt text to render for an image: the editor's own alt when present,
 * otherwise the shared default.
 *
 * @param {{ alt?: string | null } | null | undefined} image
 * @param {string | null | undefined} title
 * @param {string} [kind]
 * @returns {string}
 */
export function imageAlt(image, title, kind) {
  const own = (image?.alt || '').trim();
  return own || defaultImageAlt(title, kind);
}
