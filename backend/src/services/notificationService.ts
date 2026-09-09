import { Resend } from 'resend';
import twilio from 'twilio';
import { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_RESEND_API_KEY = process.env.RESEND_API_KEY || '';
export const DEFAULT_FROM_EMAIL = 'Asbury Outdoor Services <noreply@asburyoutdoorservices.com>';
export const DEFAULT_ADMIN_EMAIL = 'contact@asburyoutdoorservices.com';

export function formatFromEmail(email?: string | null): string {
  const target = email?.trim() || DEFAULT_FROM_EMAIL;
  return target.includes('<') ? target : `Asbury Outdoor Services <${target}>`;
}

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
  fromEmail?: string | null,
  fromPhone?: string | null,
  reservationId?: string,
  customerEmail?: string,
  customerPhone?: string,
  adminPhone?: string | null,
  bookingData?: {
    bookingNumber: string;
    packageName: string;
    startDate: string;
    endDate: string;
    amountDue: number;
    deliveryAddress: string;
  },
  adminEmail?: string | null
) {
  if (!reservationId || !bookingData || !customerEmail) {
    console.error('[notify] Missing required fields for sendReservationConfirmed');
    return;
  }

  const effectiveFromEmail = formatFromEmail(fromEmail);
  const effectiveAdminEmail = adminEmail?.trim() || DEFAULT_ADMIN_EMAIL;

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
  const safeFromEmail = effectiveFromEmail;

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

  const notification = async (type: 'email' | 'sms', template: string, recipient: string, subject?: string, body?: string) => {
    const { data: log, error } = await supabase.from('notifications').insert({
      reservation_id: reservationId,
      type,
      template,
      recipient,
      subject,
      status: 'queued',
    }).select().single();
    return { log, error };
  };

  const updateLog = async (id: string, status: 'sent' | 'failed', metadata?: any) => {
    await supabase.from('notifications').update({
      status,
      metadata,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    }).eq('id', id);
  };

  if (safeFromEmail && customerEmail) {
    const { log: emailLog } = await notification('email', 'reservation_confirmed', customerEmail, `Reservation Confirmed - ${bookingData.bookingNumber}`);
    try {
      await resend.emails.send({ from: safeFromEmail, to: customerEmail, subject: `Reservation Confirmed - ${bookingData.bookingNumber}`, html: emailHtml });
      if (emailLog) await updateLog(emailLog.id, 'sent');
    } catch (e: any) {
      console.error('[notify] Failed to send customer confirmation email:', JSON.stringify(e));
      if (emailLog) await updateLog(emailLog.id, 'failed', { error: e?.message || String(e) });
    }
  }

  if (effectiveAdminEmail && safeFromEmail) {
    const { log: adminEmailLog } = await notification('email', 'reservation_confirmed_admin', effectiveAdminEmail, `New Reservation - ${bookingData.bookingNumber}`);
    try {
      await resend.emails.send({
        from: safeFromEmail,
        to: effectiveAdminEmail,
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
      if (adminEmailLog) await updateLog(adminEmailLog.id, 'sent');
    } catch (e: any) {
      console.error('[notify] Failed to send admin notification email:', JSON.stringify(e));
      if (adminEmailLog) await updateLog(adminEmailLog.id, 'failed', { error: e?.message || String(e) });
    }
  }

  if (twilioClient && fromPhone && customerPhone) {
    const { log: smsLog } = await notification('sms', 'reservation_confirmed', customerPhone);
    try {
      await twilioClient.messages.create({ from: fromPhone, to: customerPhone, body: `Asbury Outdoor Services: Your reservation ${bookingData.bookingNumber} is confirmed! Package: ${packageName}, Dates: ${formattedStart} - ${formattedEnd}. Total: ${formattedTotal}. Thank you!` });
      if (smsLog) await updateLog(smsLog.id, 'sent');
    } catch (e: any) {
      if (smsLog) await updateLog(smsLog.id, 'failed', { error: e.message || e });
    }
  }

  if (twilioClient && fromPhone && adminPhone) {
    const { log: adminSmsLog } = await notification('sms', 'reservation_confirmed_admin', adminPhone);
    try {
      await twilioClient.messages.create({ from: fromPhone, to: adminPhone, body: `New Reservation Confirmed!\nBooking: ${bookingData.bookingNumber}\nPackage: ${packageName}\nCustomer: ${customerEmail}\nDates: ${formattedStart} - ${formattedEnd}\nTotal: ${formattedTotal}\nAddress: ${bookingData.deliveryAddress}` });
      if (adminSmsLog) await updateLog(adminSmsLog.id, 'sent');
    } catch (e: any) {
      if (adminSmsLog) await updateLog(adminSmsLog.id, 'failed', { error: e.message || e });
    }
  }

  // Always insert an in-app notification for the admin dashboard bell
  try {
    await supabase.from('notifications').insert({
      reservation_id: reservationId,
      type: 'in_app',
      template: 'reservation_confirmed_admin',
      recipient: effectiveAdminEmail,
      subject: `New Reservation - ${bookingData.bookingNumber}`,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        bookingNumber: bookingData.bookingNumber,
        packageName,
        customerEmail,
        total: formattedTotal,
      },
    });
    console.log(`[notify] In-app admin notification inserted for ${bookingData.bookingNumber}`);
  } catch (e: any) {
    console.error('[notify] Failed to insert in-app notification:', e?.message || String(e));
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
