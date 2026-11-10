/*
# Create visitor_tracking table

1. New Tables
- `visitor_tracking`
  - `id` (uuid, primary key)
  - `session_id` (text, unique identifier per browser session, stored in localStorage)
  - `email` (text, nullable — only filled when the visitor types their email)
  - `visited_at` (timestamptz, when the visit happened)
  - `ip_hint` (text, nullable — coarse info for dedup, not stored as real IP)
  - `user_agent` (text, nullable — browser info for analytics)
2. Security
- Enable RLS on `visitor_tracking`.
- Grant INSERT to `anon, authenticated` so the browser can create a visit record without being signed in.
- No SELECT/UPDATE/DELETE for anon or authenticated — only the service_role (edge function) can read this table.
- Grant all CRUD to `service_role` for the edge function.
*/

CREATE TABLE IF NOT EXISTS visitor_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  email text,
  visited_at timestamptz NOT NULL DEFAULT now(),
  user_agent text
);

ALTER TABLE visitor_tracking ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON visitor_tracking TO service_role;
GRANT INSERT ON visitor_tracking TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_visitor" ON visitor_tracking;
CREATE POLICY "anon_insert_visitor"
ON visitor_tracking FOR INSERT
TO anon, authenticated WITH CHECK (true);
