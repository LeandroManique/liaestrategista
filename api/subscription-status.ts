import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret, {}) : null;

const isActiveSubscription = (status: string) =>
  status === 'active' || status === 'trialing';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  if (!stripe) {
    return res.status(500).json({ status: 'INACTIVE', reason: 'Stripe not configured' });
  }

  const email = (req.query.email as string | undefined)?.toLowerCase();
  if (!email) {
    return res.status(400).json({ status: 'INACTIVE', reason: 'Missing email' });
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 5 });
    if (!customers.data.length) {
      return res.status(200).json({ status: 'INACTIVE' });
    }

    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 5,
      });
      const hasActive = subs.data.some((sub) => isActiveSubscription(sub.status));
      if (hasActive) {
        return res.status(200).json({ status: 'ACTIVE' });
      }
    }

    return res.status(200).json({ status: 'INACTIVE' });
  } catch (err: any) {
    console.error('subscription-status error', err);
    return res.status(500).json({ status: 'INACTIVE', reason: err?.message || 'error' });
  }
}
