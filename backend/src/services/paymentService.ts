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
) {
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful payment
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
    case 'charge.refunded':
      // Handle refund
      break;
    case 'checkout.session.expired':
      // Handle expired session
      break;
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
