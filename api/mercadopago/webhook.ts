// Simple webhook receiver for Mercado Pago notifications
// In production verify signatures or use official SDK verification.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = req.body;
    console.log('Mercado Pago webhook received:', JSON.stringify(body));

    // TODO: validate and process the notification, update user/subscription status

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('mercadopago webhook error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
