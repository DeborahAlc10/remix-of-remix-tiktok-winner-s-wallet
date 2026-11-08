import { useState } from "react";
import ContactSupportDialog from "./ContactSupportDialog";

interface TikTokHeaderProps {
  showHelp?: boolean;
}

const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.7a6.34 6.34 0 0 0 6.33 6.33 6.34 6.34 0 0 0 6.34-6.33V9.26a8.16 8.16 0 0 0 4.76 1.53v-3.4a4.85 4.85 0 0 1-1-.7z" fill="currentColor" />
  </svg>
);

const TikTokHeader = ({ showHelp = false }: TikTokHeaderProps) => {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <TikTokIcon />
          <span className="text-base tracking-tight">
            TikTok <span className="font-extrabold">Wallet</span>
          </span>
        </div>
        {showHelp && (
          <button
            onClick={() => setSupportOpen(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-current text-[10px] font-bold">?</span>
            Help
          </button>
        )}
      </header>
      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
};

export default TikTokHeader;
