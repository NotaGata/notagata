import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda nu este permisă' });
  }

  try {
    // Vercel parsează automat JSON-ul din body
    const { amount, restaurantName } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Suma este invalidă." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: { 
            name: `Consumație ${restaurantName || 'NotaGata'}` 
          },
          unit_amount: Math.round(parseFloat(amount) * 100), // Stripe vrea bani/cenți
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/index.html`,
    });

    return res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Eroare Checkout:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
