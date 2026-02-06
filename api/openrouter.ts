// Serverless proxy for OpenRouter (Vercel Function)
// Recebe os mesmos params do frontend e chama OpenRouter com a chave do servidor.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';
  
  console.log('API Key check:', key ? 'Present' : 'MISSING');
  console.log('Model:', model);
  
  if (!key) {
    console.error('OPENROUTER_API_KEY is not set in environment variables');
    return res.status(500).json({ 
      error: 'OPENROUTER_API_KEY not configured',
      env_keys: Object.keys(process.env).filter(k => k.includes('OPENROUTER') || k.includes('API'))
    });
  }

  const params = req.body || {};

  // Build system prompt server-side with full structure (not minimal)
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
    videoContext
  } = params;

  const systemPrompt = `Atue como um Engenheiro de Prompt Sênior, Diretor de Arte e Copywriter.

CONTEXTO:
- Nicho: "${niche || 'genérico'}"
- Tema: "${theme || 'padrão'}"
${additionalContext ? `- PEDIDO ESPECÍFICO DA CENA (IMPORTANTE): "${additionalContext}"` : ''}
- Formato: "${aspectRatio || '1:1'}"
- Incluir Texto na Imagem: ${includeHeadline ? "SIM" : "NÃO"}
- Nível de Fidelidade à Referência: ${styleFidelity || '50'}%
- Gerar Prompt de Vídeo: ${includeVideo ? "SIM" : "NÃO"}

TAREFA:
Crie 3 conceitos visuais de ALTA CONVERSÃO em JSON puro.

FORMATO DE RESPOSTA (JSON Array):
[
  {
    "headline": ${includeHeadline ? '"Título curto..."' : 'null'},
    "explanation": "Breve explicação da ideia...",
    "prompt": "Prompt técnico de IMAGEM em inglês...",
    "negative_prompt": "...",
    "instagram_caption": "Legenda completa...",
    "video_prompt": ${includeVideo ? '"Prompt de vídeo estruturado..."' : 'null'}
  }
]`;

  const imageNotes: string[] = [];
  if (baseImage) imageNotes.push('IMAGE_1 provided (expert)');
  if (styleImage) imageNotes.push('IMAGE_2 provided (style reference)');
  if (productImage) imageNotes.push('IMAGE_3 provided (product)');

  const userMessage = `${systemPrompt}\n${imageNotes.join('\n')}\n\nReturn ONLY valid JSON array, no markdown or extra text.`;

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.2,
    max_tokens: 2000,
  };

  try {
    console.log('Calling OpenRouter with model:', model);
    const r = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    console.log('OpenRouter response status:', r.status);

    if (!r.ok) {
      const txt = await r.text();
      console.error('OpenRouter server error:', txt);
      return res.status(502).json({ error: 'OpenRouter error', status: r.status, detail: txt });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;
    if (!content) {
      console.error('No content in OpenRouter response:', data);
      return res.status(502).json({ error: 'No content from OpenRouter', data });
    }

    // Extract JSON from content (sometimes wrapped in markdown)
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? content.slice(jsonStart, jsonEnd + 1) : content;
    
    const parsed = JSON.parse(jsonText);
    console.log('Successfully parsed response, returning', Array.isArray(parsed) ? parsed.length : 1, 'concepts');

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('openrouter function error:', err);
    return res.status(500).json({ 
      error: 'Server error', 
      detail: err.message || String(err),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

