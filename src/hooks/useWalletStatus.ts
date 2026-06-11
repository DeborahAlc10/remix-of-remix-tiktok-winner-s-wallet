import { useMemo } from "react";

export type DocStatus = "under_review" | "approved";
export type CashoutStatus = "processing" | "completed" | "failed";

interface WalletStatus {
  docStatus: DocStatus;
  docLabel: string;
  docColor: "warning" | "success";
  cashoutStatus: CashoutStatus;
  cashoutLabel: string;
  cashoutColor: "warning" | "destructive";
  daysSinceLogin: number;
}

export function useWalletStatus(): WalletStatus {
  return useMemo(() => {
    const ts = localStorage.getItem("wallet_login_ts");
    const daysSinceLogin = ts
      ? Math.floor((Date.now() - Number(ts)) / (1000 * 60 * 60 * 24))
      : 0;

    // Check for manual day override via query param (?days=7)
    const params = new URLSearchParams(window.location.search);
    const overrideDays = params.get("days");
    const days = overrideDays !== null ? Number(overrideDays) : daysSinceLogin;

    const docApproved = days >= 3;
    const cashoutFailed = days >= 7;

    return {
      daysSinceLogin: days,
      docStatus: docApproved ? "approved" : "under_review",
      docLabel: docApproved ? "Documents Approved" : "Documents Under Review",
      docColor: docApproved ? "success" : "warning",
      cashoutStatus: cashoutFailed ? "failed" : "processing",
      cashoutLabel: cashoutFailed
        ? "Failed - Bank verification required"
        : "Processing (7-14 business days)",
      cashoutColor: cashoutFailed ? "destructive" : "warning",
    };
  }, []);
}
