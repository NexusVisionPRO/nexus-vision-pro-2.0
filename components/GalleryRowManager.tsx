import React, { useState, useRef } from 'react';
import { Trash2, Loader, Image as ImageIcon, Plus, ArrowUp, ArrowDown, Upload, X } from 'lucide-react';
import { ShowcaseItem } from '../types';

interface GalleryRowManagerProps {
  title: string;
  row: 'top' | 'bottom';
  items: ShowcaseItem[];
  onAddBulk: (images: string[], row: 'top' | 'bottom') => Promise<void>;
  onDelete: (id: string, imageId: string) => Promise<void>;
  colorClass: string;
  icon: any;
}

const GalleryRowManager: React.FC<GalleryRowManagerProps> = ({ 
  title, row, items, onAddBulk, onDelete, colorClass, icon: Icon 
}) => {
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 10 - items.length;
      
      // Calculate how many we can add
      const canAdd = Math.min(files.length, remainingSlots);
      
      if (canAdd <= 0) {
         alert(`Limite de 10 imagens atingido na ${title}.`);
         return;
      }

      if (files.length > remainingSlots) {
        alert(`Você só pode adicionar mais ${remainingSlots} imagens. As primeiras ${remainingSlots} serão selecionadas.`);
      }

      const filesToProcess = files.slice(0, canAdd);
      const promises = filesToProcess.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
             if (typeof reader.result === 'string') resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(base64Images => {
        setPendingImages(base64Images);
      });
    }
  };

  const handleConfirmUpload = async () => {
    if (pendingImages.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onAddBulk(pendingImages, row);
      setPendingImages([]); // Clear preview
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      alert("Erro ao adicionar imagens.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePending = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className={`text-xl font-bold flex items-center gap-2 ${colorClass}`}>
          <Icon size={24} /> {title} ({items.length}/10)
        </h2>
      </div>

      {/* Add Bulk Form */}
      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4">
          <Plus size={16} className={colorClass.replace('text-', 'text-')} />
          <span className="text-sm font-bold text-slate-300">Adicionar imagens (Lote)</span>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/30 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
          >
             <Upload size={32} className="text-slate-500 mb-2" />
             <p className="text-sm text-slate-400 font-bold">Clique para selecionar imagens</p>
             <p className="text-xs text-slate-500 mt-1">Até 10 imagens simultâneas</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            multiple
            className="hidden" 
          />

          {/* Pending Previews */}
          {pendingImages.length > 0 && (
             <div className="bg-black/20 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-bold text-slate-400 mb-3 flex justify-between">
                   <span>IMAGENS SELECIONADAS ({pendingImages.length})</span>
                   <span className="text-purple-400">Prontas para envio</span>
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                   {pendingImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-slate-600">
                         <img src={img} className="w-full h-full object-cover" />
                         <button 
                            onClick={() => handleRemovePending(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                         >
                           <X size={10} />
                         </button>
                      </div>
                   ))}
                </div>
                <button 
                  onClick={handleConfirmUpload}
                  disabled={isSubmitting}
                  className={`w-full mt-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                    ${isSubmitting ? 'bg-slate-800' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                >
                  {isSubmitting ? <Loader className="animate-spin" size={18} /> : `Confirmar e Enviar ${pendingImages.length} Imagens`}
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Grid List */}
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm italic text-center py-4 border border-dashed border-slate-800 rounded-xl">
          Nenhuma imagem adicionada nesta faixa ainda.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-colors">
              <div className="aspect-[3/4]">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <div className="text-right absolute top-2 right-2">
                  <button 
                    onClick={() => onDelete(item.id, item.imageId)}
                    className="bg-red-500/80 p-1.5 rounded text-white hover:bg-red-500 transition-colors shadow-lg"
                    title="Remover Imagem"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryRowManager;