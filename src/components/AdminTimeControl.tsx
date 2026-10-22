import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, FastForward, Rewind, Clock, X, RotateCcw } from "lucide-react";

interface AdminTimeControlProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  onFullReset: () => void;
}

const AdminTimeControl = ({ currentDay, onDayChange, onFullReset }: AdminTimeControlProps) => {
  const [open, setOpen] = useState(false);

  const isAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).has("admin");
  }, []);

  if (!isAdmin) return null;

  const setDay = (day: number) => {
    const clamped = Math.max(0, Math.min(10, day));
    const now = Date.now();
    const targetTs = now - clamped * 24 * 60 * 60 * 1000;
    localStorage.setItem("wallet_login_ts", String(targetTs));
    if (clamped < 7) {
      localStorage.removeItem("reverification_bonus");
    }
    onDayChange(clamped);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full bg-foreground text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Admin time control"
      >
        <Clock className="w-5 h-5" />
      </button>
    );
  }

  const stageLabel =
    currentDay < 1 ? "Documents Received" :
    currentDay < 3 ? "Identity Review" :
    currentDay < 5 ? "Bank Verification" :
    currentDay >= 7 ? "Bank Failed" :
    "Funds Ready";

  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-card border border-border shadow-xl p-4 w-64 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">Admin Preview</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center py-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Current Day</p>
        <p className="text-2xl font-bold">Day {currentDay}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{stageLabel}</p>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => setDay(0)}
          className="w-8 h-8 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Reset to day 0"
        >
          <Rewind className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setDay(currentDay - 1)}
          disabled={currentDay <= 0}
          className="w-9 h-9 rounded-lg bg-secondary hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDay(currentDay + 1)}
          disabled={currentDay >= 10}
          className="w-9 h-9 rounded-lg bg-secondary hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDay(7)}
          className="w-8 h-8 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Skip to failure"
        >
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-1">
        {[0, 1, 3, 5, 7].map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`flex-1 h-7 rounded-md text-[10px] font-semibold transition-colors ${
              currentDay === d
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <button
        onClick={onFullReset}
        className="w-full h-9 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-destructive/20 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset everything (back to login)
      </button>
    </div>
  );
};

export default AdminTimeControl;
