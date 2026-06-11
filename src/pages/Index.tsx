import { useState, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import DocumentUploadScreen from "@/components/DocumentUploadScreen";
import BankDetailsScreen from "@/components/BankDetailsScreen";
import DashboardScreen from "@/components/DashboardScreen";
import { useUserProgress } from "@/hooks/useUserProgress";

type Screen = "login" | "documents" | "bank" | "dashboard";

const Index = () => {
  const { progress, loading, login, submitDocs, submitBank } = useUserProgress();
  const [screen, setScreen] = useState<Screen>("login");
  const [userName, setUserName] = useState("");

  // Set initial screen based on loaded progress
  useEffect(() => {
    if (loading) return;
    if (progress) {
      setUserName(progress.userName);
      if (progress.bankSubmitted) {
        setScreen("dashboard");
      } else if (progress.docsSubmitted) {
        setScreen("bank");
      } else {
        setScreen("documents");
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
        setScreen("documents");
      }
    }
  };

  const handleDocsSubmit = async () => {
    await submitDocs();
    setScreen("bank");
  };

  const handleBankSubmit = async (method: string, details: Record<string, string>) => {
    await submitBank(method, details);
    setScreen("dashboard");
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
        {screen === "documents" && (
          <DocumentUploadScreen userName={userName} onSubmit={handleDocsSubmit} />
        )}
        {screen === "bank" && (
          <BankDetailsScreen userName={userName} onSubmit={handleBankSubmit} />
        )}
        {screen === "dashboard" && <DashboardScreen userName={userName} />}
      </div>
    </div>
  );
};

export default Index;
