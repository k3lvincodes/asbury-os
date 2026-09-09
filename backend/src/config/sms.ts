import Telnyx from 'telnyx';

export function createSMSClient(apiKey: string) {
  return new Telnyx({ apiKey });
}

export async function sendSMS(
  client: Telnyx,
  from: string,
  to: string,
  text: string
) {
  return client.messages.send({
    from,
    to,
    text,
  });
}