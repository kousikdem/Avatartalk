/**
 * GET /api/profile/by-username/[username]
 *
 * Public profile fetch. Uses the Supabase service role on the server
 * side so it bypasses RLS entirely — works whether or not the user has
 * applied the public-profile RLS migration in their database.
 *
 * Returns only safe columns. NEVER includes email, phone, dob, or any
 * other PII.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCors,
  getSupabaseAdmin,
  sendError,
} from '../../_lib/helpers';

const SAFE_PROFILE_COLUMNS = [
  'id',
  'username',
  'display_name',
  'full_name',
  'bio',
  'profession',
  'avatar_id',
  'avatar_url',
  'profile_pic_url',
  'country',
  'location',
  'website',
  'followers_count',
  'following_count',
  'created_at',
  'updated_at',
].join(', ');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  // The `[username]` dynamic segment is passed in req.query.username.
  // It may be a string OR string[] when there are multiple values.
  const raw = req.query.username;
  const username = Array.isArray(raw) ? raw[0] : raw;

  if (!username || typeof username !== 'string') {
    return sendError(res, 400, 'username is required');
  }

  // Strip any URL-encoded slashes etc.
  const clean = username.trim().toLowerCase();

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e: any) {
    return sendError(res, 500, e?.message || 'Server misconfiguration');
  }

  try {
    // 1. Fetch the profile (case-insensitive)
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select(SAFE_PROFILE_COLUMNS)
      .ilike('username', clean)
      .maybeSingle();

    if (profileError) {
      console.error('[profile/by-username] profile query error:', profileError);
      return sendError(res, 500, profileError.message);
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    const profileId = (profile as any).id as string;

    // 2. Fetch related public data in parallel (best-effort)
    const [statsResult, productsResult, eventsResult, avatarResult, socialResult] =
      await Promise.allSettled([
        admin
          .from('user_stats')
          .select('*')
          .eq('user_id', profileId)
          .maybeSingle(),
        admin
          .from('products')
          .select('*')
          .eq('user_id', profileId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(6),
        admin
          .from('events')
          .select('*')
          .eq('user_id', profileId)
          .in('status', ['published', 'upcoming'])
          .order('created_at', { ascending: false })
          .limit(6),
        admin
          .from('avatar_configurations')
          .select('*')
          .eq('user_id', profileId)
          .eq('is_active', true)
          .maybeSingle(),
        admin
          .from('social_links')
          .select('*')
          .eq('user_id', profileId)
          .maybeSingle(),
      ]);

    const pick = <T,>(r: PromiseSettledResult<{ data: T }>): T | null => {
      if (r.status === 'fulfilled') return (r.value as any)?.data ?? null;
      return null;
    };

    const userStats = pick<any>(statsResult) || {
      total_conversations: 0,
      followers_count: 0,
      profile_views: 0,
      engagement_score: 0,
    };

    // 30-second edge cache + stale-while-revalidate
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=30, stale-while-revalidate=60',
    );

    return res.status(200).json({
      success: true,
      profile,
      user_stats: userStats,
      products: pick<any[]>(productsResult) || [],
      events: pick<any[]>(eventsResult) || [],
      avatar_config: pick<any>(avatarResult),
      social_links: pick<any>(socialResult),
    });
  } catch (err: any) {
    console.error('[profile/by-username] unexpected error:', err);
    return sendError(res, 500, err?.message || 'Unexpected error');
  }
}
