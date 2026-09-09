import { Resend } from 'resend';
import twilio from 'twilio';
import { SupabaseClient } from '@supabase/supabase-js';

interface NotificationData {
  reservationId: string;
  type: 'email' | 'sms';
  template: string;
  recipient: string;
  subject?: string;
  status?: string;
  providerId?: string;
  metadata?: Record<string, any>;
}

export async function sendReservationConfirmed(
  supabase: SupabaseClient,
  resend: Resend,
  twilioClient: twilio.Twilio | null,
  fromEmail: string,
  fromPhone: string | null,
  reservationId: string,
  customerEmail: string,
  customerPhone: string,
  adminPhone: string | null,
  bookingData: {
    bookingNumber: string;
    packageName: string;
    startDate: string;
    endDate: string;
    amountDue: number;
    deliveryAddress: string;
  },
  adminEmail?: string | null
) {
  const formattedTotal = `$${(bookingData.amountDue / 100).toFixed(2)}`;
  const formattedStart = new Date(bookingData.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedEnd = new Date(bookingData.endDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const packageName = bookingData.packageName || 'Custom';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a5632; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">ASBURY OUTDOOR SERVICES</h1>
                </td>
              </tr>
              <!-- Booking Code Banner -->
              <tr>
                <td style="padding: 30px 30px 10px; text-align: center;">
                  <p style="color: #555555; margin: 0 0 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Reservation is Confirmed</p>
                  <div style="background-color: #f0f7f2; border: 2px dashed #1a5632; border-radius: 8px; padding: 20px; margin: 15px 0;">
                    <p style="color: #1a5632; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 3px;">${bookingData.bookingNumber}</p>
                    <p style="color: #666666; margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Booking Code</p>
                  </div>
                </td>
              </tr>
              <!-- Details -->
              <tr>
                <td style="padding: 10px 30px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #888888; font-size: 14px; width: 140px;">Package</td>
                            <td style="color: #333333; font-size: 14px; font-weight: bold;">${packageName}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #888888; font-size: 14px; width: 140px;">Start Date</td>
                            <td style="color: #333333; font-size: 14px;">${formattedStart}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #888888; font-size: 14px; width: 140px;">End Date</td>
                            <td style="color: #333333; font-size: 14px;">${formattedEnd}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #888888; font-size: 14px; width: 140px;">Delivery Address</td>
                            <td style="color: #333333; font-size: 14px;">${bookingData.deliveryAddress}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #888888; font-size: 14px; width: 140px;">Total Paid</td>
                            <td style="color: #1a5632; font-size: 18px; font-weight: bold;">${formattedTotal}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #888888; margin: 0; font-size: 12px;">Thank you for choosing Asbury Outdoor Services.</p>
                  <p style="color: #888888; margin: 5px 0 0; font-size: 12px;">If you have questions, reply to this email or contact us.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Reservation Confirmed - ${bookingData.bookingNumber}`,
      html: emailHtml,
    });

    await logNotification(supabase, {
      reservationId,
      type: 'email',
      template: 'reservation_confirmed',
      recipient: customerEmail,
      subject: `Reservation Confirmed - ${bookingData.bookingNumber}`,
      status: 'sent',
    });
  } catch (emailError) {
    console.error('Failed to send reservation confirmation email:', emailError);
    await logNotification(supabase, {
      reservationId,
      type: 'email',
      template: 'reservation_confirmed',
      recipient: customerEmail,
      subject: `Reservation Confirmed - ${bookingData.bookingNumber}`,
      status: 'failed',
      metadata: { error: emailError instanceof Error ? emailError.message : 'Unknown error' },
    });
  }

  if (twilioClient && fromPhone && customerPhone) {
    try {
      await twilioClient.messages.create({
        from: fromPhone,
        to: customerPhone,
        body: `Asbury Outdoor Services: Your reservation ${bookingData.bookingNumber} is confirmed! Package: ${packageName}, Dates: ${formattedStart} - ${formattedEnd}. Total: ${formattedTotal}. Thank you!`,
      });

      await logNotification(supabase, {
        reservationId,
        type: 'sms',
        template: 'reservation_confirmed',
        recipient: customerPhone,
        status: 'sent',
      });
    } catch (smsError) {
      console.error('Failed to send reservation confirmation SMS:', smsError);
      await logNotification(supabase, {
        reservationId,
        type: 'sms',
        template: 'reservation_confirmed',
        recipient: customerPhone,
        status: 'failed',
        metadata: { error: smsError instanceof Error ? smsError.message : 'Unknown error' },
      });
    }
  }

  if (twilioClient && fromPhone && adminPhone) {
    try {
      await twilioClient.messages.create({
        from: fromPhone,
        to: adminPhone,
        body: `New Reservation Confirmed!\nBooking: ${bookingData.bookingNumber}\nPackage: ${packageName}\nCustomer: ${customerEmail}\nDates: ${formattedStart} - ${formattedEnd}\nTotal: ${formattedTotal}\nAddress: ${bookingData.deliveryAddress}`,
      });

      await logNotification(supabase, {
        reservationId,
        type: 'sms',
        template: 'reservation_confirmed_admin',
        recipient: adminPhone,
        status: 'sent',
      });
    } catch (smsError) {
      console.error('Failed to send admin notification SMS:', smsError);
      await logNotification(supabase, {
        reservationId,
        type: 'sms',
        template: 'reservation_confirmed_admin',
        recipient: adminPhone,
        status: 'failed',
        metadata: { error: smsError instanceof Error ? smsError.message : 'Unknown error' },
      });
    }
  }

  // Admin email notification
  if (adminEmail) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New Reservation - ${bookingData.bookingNumber}`,
        html: `
          <h2>New Reservation Confirmed</h2>
          <p><strong>Booking:</strong> ${bookingData.bookingNumber}</p>
          <p><strong>Package:</strong> ${packageName}</p>
          <p><strong>Customer:</strong> ${customerEmail}</p>
          <p><strong>Dates:</strong> ${formattedStart} - ${formattedEnd}</p>
          <p><strong>Total:</strong> ${formattedTotal}</p>
          <p><strong>Delivery:</strong> ${bookingData.deliveryAddress}</p>
        `,
      });

      await logNotification(supabase, {
        reservationId,
        type: 'email',
        template: 'reservation_confirmed_admin',
        recipient: adminEmail,
        subject: `New Reservation - ${bookingData.bookingNumber}`,
        status: 'sent',
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      await logNotification(supabase, {
        reservationId,
        type: 'email',
        template: 'reservation_confirmed_admin',
        recipient: adminEmail,
        subject: `New Reservation - ${bookingData.bookingNumber}`,
        status: 'failed',
        metadata: { error: emailError instanceof Error ? emailError.message : 'Unknown error' },
      });
    }
  }
}

