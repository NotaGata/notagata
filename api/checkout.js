import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Verificăm dacă metoda este POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodă nepermisă' });
  }

  try {
    // În modul ESM, Vercel ne dă body-ul gata parsat dacă trimitem JSON
    const { amount, restaurantName } = req.body;

    if (!amount) {
      throw new Error("Suma nu a fost primită corect.");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: { 
            name: `Consumație ${restaurantName || 'Restaurant'}` 
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
