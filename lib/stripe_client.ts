// src/lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js';

export const getStripePromise = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  return loadStripe(key);
};