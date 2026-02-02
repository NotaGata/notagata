import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const event = req.body;

    // Ascultăm evenimentul de plată reușită
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Aici facem "Resetarea": Ștergem produsele din baza de date
      // Deoarece în demo folosim un singur tabel, ștergem tot ce e activ
      const { error } = await supabase
        .from('bill_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Șterge tot

      console.log("Masa a fost resetată după plata Stripe!");
    }

    res.json({ received: true });
  } else {
    res.status(405).end();
  }
}
