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
  // Sanitize all fields to prevent rendering errors
  const safeHeadline = String(concept?.headline || '').trim();
  const safeExplanation = String(concept?.explanation || '').trim();
  const safePrompt = String(concept?.prompt || '').trim();
  const safeNegativePrompt = String(concept?.negative_prompt || '').trim();
  const safeCaption = String(concept?.instagram_caption || '').trim();
  const safeVideoPrompt = concept?.video_prompt ? String(concept.video_prompt).trim() : null;

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4">
      <div className="text-white text-lg font-bold">
        {safeHeadline || 'Sem headline'}
      </div>
    </div>
  );
  );
};

export default ConceptCard;