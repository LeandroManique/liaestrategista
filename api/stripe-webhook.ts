import Stripe from 'stripe';
import getRawBody from 'raw-body';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const firebaseDbUrl = process.env.FIREBASE_DATABASE_URL;
const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

const stripe = new Stripe(stripeSecret, {});

let db: ReturnType<typeof getDatabase> | null = null;
if (firebaseDbUrl && firebaseServiceAccount) {
  if (!getApps().length) {
    initializeApp({
      credential: cert(firebaseServiceAccount),
      databaseURL: firebaseDbUrl,
    });
  }
  db = getDatabase();
}

const setPremiumStatus = async (email: string, isPremium: boolean) => {
  if (!db || !email) return;
  const key = email.toLowerCase().replace(/\./g, ','); // simple key to avoid dots in RTDB paths
  const ref = db.ref(`emailIndex/${key}`);
  await ref.set({ premium: isPremium ? 1 : 0, updatedAt: Date.now() });
};

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
        {
          const session = event.data.object as Stripe.Checkout.Session;
          const email = session.customer_details?.email || session.customer_email;
          if (email) {
            await setPremiumStatus(email, true);
          }
        }
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        {
          const sub = event.data.object as Stripe.Subscription;
          const email = (sub.customer_email as string) || (sub as any)?.customer_details?.email;
          if (email) {
            const active = sub.status === 'active' || sub.status === 'trialing';
            await setPremiumStatus(email, active);
          }
        }
        break;
      case 'customer.subscription.deleted':
      case 'customer.subscription.canceled':
        {
          const sub = event.data.object as Stripe.Subscription;
          const email = (sub.customer_email as string) || (sub as any)?.customer_details?.email;
          if (email) {
            await setPremiumStatus(email, false);
          }
        }
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
