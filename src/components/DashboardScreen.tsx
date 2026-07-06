import { useState, useEffect, useMemo } from "react";
import { ArrowUpRight, CheckCircle, AlertTriangle, FileText, XCircle, Wallet, Building, CreditCard, ChevronRight, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { format } from "date-fns";
import TikTokHeader from "./TikTokHeader";

interface DashboardScreenProps {
  userName: string;
}

const BALANCE_AMOUNT = 2893.27;
const formatUSD = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DashboardSkeleton = () => (
  <div className="min-h-screen flex flex-col bg-surface">
    <TikTokHeader showHelp />
    <div className="flex-1 px-6 py-4">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="h-40 w-full rounded-2xl mb-5" />
      <Skeleton className="h-24 w-full rounded-xl mb-4" />
      <Skeleton className="h-12 w-full rounded-full mb-4" />
      <div className="my-6">
        <Skeleton className="h-px w-full" />
      </div>
      <Skeleton className="h-5 w-44 mb-2" />
      <Skeleton className="h-20 w-full rounded-xl mb-2" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  </div>
);

type StepState = "complete" | "current" | "pending" | "error";

interface StepProps {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  state: StepState;
  isLast?: boolean;
}

const Step = ({ icon, label, subtitle, state, isLast }: StepProps) => {
  const stateStyles: Record<StepState, string> = {
    complete: "bg-success/15 text-success border-success/40 shadow-[0_0_8px_hsl(var(--success)/0.15)]",
    current: "bg-warning/15 text-warning border-warning/40 shadow-[0_0_8px_hsl(var(--warning)/0.15)]",
    error: "bg-destructive/15 text-destructive border-destructive/40 shadow-[0_0_8px_hsl(var(--destructive)/0.15)]",
    pending: "bg-muted text-muted-foreground border-border",
  };

  const lineStyles: Record<StepState, string> = {
    complete: "bg-success/50",
    current: "bg-warning/30",
    error: "bg-destructive/30",
    pending: "bg-border",
  };

  const subtitleColors: Record<StepState, string> = {
    complete: "text-success",
    current: "text-warning",
    error: "text-destructive",
    pending: "text-muted-foreground",
  };

  return (
    <div className="flex items-center flex-1 min-w-0">
      <div className="flex flex-col items-center gap-1">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${stateStyles[state]}`}>
          {state === "complete" ? <CheckCircle className="w-5 h-5" /> :
           state === "error" ? <XCircle className="w-5 h-5" /> : icon}
        </div>
        <span className={`text-[11px] font-semibold whitespace-nowrap ${
          state === "pending" ? "text-muted-foreground" : "text-foreground"
        }`}>
          {label}
        </span>
        <span className={`text-[9px] font-medium whitespace-nowrap ${subtitleColors[state]}`}>
          {subtitle}
        </span>
      </div>
      {!isLast && (
        <div className={`flex-1 h-0.5 mx-2 mt-[-28px] rounded-full ${lineStyles[state]}`} />
      )}
    </div>
  );
};

const DashboardScreen = ({ userName }: DashboardScreenProps) => {
  const status = useWalletStatus();
  const [loading, setLoading] = useState(true);

  const loginDate = useMemo(() => {
    const ts = localStorage.getItem("wallet_login_ts");
    const date = ts ? new Date(Number(ts)) : new Date();
    return format(date, "MMM dd, yyyy");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const canWithdraw = status.docStatus === "approved" && status.cashoutStatus === "completed";

  const docStep: StepState = status.docStatus === "approved" ? "complete" : "current";
  const bankStep: StepState = status.docStatus === "approved"
    ? (status.cashoutStatus === "completed" ? "complete" : status.cashoutStatus === "failed" ? "error" : "current")
    : "pending";
  const withdrawStep: StepState = canWithdraw ? "complete" : "pending";

  const docSubtitle = status.docStatus === "approved" ? "Approved" : "Reviewing";
  const bankSubtitle = status.docStatus !== "approved" ? "Pending"
    : status.cashoutStatus === "completed" ? "Verified"
    : status.cashoutStatus === "failed" ? "Failed" : "Processing";
  const withdrawSubtitle = canWithdraw ? "Ready" : "Pending";

  const getStatusMessage = () => {
    if (status.docStatus === "under_review") {
      return { text: "Documents under review — usually 1-3 business days", color: "text-warning" };
    }
    if (status.cashoutStatus === "failed") {
      return { text: "Bank verification required — contact support", color: "text-destructive" };
    }
    if (status.cashoutStatus === "processing") {
      return { text: "Withdrawal processing — please wait", color: "text-warning" };
    }
    if (status.cashoutStatus === "completed") {
      return { text: "Identity verified — you're all set!", color: "text-success" };
    }
    return null;
  };

  const statusMsg = getStatusMessage();

  const getWithdrawHint = () => {
    if (status.docStatus !== "approved") return "Complete verification to withdraw";
    if (status.cashoutStatus === "failed") return "Resolve bank verification to withdraw";
    if (status.cashoutStatus === "processing") return "Withdrawal processing — please wait";
    return null;
  };

  const withdrawHint = getWithdrawHint();

  const getCashoutBadge = () => {
    if (status.cashoutStatus === "failed") return { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" };
    if (status.cashoutStatus === "processing") return { label: "Processing", className: "bg-warning/10 text-warning border-warning/20" };
    return { label: "Completed", className: "bg-success/10 text-success border-success/20" };
  };

  const cashoutBadge = getCashoutBadge();

  return (
    <div className="min-h-screen flex flex-col bg-surface animate-fade-in">
      <TikTokHeader showHelp />

      <div className="flex-1 px-5 py-5 space-y-5">
        <p className="text-sm text-muted-foreground">
          Welcome back, <strong className="text-foreground">{userName}!</strong>
        </p>

        <div className="relative rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/85 text-primary-foreground p-6 shadow-xl overflow-hidden">
          <DollarSign className="absolute top-4 right-4 w-16 h-16 opacity-[0.06]" strokeWidth={1.5} />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none" />
          <p className="text-[11px] uppercase tracking-widest opacity-60 mb-3 relative z-10">Available balance</p>
          <p className="text-[44px] font-bold tracking-tighter leading-none relative z-10">{formatUSD(BALANCE_AMOUNT)}</p>
          <p className="text-[10px] opacity-30 mt-3 relative z-10">Last updated: Today</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-4">Account status</p>
          <div className="flex items-start">
            <Step icon={<FileText className="w-4 h-4" />} label="Documents" subtitle={docSubtitle} state={docStep} />
            <Step icon={<Building className="w-4 h-4" />} label="Bank" subtitle={bankSubtitle} state={bankStep} />
            <Step icon={<CreditCard className="w-4 h-4" />} label="Withdraw" subtitle={withdrawSubtitle} state={withdrawStep} isLast />
          </div>
          {statusMsg && (
            <p className={`text-xs mt-4 ${statusMsg.color}`}>{statusMsg.text}</p>
          )}
        </div>

        <div>
          <Button
            disabled={!canWithdraw}
            className={`w-full h-12 rounded-full text-sm font-bold transition-all ${
              canWithdraw
                ? "bg-gradient-to-r from-foreground to-foreground/80 hover:from-foreground/90 hover:to-foreground/70 shadow-lg"
                : ""
            }`}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Withdraw funds
          </Button>
          {withdrawHint && (
            <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3 text-warning" />
              {withdrawHint}
            </p>
          )}
        </div>

        <div className="h-px bg-border/40" />

        <div>
          <h2 className="text-lg font-semibold mb-1">Transaction history</h2>
          <p className="text-xs text-muted-foreground mb-4">Review your past transactions and their status.</p>

          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-border/40 hover:bg-accent/40 transition-colors cursor-pointer group">
              <div className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${
                status.cashoutStatus === "failed" ? "bg-destructive/10" : "bg-warning/10"
              }`}>
                {status.cashoutStatus === "failed" ? (
                  <XCircle className="w-5 h-5 text-destructive" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-warning" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold">Withdrawal</p>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-semibold border ${cashoutBadge.className}`}>
                    {cashoutBadge.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{loginDate}</p>
              </div>
              <span className="text-sm font-bold text-destructive whitespace-nowrap">-{formatUSD(BALANCE_AMOUNT)}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex items-center gap-3.5 px-4 py-4 hover:bg-accent/40 transition-colors cursor-pointer group">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-success/10 shrink-0">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold">Reward</p>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-semibold border bg-success/10 text-success border-success/20">
                    Completed
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{loginDate}</p>
              </div>
              <span className="text-sm font-bold text-success whitespace-nowrap">+{formatUSD(BALANCE_AMOUNT)}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center border-t border-border/40 space-y-2.5">
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/70">
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition-colors">Help Center</a>
        </div>
        <span className="text-xs text-muted-foreground/60 block">© 2025 TikTok</span>
      </footer>
    </div>
  );
};

export default DashboardScreen;
