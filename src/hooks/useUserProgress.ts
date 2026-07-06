import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProgress {
  email: string;
  userName: string;
  docsSubmitted: boolean;
  bankSubmitted: boolean;
  loginTs: number;
}

async function callProgress(body: Record<string, unknown>): Promise<UserProgress | null> {
  const { data, error } = await supabase.functions.invoke("user-progress", { body });
  if (error) {
    console.error("user-progress invoke error", error);
    return null;
  }
  return (data?.progress ?? null) as UserProgress | null;
}

function cacheLocal(p: UserProgress) {
  localStorage.setItem("wallet_user_email", p.email);
  localStorage.setItem("wallet_user_name", p.userName);
  localStorage.setItem("wallet_login_ts", String(p.loginTs));
  if (p.docsSubmitted) localStorage.setItem("docs_submitted", "true");
  if (p.bankSubmitted) localStorage.setItem("bank_submitted", "true");
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("wallet_user_email");
    if (!email) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const p = await callProgress({ action: "get", email });
      if (p) {
        setProgress(p);
        cacheLocal(p);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string) => {
    const p = await callProgress({ action: "login", email });
    if (p) {
      setProgress(p);
      cacheLocal(p);
    }
    return p;
  }, []);

  const submitDocs = useCallback(async () => {
    if (!progress) return;
    const p = await callProgress({ action: "submitDocs", email: progress.email });
    if (p) {
      setProgress(p);
      cacheLocal(p);
    }
  }, [progress]);

  const submitBank = useCallback(
    async (method: string, details: Record<string, string>) => {
      if (!progress) return;
      const p = await callProgress({
        action: "submitBank",
        email: progress.email,
        method,
        details,
      });
      if (p) {
        setProgress(p);
        cacheLocal(p);
      }
    },
    [progress],
  );

  return { progress, loading, login, submitDocs, submitBank };
}
