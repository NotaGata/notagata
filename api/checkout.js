import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda nepermisa' });
  }

  try {
    const { amount, restaurantName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: { 
            name: `Nota de plata - ${restaurantName || 'NotaGata'}` 
          },
          unit_amount: Math.round(parseFloat(amount) * 100), 
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/index.html`,
    });

    return res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Stripe Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
