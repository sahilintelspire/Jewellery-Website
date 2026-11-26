import crypto from 'node:crypto';

/**
 * Convert arbitrary product/category name into a clean URL slug.
 */
export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Generate a unique readable reference code such as AURA-8F3K2P or BESPOKE-4C9A1X.
 */
export function generateReferenceCode(prefix = 'AURA') {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const timePart = Date.now().toString(36).slice(-3).toUpperCase();
  return `${prefix}-${timePart}${randomPart}`;
}
