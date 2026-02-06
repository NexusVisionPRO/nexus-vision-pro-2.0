import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, label = "Copiar" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar', err);
      // Fallback for older browsers or insecure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error("Fallback copy failed", e);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
        ${copied 
          ? 'bg-green-500/20 text-green-400 border-green-500/50' 
          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copiado!" : label}
    </button>
  );
};

export default CopyButton;