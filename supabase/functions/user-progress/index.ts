// Edge function that owns all reads/writes for user_progress.
// The table has RLS enabled with NO policies, so only service_role
// (used here) can access it. Anon browser clients cannot.

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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

// Only the non-sensitive fields ever leave the backend.
function publicShape(row: any) {
  if (!row) return null;
  return {
    email: row.email,
    userName: row.user_name,
    docsSubmitted: !!row.docs_submitted,
    bankSubmitted: !!row.bank_submitted,
    loginTs: Number(row.login_ts),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, email, method, details } = await req.json();
    if (!action || typeof action !== "string") {
      return json({ error: "missing action" }, 400);
    }
    if (!email || typeof email !== "string") {
      return json({ error: "missing email" }, 400);
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (action === "get") {
      const { data, error } = await supabase
        .from("user_progress")
        .select("email,user_name,docs_submitted,bank_submitted,login_ts")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (error) throw error;
      return json({ progress: publicShape(data) });
    }

    if (action === "login") {
      const { data: existing, error: selErr } = await supabase
        .from("user_progress")
        .select("email,user_name,docs_submitted,bank_submitted,login_ts")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (selErr) throw selErr;

      if (existing) return json({ progress: publicShape(existing) });

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
          docs_submitted: false,
        })
        .select("email,user_name,docs_submitted,bank_submitted,login_ts")
        .single();
      if (insErr) throw insErr;

      return json({ progress: publicShape(inserted) });
    }

    if (action === "submitDocs") {
      const { data, error } = await supabase
        .from("user_progress")
        .update({ docs_submitted: true })
        .eq("email", normalizedEmail)
        .select("email,user_name,docs_submitted,bank_submitted,login_ts")
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
