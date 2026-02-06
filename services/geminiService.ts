import { Concept } from "../types";

// Lightweight OpenRouter client replacement for Gemini-based flows.
// NOTE: For production you SHOULD proxy requests through a serverless function
// (Vercel serverless / Netlify function) to keep the API key secret. This
// implementation reads the key injected at build time via `process.env.` and
// performs requests directly from the client which exposes the key.

export interface GeneratePromptsParams {
  niche: string;
  theme: string;
  additionalContext?: string;
  aspectRatio: string;
  includeHeadline: boolean;
  styleFidelity: number;
  baseImage: string | null;
  styleImage: string | null;
  productImage: string | null;
  includeVideo?: boolean;
  videoContext?: string;
}

const OPENROUTER_URL = "https://api.openrouter.ai/v1/chat/completions";
const OPENROUTER_KEY = (process.env.OPENROUTER_API_KEY as string) || (process.env.API_KEY as string) || "";
const DEFAULT_MODEL = (process.env.OPENROUTER_MODEL as string) || "gpt-4o-mini";

const buildSystemPrompt = (params: GeneratePromptsParams) => {
  const {
    niche,
    theme,
    additionalContext,
    aspectRatio,
    includeHeadline,
    styleFidelity,
    baseImage,
    styleImage,
    productImage,
    includeVideo,
    videoContext,
  } = params;

  // Keep the original rich system prompt structure from the Gemini implementation
  return `Atue como um Engenheiro de Prompt Sênior, Diretor de Arte e Copywriter.\n
CONTEXT:\n- Nicho: "${niche}"\n- Tema: "${theme}"\n${additionalContext ? `- PEDIDO ESPECÍFICO DA CENA (IMPORTANTE): "${additionalContext}"\n` : ""}- Formato: "${aspectRatio}"\n- Incluir Texto na Imagem: ${includeHeadline ? "SIM" : "NÃO"}\n- Nível de Fidelidade à Referência: ${styleFidelity}%\n- Gerar Prompt de Vídeo: ${includeVideo ? "SIM" : "NÃO"}\n\n`;
};

export const generatePrompts = async (params: GeneratePromptsParams): Promise<Concept[]> => {
  // Client-side now calls our serverless proxy to keep keys server-only.
  try {
    const res = await fetch('/api/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Server /api/openrouter error:', txt);
      throw new Error('Server error contacting OpenRouter proxy');
    }

    const data = await res.json();
    return data as Concept[];
  } catch (err) {
    console.error('generatePrompts proxy error:', err);
    throw err;
  }
};