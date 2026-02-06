import React, { useRef } from 'react';
import { Upload, X, Check, LucideIcon } from 'lucide-react';

interface UploadBoxProps {
  image: string | null;
  onUpload: (base64: string) => void;
  onRemove: () => void;
  label: string;
  icon?: LucideIcon;
  description: string;
}

const UploadBox: React.FC<UploadBoxProps> = ({ 
  image, 
  onUpload, 
  onRemove, 
  label, 
  icon: Icon, 
  description 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative group flex-1 min-w-[120px]">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-purple-400" />}
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">{label}</label>
      </div>
      
      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="h-24 w-full border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/50 transition-all gap-2 bg-slate-900/30"
        >
          <Upload className="text-slate-500 group-hover:text-purple-400 transition-colors" size={20} />
          <span className="text-[9px] text-slate-500 font-medium text-center px-2 leading-tight">
            {description}
          </span>
        </div>
      ) : (
        <div className="h-24 w-full relative rounded-xl overflow-hidden border border-purple-500/30 bg-black group-hover:border-purple-500/60 transition-all">
          <img src={image} alt="Upload" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-green-400 bg-black/70 px-2 py-1 rounded backdrop-blur-sm border border-green-500/30 flex items-center gap-1">
              <Check size={10} /> Ok
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation(); 
              onRemove();
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors z-10 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default UploadBox;