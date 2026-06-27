import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface ContactSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactSupportDialog = ({ open, onOpenChange }: ContactSupportDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    onOpenChange(false);
    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons sous 24 heures.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Contacter le support</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Une question ou besoin d'aide ? Remplissez le formulaire et notre équipe vous contactera dans les meilleurs délais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Nom complet</label>
            <Input
              placeholder="Saisissez votre nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Adresse e-mail</label>
            <Input
              type="email"
              placeholder="Saisissez votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Sujet</label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un sujet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Question générale</SelectItem>
                <SelectItem value="transaction">Problème de transaction</SelectItem>
                <SelectItem value="account">Problème de compte</SelectItem>
                <SelectItem value="withdrawal">Statut du retrait</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Message</label>
            <Textarea
              placeholder="Décrivez votre question ou problème en détail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full font-bold">
            Envoyer le message
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSupportDialog;
