import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_SESSION_KEY = "visitor_session_id";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(VISITOR_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_SESSION_KEY, id);
  }
  return id;
}

export function useVisitorTracking() {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    supabase.functions
      .invoke("user-progress", {
        body: { action: "trackVisit", sessionId },
      })
      .catch((e) => console.error("visitor tracking failed", e));
  }, []);
}
