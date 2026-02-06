import React, { useState, useEffect } from 'react';
import { Loader, ArrowLeft, Wand2, Check, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import UploadBox from './UploadBox';
import GalleryRowManager from './GalleryRowManager';
import { 
  addBulkShowcaseItems, getShowcaseItems, deleteShowcaseItem, 
  saveHeroExampleImage, getHeroExampleImage,
  saveHeroExampleDetails, getHeroExampleDetails
} from '../services/mockBackend';
import { ShowcaseItem } from '../types';

interface AdminGalleryProps {
  onBack: () => void;
}

const AdminGallery: React.FC<AdminGalleryProps> = ({ onBack }) => {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hero Example State
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroInput, setHeroInput] = useState("");
  const [heroPrompt, setHeroPrompt] = useState("");
  const [heroCaption, setHeroCaption] = useState("");
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [heroSaveSuccess, setHeroSaveSuccess] = useState(false);

  useEffect(() => {
    loadItems();
    loadHeroData();
  }, []);

  const loadItems = async () => {
    try {
      const data = await getShowcaseItems();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const loadHeroData = async () => {
    const img = await getHeroExampleImage();
    if (img) setHeroImage(img);
    
    const details = getHeroExampleDetails();
    setHeroInput(details.input);
    setHeroPrompt(details.prompt);
    setHeroCaption(details.caption);
  }

  const handleSaveHero = async () => {
    if (!heroImage) return;
    setIsSavingHero(true);
    try {
      await saveHeroExampleImage(heroImage);
      saveHeroExampleDetails(heroInput, heroPrompt, heroCaption);
      setHeroSaveSuccess(true);
      setTimeout(() => setHeroSaveSuccess(false), 3000);
    } catch (e) {
      alert("Erro ao salvar dados do Hero");
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleAddBulkItems = async (images: string[], row: 'top' | 'bottom') => {
    await addBulkShowcaseItems(images, row);
    await loadItems();
  };

  const handleDeleteItem = async (id: string, imageId: string) => {
    if (!confirm("Tem certeza que deseja deletar?")) return;
    await deleteShowcaseItem(id, imageId);
    await loadItems();
  };

  // Split Items
  const topRowItems = items.filter(item => item.row === 'top' || !item.row);
  const bottomRowItems = items.filter(item => item.row === 'bottom');

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Painel de Controle (Admin)</h1>
        </div>

        {/* Hero Example Config Section */}
        <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="text-purple-400" size={20} />
            <h2 className="text-lg font-bold">Simulação em Tempo Real (Hero)</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Configure a imagem, o input do usuário e o prompt gerado que aparecem na simulação da Landing Page.
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-start">
             <div className="w-full md:w-1/3 space-y-2">
                <UploadBox 
                  label="IMAGEM RESULTADO"
                  icon={ImageIcon}
                  image={heroImage}
                  onUpload={setHeroImage}
                  onRemove={() => setHeroImage(null)}
                  description="Upload Resultado (Ex: The Rock)"
                />
             </div>
             
             <div className="w-full md:w-2/3 space-y-3">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 ml-1">INPUT DO USUÁRIO</label>
                    <input 
                      value={heroInput}
                      onChange={e => setHeroInput(e.target.value)}
                      className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none"
                      placeholder="Ex: Quero uma imagem do The Rock..."
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 ml-1">PROMPT GERADO PELA IA (INGLÊS)</label>
                    <textarea 
                      value={heroPrompt}
                      onChange={e => setHeroPrompt(e.target.value)}
                      rows={4}
                      className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none resize-none font-mono"
                      placeholder="Ex: Hyper-realistic 3D render..."
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 ml-1">LEGENDA SUGERIDA (INSTAGRAM)</label>
                    <textarea 
                      value={heroCaption}
                      onChange={e => setHeroCaption(e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none resize-none"
                      placeholder="Ex: POV: When the prompt hits different..."
                    />
                </div>

                <button 
                  onClick={handleSaveHero}
                  disabled={!heroImage || isSavingHero}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-2
                    ${heroSaveSuccess 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'}`}
                >
                  {isSavingHero ? <Loader className="animate-spin" size={18} /> : 
                   heroSaveSuccess ? <><Check size={18} /> Salvo com Sucesso</> : 'Atualizar Simulação'}
                </button>
             </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-slate-800" />

        {loading ? (
          <div className="text-center py-20"><Loader className="animate-spin mx-auto text-purple-500" size={32} /></div>
        ) : (
          <>
            {/* Top Row Manager */}
            <GalleryRowManager 
              title="Faixa Superior (Top)"
              row="top"
              items={topRowItems}
              onAddBulk={handleAddBulkItems}
              onDelete={handleDeleteItem}
              colorClass="text-purple-400"
              icon={ArrowUp}
            />

            {/* Bottom Row Manager */}
            <div className="border-t border-slate-800 pt-10">
              <GalleryRowManager 
                title="Faixa Inferior (Bottom)"
                row="bottom"
                items={bottomRowItems}
                onAddBulk={handleAddBulkItems}
                onDelete={handleDeleteItem}
                colorClass="text-indigo-400"
                icon={ArrowDown}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminGallery;