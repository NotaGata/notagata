const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, restaurantName } = JSON.parse(req.body);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'ron',
            product_data: { name: `Consumație ${restaurantName}` },
            unit_amount: Math.round(amount * 100), // Stripe calculează în bani/cenți
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.origin}/success.html`,
        cancel_url: `${req.headers.origin}/index.html`,
      });

      res.status(200).json({ id: session.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
