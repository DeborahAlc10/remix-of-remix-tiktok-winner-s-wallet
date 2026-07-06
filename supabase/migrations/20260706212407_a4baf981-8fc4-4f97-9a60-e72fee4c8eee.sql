
-- Drop existing overly-permissive policies
DROP POLICY IF EXISTS "Anyone can read user progress" ON public.user_progress;
DROP POLICY IF EXISTS "Anyone can insert user progress" ON public.user_progress;
DROP POLICY IF EXISTS "Anyone can update user progress" ON public.user_progress;
DROP POLICY IF EXISTS "Public read" ON public.user_progress;
DROP POLICY IF EXISTS "Public insert" ON public.user_progress;
DROP POLICY IF EXISTS "Public update" ON public.user_progress;

-- Revoke anon/authenticated table access; only service_role (edge functions) may touch this table
REVOKE ALL ON public.user_progress FROM anon;
REVOKE ALL ON public.user_progress FROM authenticated;
GRANT ALL ON public.user_progress TO service_role;

-- Keep RLS enabled with NO policies -> denies all client access by default
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
