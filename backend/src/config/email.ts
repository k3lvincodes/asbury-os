import { Resend } from 'resend';

export function createEmailClient(apiKey: string) {
  return new Resend(apiKey);
}

export async function sendEmail(
  resend: Resend,
  from: string,
  to: string,
  subject: string,
  html: string
) {
  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}
