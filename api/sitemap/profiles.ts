/**
 * GET /api/sitemap/profiles
 *
 * Returns a sitemap XML containing all public user profile URLs.
 * Uses the Supabase service role to query all profiles with a username.
 *
 * Vercel caches this response for 24 hours (s-maxage=86400).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin, sendError } from '../_lib/helpers';

const SITE_URL = 'https://avatartalk.co';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  // Allow any origin to fetch the sitemap (search engines, etc.)
  res.setHeader('Access-Control-Allow-Origin', '*');

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e: any) {
    // If service role key isn't set, return empty sitemap rather than 500
    console.warn('[sitemap/profiles] Service role key missing, returning empty sitemap:', e?.message);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).send(buildSitemap([]));
  }

  try {
    // Fetch all profiles that have a username (paginate in batches of 1000)
    const BATCH_SIZE = 1000;
    let allProfiles: Array<{ username: string; updated_at: string }> = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await admin
        .from('profiles')
        .select('username, updated_at')
        .not('username', 'is', null)
        .neq('username', '')
        .order('updated_at', { ascending: false })
        .range(from, from + BATCH_SIZE - 1);

      if (error) {
        console.error('[sitemap/profiles] Query error:', error);
        break;
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      allProfiles = allProfiles.concat(data as Array<{ username: string; updated_at: string }>);
      from += BATCH_SIZE;
      hasMore = data.length === BATCH_SIZE;
    }

    const xml = buildSitemap(allProfiles);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache for 24 hours, serve stale for 48 hours while revalidating
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=172800');

    return res.status(200).send(xml);
  } catch (err: any) {
    console.error('[sitemap/profiles] Error generating sitemap:', err);
    // Return empty sitemap on error rather than 500
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    return res.status(200).send(buildSitemap([]));
  }
}

function buildSitemap(profiles: Array<{ username: string; updated_at: string }>): string {
  const today = new Date().toISOString().split('T')[0];

  const urls = profiles
    .filter(p => p.username && p.username.trim())
    .map(p => {
      const lastmod = p.updated_at
        ? new Date(p.updated_at).toISOString().split('T')[0]
        : today;
      return `  <url>
    <loc>${SITE_URL}/${encodeURIComponent(p.username.trim().toLowerCase())}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}
