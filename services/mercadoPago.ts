// Client-side helper to create a Mercado Pago payment via our serverless proxy
export interface MPItem {
  title: string;
  quantity: number;
  unit_price: number;
  id?: string;
}

export const createMercadoPagoPreference = async (items: MPItem[], payer?: any) => {
  try {
    const res = await fetch('/api/mercadopago/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, payer }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('/api/mercadopago/create-payment error:', txt);
      throw new Error('Erro ao criar preferência de pagamento');
    }

    const data = await res.json();
    return data; // contains init_point and other Mercado Pago response
  } catch (err) {
    console.error('createMercadoPagoPreference error:', err);
    throw err;
  }
};
