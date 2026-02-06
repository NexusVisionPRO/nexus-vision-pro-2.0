import React from 'react';
import { 
  ScanFace, Palette, Package, Rocket, X as XIcon, Instagram, Type, Video, Film
} from 'lucide-react';
import { Concept } from '../types';
import CopyButton from './CopyButton';

interface ConceptCardProps {
  concept: Concept;
  index: number;
  selectedRatio: string;
  hasBaseImage: boolean;
  hasStyleImage: boolean;
  hasProductImage: boolean;
  styleFidelity: number;
  includeHeadline: boolean;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ 
  concept, 
  index, 
  selectedRatio,
  hasBaseImage,
  hasStyleImage,
  hasProductImage,
  styleFidelity,
  includeHeadline
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all shadow-xl group">
      
      {/* Card Header */}
      <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase tracking-wider">
              Conceito {index + 1}
            </span>
            {hasBaseImage && (
              <span className="text-[10px] font-bold bg-green-500/20 text-green-300 px-2 py-0.5 rounded flex items-center gap-1">
                <ScanFace size={10} /> Identidade
              </span>
            )}
            {hasStyleImage && (
              <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Palette size={10} /> Estilo ({styleFidelity}%)
              </span>
            )}
            {hasProductImage && (
              <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Package size={10} /> Produto
              </span>
            )}
            {concept.video_prompt && (
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Video size={10} /> Veo3 Ready
              </span>
            )}
          </div>
          {concept.headline && (
            <h3 className="font-bold text-white text-lg mt-2">"{concept.headline}"</h3>
          )}
          <p className="text-xs text-slate-400 mt-1">{concept.explanation}</p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4">
        
        {/* Positive Prompt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Rocket size={12} className="text-purple-400" /> Prompt (Inglês)
            </label>
            <CopyButton text={concept.prompt} label="Copiar Prompt" />
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-slate-700/50 text-xs text-slate-300 font-mono leading-relaxed max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            {concept.prompt}
          </div>
          {includeHeadline && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
              <Type size={10} />
              <span>Tipografia Integrada + Formato {selectedRatio}</span>
            </div>
          )}
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <XIcon size={12} className="text-red-400" /> Prompt Negativo
            </label>
            <CopyButton text={`Prompt Negativo: ${concept.negative_prompt}`} label="Copiar Negativo" />
          </div>
          <div className="bg-red-900/10 p-3 rounded-lg border border-red-900/20 text-xs text-red-200/70 font-mono leading-relaxed">
            <span className="font-bold text-red-400/80">Prompt Negativo: </span>{concept.negative_prompt}
          </div>
        </div>

        {/* Caption */}
        <div className="space-y-2 border-t border-slate-700 pt-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Instagram size={12} className="text-pink-400" /> Legenda
            </label>
            <CopyButton text={concept.instagram_caption} label="Copiar Legenda" />
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line">
            {concept.instagram_caption}
          </div>
        </div>

        {/* Video Prompt (If Available) */}
        {concept.video_prompt && (
           <div className="space-y-2 border-t border-slate-700 pt-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Film size={12} className="text-indigo-400" /> Prompt de Vídeo (Veo3)
              </label>
              <CopyButton text={concept.video_prompt} label="Copiar Vídeo" />
            </div>
            <div className="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/20 text-xs text-indigo-100/90 font-mono leading-relaxed">
              {concept.video_prompt}
            </div>
            <p className="text-[9px] text-indigo-400/50 italic">
              Estrutura: [Câmera] + [Ação] + [Ambiente] + [Luz] + [Áudio]
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ConceptCard;