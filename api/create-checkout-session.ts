import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const priceMonthly = process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;
const priceAnnual = process.env.STRIPE_PRICE_ID_PREMIUM_ANNUAL;

const stripe = new Stripe(stripeSecret || '', {});

const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

const getAdminAuth = () => {
  if (!firebaseServiceAccount) return null;
  if (!getApps().length) {
    initializeApp({
      credential: cert(firebaseServiceAccount),
    });
  }
  return getAuth();
};

const isActiveSubscription = (status: string) =>
  status === 'active' || status === 'trialing';

const hasActiveSubscription = async (email: string): Promise<boolean> => {
  const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 5 });
  for (const customer of customers.data) {
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 5,
    });
    if (subs.data.some((sub) => isActiveSubscription(sub.status))) {
      return true;
    }
  }
  return false;
};

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

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return res.status(500).send('Auth not configured');
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const decoded = token ? await adminAuth.verifyIdToken(token).catch(() => null) : null;

  if (!decoded?.email || !decoded.uid) {
    return res.status(401).send('Unauthorized');
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
    const alreadyPremium = await hasActiveSubscription(decoded.email);
    if (alreadyPremium) {
      return res.status(409).json({ status: 'ALREADY_ACTIVE' });
    }

    const idempotencyKey = `${decoded.uid}-${plan}-checkout`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: decoded.email,
      client_reference_id: decoded.uid,
      metadata: { uid: decoded.uid },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=canceled`,
      allow_promotion_codes: true,
    }, { idempotencyKey });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout session error:', err);
    return res.status(500).send(err?.message || 'Checkout session error');
  }
}
