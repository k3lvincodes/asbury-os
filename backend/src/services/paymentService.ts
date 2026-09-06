import Stripe from 'stripe';

interface CheckoutSessionData {
  reservationId: string;
  bookingNumber: string;
  amountCents: number;
  customerEmail: string;
}

export async function createCheckoutSession(
  stripe: Stripe,
  data: CheckoutSessionData,
  clientUrl: string
): Promise<{ sessionId: string; url: string; bookingNumber: string }> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Dump Trailer Rental - ${data.bookingNumber}`,
          },
          unit_amount: data.amountCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${clientUrl}/confirmation?booking=${data.bookingNumber}`,
    cancel_url: `${clientUrl}/review`,
    customer_email: data.customerEmail,
    client_reference_id: data.reservationId,
    metadata: {
      reservationId: data.reservationId,
      bookingNumber: data.bookingNumber,
    },
  });

  return {
    sessionId: session.id,
    url: session.url!,
    bookingNumber: data.bookingNumber,
  };
}

export async function handleWebhook(
  stripe: Stripe,
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<{ reservationId: string; status: string; paymentStatus: string } | { received: true }> {
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const reservationId = session.metadata?.reservationId;
      if (reservationId) {
        return {
          reservationId,
          status: 'confirmed',
          paymentStatus: 'paid',
        };
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const reservationId = paymentIntent.metadata?.reservationId;
      if (reservationId) {
        return {
          reservationId,
          status: 'payment_failed',
          paymentStatus: 'failed',
        };
      }
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      const reservationId = charge.metadata?.reservationId;
      if (reservationId) {
        return {
          reservationId,
          status: 'refunded',
          paymentStatus: 'refunded',
        };
      }
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const reservationId = session.metadata?.reservationId;
      if (reservationId) {
        return {
          reservationId,
          status: 'expired',
          paymentStatus: 'pending',
        };
      }
      break;
    }
  }

  return { received: true };
}

export async function processRefund(
  stripe: Stripe,
  paymentIntentId: string,
  amountCents?: number
) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents,
  });

  return refund;
}