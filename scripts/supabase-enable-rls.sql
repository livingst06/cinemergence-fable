-- Enable RLS on Payload CMS tables in Supabase.
-- Payload/Vercel connect as the `postgres` role (bypasses RLS).
-- PostgREST (anon/authenticated API keys) is blocked — no permissive policies.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND (
        tablename LIKE 'payload\_%' ESCAPE '\'
        OR tablename LIKE 'formations%'
        OR tablename LIKE 'intervenants%'
        OR tablename IN (
          'users',
          'users_sessions',
          'media',
          'temoignages',
          'form_submissions',
          'site_settings',
          'legal_pages'
        )
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', r.tablename);
    RAISE NOTICE 'RLS enabled on public.%', r.tablename;
  END LOOP;
END $$;
