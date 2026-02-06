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
  } = params;

  return `VOCÊ É UM EXPERT EM CRIAÇÃO DE CONTEÚDO VISUAL E MARKETING.

TAREFA: Gerar 3 conceitos visuais de ALTA CONVERSÃO baseados nos parâmetros técnicos abaixo.

=== BRIEFING DO CLIENTE ===
Nicho: ${niche}
Tema: ${theme}
${additionalContext ? `Detalhes Específicos: ${additionalContext}` : ''}
${baseImage ? `✓ Imagem de Identidade (Rosto/Expert) será fornecida` : ''}
${styleImage ? `✓ Imagem de Estilo/Referência Visual será fornecida (Fidelidade: ${styleFidelity}%)` : ''}
${productImage ? `✓ Imagem de Produto será fornecida` : ''}

=== ESPECIFICAÇÕES TÉCNICAS ===
Formato: ${aspectRatio}
Incluir Texto/Headline: ${includeHeadline ? 'SIM' : 'NÃO'}
${includeVideo ? 'Gerar Prompt de Vídeo: SIM (compatível com Veo3)' : 'Sem vídeo'}

=== INSTRUÇÕES DE GERAÇÃO ===
1. HEADLINE/IDEIA
   - Crie um título provocador e que chame atenção
   - Máximo 100 caracteres
   - Focar em benefício/resultado

2. EXPLANATION
   - Breve descrição da ideia visual
   - Explicar POR QUE essa abordagem converterá
   - 2-3 frases

3. PROMPT (IMAGEM)
   - Escrever EXCLUSIVAMENTE em INGLÊS
   - Ser EXTREMAMENTE específico em detalhes visuais
   - Incluir: composição, cores, lighting, estilo, atmosfera
   ${baseImage ? '- INCORPORAR características físicas/estilo do expert (rosto/identidade)' : ''}
   ${styleImage ? '- RESPEITAR a palheta de cores e estilo da referência em ' + styleFidelity + '%' : ''}
   ${productImage ? '- DESTACAR o produto de forma proeminente' : ''}
   - Resultado deve ser fotorrealista e pronto para Midjourney/DALL-E

4. NEGATIVE_PROMPT
   - Especificar o que EVITAR no prompt
   - Detalhos técnicos indesejados
   - Artefatos comuns

5. INSTAGRAM_CAPTION
   - Escrever EM PORTUGUÊS (OBRIGATÓRIO)
   - Copy de vendas de alta conversão
   - Incluir: hook, story, proof, CTA
   - Use emojis estrategicamente
   - 150-200 caracteres
   - Focar em resultado/benefício

6. VIDEO_PROMPT (se solicitado)
   - Descrever movimento de câmera, ações, cenário
   - Em INGLÊS
   - Estrutura: [Plano] [Movimento] [Ação] [Duração]

=== CONSTRAINTS ===
✓ RETORNAR APENAS JSON VÁLIDO
✓ SEM MARKDOWN, SEM CÓDIGO, SEM EXPLICAÇÕES EXTRAS
✓ SEM ASPAS OU CARACTERES QUE QUEBREM JSON
✓ Garantir que TODOS os campos estejam preenchidos`;
};

export const generatePrompts = async (params: GeneratePromptsParams): Promise<Concept[]> => {
  try {
    const systemPrompt = buildSystemPrompt(params);
    
    const userMessage = `Baseado no briefing acima, gera 3 conceitos em JSON.

FORMATO OBRIGATÓRIO:
[
  {
    "headline": "${params.includeHeadline ? 'Texto aqui...' : 'null'}",
    "explanation": "Explicação da ideia...",
    "prompt": "Prompt em INGLÊS para IA gera imagem...",
    "negative_prompt": "Evitar isso na imagem...",
    "instagram_caption": "Legenda em PORTUGUÊS para vender...",
    "video_prompt": ${params.includeVideo ? '"Descrição do vídeo..."' : 'null'}
  }
]

IMPORTANTE:
- Retorna APENAS o JSON, sem explicações
- Todos os textos em campo correto (headline/explanation em PT, prompt em EN)
- Garantir JSON válido`;

    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: userMessage,
        system: systemPrompt,
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama connection failed: ${res.statusText}. Certifique-se que Ollama está rodando com: ollama run mistral`);
    }

    const data = await res.json();
    let content = data.response || '';

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Ollama raw response:', content);
      throw new Error('Ollama não retornou JSON válido. Tente novamente.');
    }

    let concepts = JSON.parse(jsonMatch[0]);
    
    // Validate structure and sanitize
    if (!Array.isArray(concepts)) {
      throw new Error('Response is not an array');
    }

    // Ensure all required fields exist and are strings
    concepts = concepts.map((concept: any, idx: number) => ({
      headline: String(concept?.headline || `Conceito ${idx + 1}`).substring(0, 200),
      explanation: String(concept?.explanation || '').substring(0, 500),
      prompt: String(concept?.prompt || '').substring(0, 2000),
      negative_prompt: String(concept?.negative_prompt || '').substring(0, 500),
      instagram_caption: String(concept?.instagram_caption || '').substring(0, 500),
      video_prompt: concept?.video_prompt ? String(concept.video_prompt).substring(0, 1000) : null,
    }));

    return concepts as Concept[];
  } catch (err) {
    console.error('generatePrompts error:', err);
    throw err;
  }
};