export async function sendBookingConfirmation(
  supabase: SupabaseClient,
  resend: Resend,
  twilioClient: twilio.Twilio | null,
  fromEmail: string,
  fromPhone: string | null,
  reservationId: string,
  customerEmail: string,
  customerPhone: string,
  bookingData: any
) {
  const packageName = bookingData.packageName || 'Custom';
  try {
    await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Booking Confirmed - ${bookingData.bookingNumber}`,
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Your booking <strong>${bookingData.bookingNumber}</strong> has been confirmed.</p>
        <p>Package: ${packageName}</p>
        <p>Dates: ${bookingData.startDate} - ${bookingData.endDate}</p>
        <p>Total: $${(bookingData.amountDue / 100).toFixed(2)}</p>
      `,
    });

    await logNotification(supabase, {
      reservationId,
      type: 'email',
      template: 'booking_confirmation',
      recipient: customerEmail,
      subject: `Booking Confirmed - ${bookingData.bookingNumber}`,
      status: 'sent',
    });
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    await logNotification(supabase, {
      reservationId,
      type: 'email',
      template: 'booking_confirmation',
      recipient: customerEmail,
      subject: `Booking Confirmed - ${bookingData.bookingNumber}`,
      status: 'failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }

  if (twilioClient && fromPhone && customerPhone) {
    try {
      await twilioClient.messages.create({
        from: fromPhone,
        to: customerPhone,
        body: `Booking Confirmed! Your booking #${bookingData.bookingNumber} is confirmed. Visit for details.`,
      });

      await logNotification(supabase, {
        reservationId,
        type: 'sms',
        template: 'booking_confirmation',
        recipient: customerPhone,
        status: 'sent',
      });
    } catch (error) {
      console.error('Failed to send booking confirmation SMS:', error);
      await logNotification(supabase, {
        reservationId,
        type: 'sms',
        template: 'booking_confirmation',
        recipient: customerPhone,
        status: 'failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }
}

export async function sendPaymentFailed(
  supabase: SupabaseClient,
  resend: Resend,
  fromEmail: string,
  reservationId: string,
  customerEmail: string,
  bookingNumber: string
) {
  try {
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

    await logNotification(supabase, {
      reservationId,
      type: 'email',
      template: 'payment_failed',
      recipient: customerEmail,
      subject: `Payment Failed - ${bookingNumber}`,
      status: 'sent',
    });
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    await logNotification(supabase, {
      reservationId,
      type: 'email',
      template: 'payment_failed',
      recipient: customerEmail,
      subject: `Payment Failed - ${bookingNumber}`,
      status: 'failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function sendAdditionalChargeNotice(
  supabase: SupabaseClient,
  resend: Resend,
  fromEmail: string,
  reservationId: string,
  customerEmail: string,
  chargeData: any
) {
  try {
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

    await logNotification(supabase, {
      reservationId,
      type: 'email',
      template: 'additional_charge',
      recipient: customerEmail,
      subject: `Additional Charge - ${chargeData.bookingNumber}`,
      status: 'sent',
    });
  } catch (error) {
    console.error('Failed to send additional charge email:', error);
    await logNotification(supabase, {
      reservationId,
      type: 'email',
      template: 'additional_charge',
      recipient: customerEmail,
      subject: `Additional Charge - ${chargeData.bookingNumber}`,
      status: 'failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

async function logNotification(supabase: SupabaseClient, data: NotificationData) {
  try {
    const { error } = await supabase.from('notifications').insert({
      reservation_id: data.reservationId,
      type: data.type,
      template: data.template,
      recipient: data.recipient,
      subject: data.subject || null,
      status: data.status || 'queued',
      provider_id: data.providerId || null,
      metadata: data.metadata || null,
      sent_at: data.status === 'sent' ? new Date().toISOString() : null,
    });
    if (error) {
      console.error('Supabase error logging notification:', error.message, error.code, error.details);
    }
  } catch (error) {
    console.error('Failed to log notification to database:', error);
  }
}
