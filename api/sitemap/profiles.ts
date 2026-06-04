/**
 * GET /api/sitemap/profiles
 *
 * Returns an empty sitemap — user profiles are intentionally
 * excluded from public sitemaps to protect user privacy.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  return res.status(200).send(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
  );
}
