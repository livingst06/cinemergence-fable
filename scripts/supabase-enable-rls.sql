-- Enable RLS on ALL public tables in Supabase (Payload CMS).
-- Payload/Vercel connect as the `postgres` role (bypasses RLS).
-- PostgREST (anon/authenticated API keys) is blocked — no permissive policies.
--
-- Run: pnpm supabase:rls
-- Or paste into Supabase → SQL Editor.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      -- Skip PostGIS / extension system tables if present
      AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', r.tablename);
    RAISE NOTICE 'RLS enabled on public.%', r.tablename;
  END LOOP;
END $$;
