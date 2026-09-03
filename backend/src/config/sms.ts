import twilio from 'twilio';

export function createTwilioClient(accountSid: string, authToken: string) {
  return twilio(accountSid, authToken);
}

export async function sendSMS(
  client: twilio.Twilio,
  from: string,
  to: string,
  body: string
) {
  return client.messages.create({
    from,
    to,
    body,
  });
}
