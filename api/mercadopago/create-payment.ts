// Serverless endpoint to create a Mercado Pago preference (checkout)
// WARNING: Keep MP_ACCESS_TOKEN secret in Vercel Environment Variables.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  const MP_PUBLIC_KEY = process.env.MP_PUBLIC_KEY || '';
  if (!MP_ACCESS_TOKEN) return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });

  const { items = [], payer = {}, back_urls = {}, notification_url } = req.body || {};

  const body = {
    items,
    payer,
    back_urls: back_urls || {
      success: req.headers.origin || '/',
      failure: req.headers.origin || '/',
      pending: req.headers.origin || '/',
    },
    notification_url: notification_url || `${req.headers.origin || ''}/api/mercadopago/webhook`,
  };

  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('MP create preference error:', txt);
      return res.status(502).json({ error: 'Mercado Pago error', detail: txt });
    }

    const data = await r.json();
    // Return init_point (checkout url) and sandbox info
    return res.status(200).json({ ...data, public_key: MP_PUBLIC_KEY });
  } catch (err: any) {
    console.error('mercadopago/create-payment error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message || String(err) });
  }
}
