import { LucideIcon } from 'lucide-react';

export interface AspectRatio {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

export interface Concept {
  headline: string | null;
  explanation: string;
  prompt: string;
  negative_prompt: string;
  instagram_caption: string;
  video_prompt?: string; // Novo campo para prompt de vídeo
}

export interface GeneratedResponse {
  concepts: Concept[];
}

export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

// --- New Types for Auth & Payments ---

// Added yearly plan types
export type PlanType = 'free' | 'starter' | 'pro' | 'ultra' | 'starter_yearly' | 'pro_yearly' | 'ultra_yearly';

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number; // Infinity for Ultra
  plan: PlanType;
  avatar?: string;
  isAdmin?: boolean; // Novo campo para identificar admin
}

export interface GenerationHistory {
  id: string;
  date: string;
  niche: string;
  theme: string;
  baseImageId?: string;
  styleImageId?: string;
  productImageId?: string;
  concepts: Concept[];
}

export interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  imageId: string; // ID no IndexedDB
  imageUrl?: string; // URL base64 hidratada
  row?: 'top' | 'bottom'; // Identifica se é da faixa superior ou inferior
}