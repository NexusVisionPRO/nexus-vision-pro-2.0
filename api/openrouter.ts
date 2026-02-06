// Serverless proxy for OpenRouter (Vercel Function)
// Recebe os mesmos params do frontend e chama OpenRouter com a chave do servidor.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';
  if (!key) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });

  const params = req.body || {};

  // Build system prompt server-side reusing same minimal structure
  const systemPrompt = `Atue como um Engenheiro de Prompt Sênior, Diretor de Arte e Copywriter.`;

  const imageNotes: string[] = [];
  if (params.baseImage) imageNotes.push('IMAGE_1 provided');
  if (params.styleImage) imageNotes.push('IMAGE_2 provided');
  if (params.productImage) imageNotes.push('IMAGE_3 provided');

  const userMessage = `${systemPrompt}\n${imageNotes.join('\n')}\nReturn a pure JSON array of objects with keys: headline (or null), explanation, prompt, negative_prompt, instagram_caption, video_prompt (or null).`;

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.2,
    max_tokens: 1500,
  };

  try {
    const r = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('OpenRouter server error:', txt);
      return res.status(502).json({ error: 'OpenRouter error', detail: txt });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;
    if (!content) return res.status(502).json({ error: 'No content from OpenRouter' });

    const jsonStart = content.indexOf('[');
    const jsonText = jsonStart >= 0 ? content.slice(jsonStart) : content;
    const parsed = JSON.parse(jsonText);

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('openrouter function error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message || String(err) });
  }
}
