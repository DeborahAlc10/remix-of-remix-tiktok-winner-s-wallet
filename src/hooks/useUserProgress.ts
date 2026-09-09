import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProgress {
  email: string;
  userName: string;
  docsSubmitted: boolean;
  bankSubmitted: boolean;
  loginTs: number;
}

const TOKEN_KEY = "wallet_session_token";

function clearLocalSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("wallet_user_email");
  localStorage.removeItem("wallet_user_name");
  localStorage.removeItem("wallet_login_ts");
  localStorage.removeItem("docs_submitted");
  localStorage.removeItem("bank_submitted");
}

async function callProgress(
  body: Record<string, unknown>,
): Promise<{ progress: UserProgress | null; token?: string; unauthorized?: boolean } | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  const { data, error } = await supabase.functions.invoke("user-progress", {
    body: { ...body, token: token ?? undefined },
  });
  if (error) {
    console.error("user-progress invoke error", error);
    const status = (error as { context?: { status?: number } }).context?.status;
    return { progress: null, unauthorized: status === 401 };
  }
  return {
    progress: (data?.progress ?? null) as UserProgress | null,
    token: data?.token as string | undefined,
  };
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
    const token = localStorage.getItem(TOKEN_KEY);
    if (!email || !token) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const res = await callProgress({ action: "get", email });
      if (res?.progress) {
        setProgress(res.progress);
        cacheLocal(res.progress);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string) => {
    const res = await callProgress({ action: "login", email });
    if (res?.token) localStorage.setItem(TOKEN_KEY, res.token);
    if (res?.progress) {
      setProgress(res.progress);
      cacheLocal(res.progress);
    }
    return res?.progress ?? null;
  }, []);

  const submitDocs = useCallback(async () => {
    if (!progress) return;
    const res = await callProgress({ action: "submitDocs", email: progress.email });
    if (res?.progress) {
      setProgress(res.progress);
      cacheLocal(res.progress);
    }
  }, [progress]);

  const submitBank = useCallback(
    async (method: string, details: Record<string, string>) => {
      if (!progress) return;
      const res = await callProgress({
        action: "submitBank",
        email: progress.email,
        method,
        details,
      });
      if (res?.progress) {
        setProgress(res.progress);
        cacheLocal(res.progress);
      }
    },
    [progress],
  );

  return { progress, loading, login, submitDocs, submitBank };
}
