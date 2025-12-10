import Stripe from 'stripe';
import getRawBody from 'raw-body';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = new Stripe(stripeSecret, {
  // Use default API version configured in Stripe account; can pin if needed
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  if (!stripeSecret || !webhookSecret) {
    return res.status(500).send('Stripe secrets not configured');
  }

  let event: Stripe.Event;
  let buf: Buffer;

  try {
    buf = await getRawBody(req);
  } catch (err: any) {
    return res.status(400).send(`Error reading request body: ${err?.message || 'unknown'}`);
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).send('Missing Stripe signature');
  }

  try {
    event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook signature verification failed: ${err?.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // TODO: mark subscription as active for the customer.
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // TODO: sync subscription status/plan in your database.
        break;
      case 'invoice.payment_succeeded':
        // TODO: confirm payment success if needed.
        break;
      case 'invoice.payment_failed':
        // TODO: handle failed payments (notify user / downgrade).
        break;
      default:
        // Ignore other events for now.
        break;
    }
  } catch (err: any) {
    console.error('Stripe webhook handling error:', err);
    return res.status(500).send('Webhook handler failed');
  }

  res.json({ received: true });
}
