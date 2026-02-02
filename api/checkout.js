import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Verificăm metoda
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodă nepermisă' });
  }

  // Verificăm cheia secretă
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Lipsește STRIPE_SECRET_KEY în Vercel!");
    return res.status(500).json({ error: "Eroare configurare server." });
  }

  try {
    const body = req.body;
    const { amount, restaurantName } = body;

    // Calculăm suma în bani/cenți (Stripe vrea numere întregi)
    const amountInCents = Math.round(parseFloat(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: { name: `Consumație ${restaurantName || 'Restaurant'}` },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/index.html`,
    });

    return res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Eroare Stripe:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
