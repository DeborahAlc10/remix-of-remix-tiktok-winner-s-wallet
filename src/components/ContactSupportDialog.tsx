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
      title: "¡Mensaje enviado!",
      description: "Te responderemos dentro de 24 horas.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Contactar a soporte</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            ¿Tienes alguna duda o necesitas ayuda? Llena el formulario y nuestro equipo te contactará lo antes posible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Nombre completo</label>
            <Input
              placeholder="Ingresa tu nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Correo electrónico</label>
            <Input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Asunto</label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un asunto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Pregunta general</SelectItem>
                <SelectItem value="transaction">Problema con una transacción</SelectItem>
                <SelectItem value="account">Problema con la cuenta</SelectItem>
                <SelectItem value="withdrawal">Estado del retiro</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Mensaje</label>
            <Textarea
              placeholder="Describe tu pregunta o problema con detalle..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full font-bold">
            Enviar mensaje
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSupportDialog;
