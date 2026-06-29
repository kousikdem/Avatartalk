-- ════════════════════════════════════════════════════════════════════════
-- Avatar Studio v2 — Schema + RLS + Storage bucket
-- Paste this entire file into Supabase SQL Editor and click RUN.
-- Idempotent: safe to re-run.
-- ════════════════════════════════════════════════════════════════════════

-- ─── 1. avatar_presets (global, public-readable) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.avatar_presets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label        text NOT NULL,
  gender       text NOT NULL CHECK (gender IN ('male','female','other')),
  category     text NOT NULL CHECK (category IN ('professional','casual','creative','other')),
  style        text,
  image_url    text NOT NULL,
  sort_order   int DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avatar_presets_category ON public.avatar_presets (category);
CREATE INDEX IF NOT EXISTS idx_avatar_presets_gender   ON public.avatar_presets (gender);
CREATE INDEX IF NOT EXISTS idx_avatar_presets_sort     ON public.avatar_presets (sort_order);

ALTER TABLE public.avatar_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "avatar_presets_public_select" ON public.avatar_presets;
CREATE POLICY "avatar_presets_public_select"
  ON public.avatar_presets FOR SELECT
  USING (true);

-- ─── 2. user_custom_avatars (per-user uploads / face-swaps) ───────────────
CREATE TABLE IF NOT EXISTS public.user_custom_avatars (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url         text NOT NULL,
  source_preset_id  uuid REFERENCES public.avatar_presets(id) ON DELETE SET NULL,
  type              text NOT NULL CHECK (type IN ('upload','face_swap','preset_selected')) DEFAULT 'face_swap',
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_custom_avatars_user      ON public.user_custom_avatars (user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_avatars_user_date ON public.user_custom_avatars (user_id, created_at DESC);

ALTER TABLE public.user_custom_avatars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_custom_avatars_owner_all" ON public.user_custom_avatars;
CREATE POLICY "user_custom_avatars_owner_all"
  ON public.user_custom_avatars FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- service_role can read/write anything (backend bypass)
DROP POLICY IF EXISTS "user_custom_avatars_service_all" ON public.user_custom_avatars;
CREATE POLICY "user_custom_avatars_service_all"
  ON public.user_custom_avatars FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ─── 3. Storage bucket "avatars" (public-read) ────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 15728640,
        ARRAY['image/png','image/jpeg','image/jpg','image/webp']::text[])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for the bucket
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload to avatars bucket
DROP POLICY IF EXISTS "avatars_authenticated_upload" ON storage.objects;
CREATE POLICY "avatars_authenticated_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- ─── 4. Verification ──────────────────────────────────────────────────────
SELECT
  '✅ avatar_presets'    AS artifact,
  count(*)               AS row_count
FROM public.avatar_presets
UNION ALL
SELECT '✅ user_custom_avatars', count(*) FROM public.user_custom_avatars
UNION ALL
SELECT '✅ storage.bucket avatars', count(*) FROM storage.buckets WHERE id='avatars';
