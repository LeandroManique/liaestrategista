import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const priceMonthly = process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;
const priceAnnual = process.env.STRIPE_PRICE_ID_PREMIUM_ANNUAL;

const stripe = new Stripe(stripeSecret || '', {});

const getBaseUrl = () => {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:5173';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  if (!stripeSecret || !priceMonthly || !priceAnnual) {
    return res.status(500).send('Stripe env vars not configured');
  }

  const { plan } = typeof req.body === 'object' ? req.body : {};
  const priceId =
    plan === 'annual'
      ? priceAnnual
      : plan === 'monthly'
        ? priceMonthly
        : null;

  if (!priceId) {
    return res.status(400).send('Invalid plan');
  }

  const baseUrl = getBaseUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=canceled`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout session error:', err);
    return res.status(500).send(err?.message || 'Checkout session error');
  }
}
