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
      title: "Mensagem enviada!",
      description: "Retornaremos em até 24 horas.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Contatar Suporte</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Tem alguma dúvida ou precisa de ajuda? Preencha o formulário abaixo e nossa equipe entrará em contato o mais rápido possível.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Nome Completo</label>
            <Input
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Endereço de E-mail</label>
            <Input
              type="email"
              placeholder="Digite seu endereço de e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Assunto</label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um assunto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Dúvida Geral</SelectItem>
                <SelectItem value="transaction">Problema de Transação</SelectItem>
                <SelectItem value="account">Problema de Conta</SelectItem>
                <SelectItem value="withdrawal">Status de Saque</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Mensagem</label>
            <Textarea
              placeholder="Descreva sua dúvida ou problema em detalhes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full font-bold">
            Enviar Mensagem
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSupportDialog;
