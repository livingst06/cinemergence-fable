-- Enable RLS on Payload CMS tables in Supabase.
-- Payload/Vercel connect as the `postgres` role (table owner — bypasses RLS
-- unless FORCE is set). PostgREST (anon/authenticated API keys) is blocked —
-- no permissive policies.
--
-- Covers every public table owned by postgres (new collections included).
-- Skips extension-owned tables (e.g. PostGIS spatial_ref_sys) that we cannot alter.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname AS tablename
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND pg_catalog.pg_get_userbyid(c.relowner) = current_user
      -- Extension-managed tables (PostGIS, etc.): not owned by us / not actionable.
      AND NOT EXISTS (
        SELECT 1
        FROM pg_depend d
        WHERE d.objid = c.oid
          AND d.deptype = 'e'
      )
    ORDER BY c.relname
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', r.tablename);
    RAISE NOTICE 'RLS enabled on public.%', r.tablename;
  END LOOP;
END $$;
