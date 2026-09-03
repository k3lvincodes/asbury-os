import { Resend } from 'resend';
import twilio from 'twilio';

interface NotificationData {
  reservationId: string;
  type: 'email' | 'sms';
  template: string;
  recipient: string;
  subject?: string;
  data?: Record<string, any>;
}

export async function sendBookingConfirmation(
  resend: Resend,
  twilioClient: twilio.Twilio,
  fromEmail: string,
  fromPhone: string,
  reservationId: string,
  customerEmail: string,
  customerPhone: string,
  bookingData: any
) {
  // Send email
  await resend.emails.send({
    from: fromEmail,
    to: customerEmail,
    subject: `Booking Confirmed - ${bookingData.bookingNumber}`,
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Your booking <strong>${bookingData.bookingNumber}</strong> has been confirmed.</p>
      <p>Package: ${bookingData.packageName}</p>
      <p>Dates: ${bookingData.startDate} - ${bookingData.endDate}</p>
      <p>Total: $${(bookingData.amountDue / 100).toFixed(2)}</p>
    `,
  });

  // Send SMS
  await twilioClient.messages.create({
    from: fromPhone,
    to: customerPhone,
    body: `Booking Confirmed! Your booking #${bookingData.bookingNumber} is confirmed. Visit ${process.env.CLIENT_URL}/reservation/${bookingData.agreementToken} for details.`,
  });

  // Log notification
  await logNotification({
    reservationId,
    type: 'email',
    template: 'booking_confirmation',
    recipient: customerEmail,
    subject: `Booking Confirmed - ${bookingData.bookingNumber}`,
  });

  await logNotification({
    reservationId,
    type: 'sms',
    template: 'booking_confirmation',
    recipient: customerPhone,
  });
}

export async function sendPaymentFailed(
  resend: Resend,
  fromEmail: string,
  reservationId: string,
  customerEmail: string,
  bookingNumber: string
) {
  await resend.emails.send({
    from: fromEmail,
    to: customerEmail,
    subject: `Payment Failed - ${bookingNumber}`,
    html: `
      <h1>Payment Failed</h1>
      <p>Your payment for booking <strong>${bookingNumber}</strong> has failed.</p>
      <p>Please try again or contact us for assistance.</p>
    `,
  });

  await logNotification({
    reservationId,
    type: 'email',
    template: 'payment_failed',
    recipient: customerEmail,
    subject: `Payment Failed - ${bookingNumber}`,
  });
}

export async function sendAdditionalChargeNotice(
  resend: Resend,
  fromEmail: string,
  reservationId: string,
  customerEmail: string,
  chargeData: any
) {
  await resend.emails.send({
    from: fromEmail,
    to: customerEmail,
    subject: `Additional Charge - ${chargeData.bookingNumber}`,
    html: `
      <h1>Additional Charge</h1>
      <p>An additional charge has been added to your booking.</p>
      <p>Type: ${chargeData.chargeType}</p>
      <p>Amount: $${(chargeData.totalCents / 100).toFixed(2)}</p>
    `,
  });

  await logNotification({
    reservationId,
    type: 'email',
    template: 'additional_charge',
    recipient: customerEmail,
    subject: `Additional Charge - ${chargeData.bookingNumber}`,
  });
}

async function logNotification(data: NotificationData) {
  // In production, store in Supabase
  console.log('Notification logged:', data);
}
