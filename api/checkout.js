import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { amount, restaurantName, billId } = req.body; // Am adăugat billId

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: { name: `Consumație ${restaurantName}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      // Trimitem ID-ul notei către Stripe pentru a-l recupera la finalul plății
      metadata: { billId: "masa_12_id" }, 
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/index.html`,
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
