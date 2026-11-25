/*
# Add UTM tracking columns to user_progress

1. New Columns
- `utm_source` (text, nullable) — origin of the traffic (e.g. "tiktok", "facebook")
- `utm_medium` (text, nullable) — marketing medium (e.g. "cpc", "social")
- `utm_campaign` (text, nullable) — campaign name
- `utm_content` (text, nullable) — ad/content variant
- `utm_term` (text, nullable) — paid keyword
- `referrer` (text, nullable) — HTTP Referer header / document.referrer

2. Notes
- All columns are nullable so existing 1208 rows are unaffected.
- Values are captured from URL query parameters on first visit and persisted
  at the moment a new lead record is created (login action).
- Existing leads will have NULL values — no backfill is possible since the
  data was never captured.
*/