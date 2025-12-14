import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret, {}) : null;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  if (!stripe) {
    return res.status(500).json({ status: 'INACTIVE', reason: 'Stripe not configured' });
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return res.status(500).json({ status: 'INACTIVE', reason: 'Auth not configured' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const decoded = token ? await adminAuth.verifyIdToken(token).catch(() => null) : null;

  if (!decoded?.email) {
    return res.status(401).json({ status: 'INACTIVE', reason: 'Unauthorized' });
  }

  const emailFromToken = decoded.email.toLowerCase();
  const emailParam = (req.query.email as string | undefined)?.toLowerCase();
  if (!emailParam || emailParam !== emailFromToken) {
    return res.status(401).json({ status: 'INACTIVE', reason: 'Email mismatch' });
  }

  try {
    const customers = await stripe.customers.list({ email: emailFromToken, limit: 5 });
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
