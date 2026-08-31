// Edge function that owns all reads/writes for user_progress.
// The table has RLS enabled with NO policies, so only service_role
// (used here) can access it. Anon browser clients cannot.
//
// Access model:
// - `login` for a NEW email creates the row and returns a signed session token.
// - `login` for an EXISTING email requires a valid session token (proof the
//   caller previously created that account). Without it, we refuse — this
//   prevents anyone who merely knows a victim's email from reading their
//   status or overwriting their bank details.
// - `get`, `submitDocs`, `submitBank` all require a valid session token bound
//   to the email in the request.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SESSION_SECRET = Deno.env.get("USER_PROGRESS_SESSION_SECRET")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function publicShape(row: any) {
  if (!row) return null;
  return {
    email: row.email,
    userName: row.user_name,
    docsSubmitted: !!row.docs_submitted,
    bankSubmitted: !!row.bank_submitted,
    loginTs: Number(row.login_ts),
    lastSeenTs: row.last_seen_ts != null ? Number(row.last_seen_ts) : null,
  };
}

async function touchLastSeen(email: string) {
  try {
    await supabase
      .from("user_progress")
      .update({ last_seen_ts: Date.now() })
      .eq("email", email);
  } catch (e) {
    console.error("touchLastSeen failed", e);
  }
}

// --- Session token helpers (HMAC-SHA256 over `${email}:${issuedAt}`) ---
const encoder = new TextEncoder();

async function hmacKey() {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function issueToken(email: string) {
  const issuedAt = Date.now();
  const payload = `${email}:${issuedAt}`;
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${b64url(encoder.encode(payload))}.${b64url(sig)}`;
}

async function verifyToken(token: string, email: string): Promise<boolean> {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [payloadB64, sigB64] = token.split(".");
  try {
    const padded = (s: string) =>
      s.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (s.length % 4)) % 4);
    const payloadBytes = Uint8Array.from(atob(padded(payloadB64)), (c) =>
      c.charCodeAt(0),
    );
    const sigBytes = Uint8Array.from(atob(padded(sigB64)), (c) =>
      c.charCodeAt(0),
    );
    const payload = new TextDecoder().decode(payloadBytes);
    const [tokEmail] = payload.split(":");
    if (tokEmail !== email) return false;
    const key = await hmacKey();
    return await crypto.subtle.verify("HMAC", key, sigBytes, payloadBytes);
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, email, method, details, token } = await req.json();
    if (!action || typeof action !== "string") {
      return json({ error: "missing action" }, 400);
    }
    if (!email || typeof email !== "string") {
      return json({ error: "missing email" }, 400);
    }
    const normalizedEmail = email.trim().toLowerCase();

    // All actions except login require a valid session token bound to the email.
    if (action !== "login") {
      const ok = await verifyToken(token ?? "", normalizedEmail);
      if (!ok) return json({ error: "unauthorized" }, 401);
    }

    if (action === "get") {
      const { data, error } = await supabase
        .from("user_progress")
        .select("email,user_name,docs_submitted,bank_submitted,login_ts,last_seen_ts")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (error) throw error;
      if (data) await touchLastSeen(normalizedEmail);
      return json({ progress: publicShape(data) });
    }

    if (action === "login") {
      const { data: existing, error: selErr } = await supabase
        .from("user_progress")
        .select("email,user_name,docs_submitted,bank_submitted,login_ts,last_seen_ts")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (selErr) throw selErr;

      if (existing) {
        // Existing account: caller must prove ownership with the token they
        // received when they originally created the account.
        const ok = await verifyToken(token ?? "", normalizedEmail);
        if (!ok) return json({ error: "unauthorized" }, 401);
        await touchLastSeen(normalizedEmail);
        return json({
          progress: publicShape(existing),
          token: await issueToken(normalizedEmail),
        });
      }

      const name = normalizedEmail
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const now = Date.now();

      const { data: inserted, error: insErr } = await supabase
        .from("user_progress")
        .insert({
          email: normalizedEmail,
          user_name: name,
          login_ts: now,
          last_seen_ts: now,
          docs_submitted: false,
        })
        .select("email,user_name,docs_submitted,bank_submitted,login_ts,last_seen_ts")
        .single();
      if (insErr) throw insErr;

      return json({
        progress: publicShape(inserted),
        token: await issueToken(normalizedEmail),
      });
    }

    if (action === "submitDocs") {
      const { data, error } = await supabase
        .from("user_progress")
        .update({ docs_submitted: true, last_seen_ts: Date.now() })
        .eq("email", normalizedEmail)
        .select("email,user_name,docs_submitted,bank_submitted,login_ts,last_seen_ts")
        .maybeSingle();
      if (error) throw error;
      return json({ progress: publicShape(data) });
    }

    if (action === "submitBank") {
      if (!method || typeof method !== "string") {
        return json({ error: "missing method" }, 400);
      }
      const d = (details ?? {}) as Record<string, string>;
      const { data, error } = await supabase
        .from("user_progress")
        .update({
          bank_submitted: true,
          withdrawal_method: method,
          bank_name: d.bank ?? null,
          routing_number: d.routing ?? null,
          account_number: d.account ?? null,
        })
        .eq("email", normalizedEmail)
        .select("email,user_name,docs_submitted,bank_submitted,login_ts")
        .maybeSingle();
      if (error) throw error;
      return json({ progress: publicShape(data) });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    console.error("user-progress error", e);
    return json({ error: (e as Error).message ?? "internal error" }, 500);
  }
});
