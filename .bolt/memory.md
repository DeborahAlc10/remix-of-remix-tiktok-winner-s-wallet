# Project memory

## Product intent & audience

- Lead capture app/landing page that collects and stores leads in a database.
- User wants lead attribution data (where leads came from) — currently not available.

## Brand personality & voice

- Assistant communicates in Portuguese (pt-BR).

## Visual design & UX direction

- No visual specifics inferred yet.

## Decisions, constraints & rationale

- Database currently has no columns for UTM/source/campaign/origin.
- App code does not capture URL parameters (UTM source, medium, campaign, content, term).
- Lead attribution is therefore impossible with current implementation.
- Proposed (not yet confirmed): add automatic UTM capture from entry URL and persist with each lead record.

## Open questions & assumptions

- Awaiting user confirmation on whether to implement UTM capture feature.
- Assumption: leads arrive via URL links that could carry UTM query params.
- Unknown: current DB schema details, lead form fields, backend framework.
- Unknown: whether historical leads can be backfilled with any source data.