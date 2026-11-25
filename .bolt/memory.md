# Project memory

## Product intent & audience

- Lead capture app/landing page that collects and stores leads in a database.
- Admin panel exists for viewing/managing leads.
- Lead attribution/origin tracking is now a confirmed feature requirement.

## Brand personality & voice

- Assistant communicates in Portuguese (pt-BR).

## Visual design & UX direction

- Admin panel includes table view of leads with columns for lead data plus **Source** (origem + meio) and **Campaign** (campanha + referrer).

## Decisions, constraints & rationale

- UTM capture feature confirmed and implemented.
- UTM params captured: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, plus HTTP `referrer`.
- Implementation flow: (1) DB columns added for UTM fields, (2) client-side utility captures params from entry URL, (3) hook sends UTM data at login/signup, (4) edge function persists UTM with lead record, (5) admin panel displays new Source & Campaign columns, (6) TypeScript types updated for DB schema.
- Architecture: Supabase edge functions for backend; client hooks for lead creation.
- Historical leads (~1,208 existing) cannot be backfilled — UTM data was never captured for them.
- Only new leads arriving via UTM-tagged URLs will have attribution data.

## Open questions & assumptions

- Assumption: leads arrive via URL links that can carry UTM query params.
- Unknown: whether additional attribution sources are needed (e.g., organic search, direct, social without UTM).
- Unknown: whether UTM data should be editable in admin or is read-only.
- Unknown: whether reporting/analytics on UTM data is desired beyond the table view.