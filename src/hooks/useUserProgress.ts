import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProgress {
  email: string;
  userName: string;
  docsSubmitted: boolean;
  bankSubmitted: boolean;
  loginTs: number;
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Load progress from localStorage email on mount
  useEffect(() => {
    const email = localStorage.getItem("wallet_user_email");
    if (!email) {
      setLoading(false);
      return;
    }
    loadProgress(email);
  }, []);

  const loadProgress = async (email: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("user_progress")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (data) {
      const p: UserProgress = {
        email: data.email,
        userName: data.user_name,
        docsSubmitted: data.docs_submitted,
        bankSubmitted: data.bank_submitted,
        loginTs: Number(data.login_ts),
      };
      setProgress(p);
      localStorage.setItem("wallet_user_email", data.email);
      localStorage.setItem("wallet_user_name", data.user_name);
      localStorage.setItem("wallet_login_ts", String(data.login_ts));
      if (data.docs_submitted) localStorage.setItem("docs_submitted", "true");
      if (data.bank_submitted) localStorage.setItem("bank_submitted", "true");
    }
    setLoading(false);
  };

  const login = useCallback(async (email: string) => {
    const name = email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const now = Date.now();

    // Check if user already exists
    const { data: existing } = await supabase
      .from("user_progress")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      const p: UserProgress = {
        email: existing.email,
        userName: existing.user_name,
        docsSubmitted: existing.docs_submitted,
        bankSubmitted: existing.bank_submitted,
        loginTs: Number(existing.login_ts),
      };
      setProgress(p);
      localStorage.setItem("wallet_user_email", email);
      localStorage.setItem("wallet_user_name", existing.user_name);
      localStorage.setItem("wallet_login_ts", String(existing.login_ts));
      if (existing.docs_submitted) localStorage.setItem("docs_submitted", "true");
      if (existing.bank_submitted) localStorage.setItem("bank_submitted", "true");
      return p;
    }

    // Create new user
    await supabase.from("user_progress").insert({
      email,
      user_name: name,
      login_ts: now,
      docs_submitted: false,
    });

    const p: UserProgress = { email, userName: name, docsSubmitted: false, bankSubmitted: false, loginTs: now };
    setProgress(p);
    localStorage.setItem("wallet_user_email", email);
    localStorage.setItem("wallet_user_name", name);
    localStorage.setItem("wallet_login_ts", String(now));
    return p;
  }, []);

  const submitDocs = useCallback(async () => {
    if (!progress) return;
    await supabase
      .from("user_progress")
      .update({ docs_submitted: true })
      .eq("email", progress.email);

    setProgress((prev) => prev ? { ...prev, docsSubmitted: true } : prev);
    localStorage.setItem("docs_submitted", "true");
  }, [progress]);

  const submitBank = useCallback(async (method: string, details: Record<string, string>) => {
    if (!progress) return;
    await supabase
      .from("user_progress")
      .update({
        bank_submitted: true,
        withdrawal_method: method,
        bank_name: details.bank || null,
        routing_number: details.routing || null,
        account_number: details.account || null,
      })
      .eq("email", progress.email);

    setProgress((prev) => prev ? { ...prev, bankSubmitted: true } : prev);
    localStorage.setItem("bank_submitted", "true");
  }, [progress]);

  return { progress, loading, login, submitDocs, submitBank };
}
