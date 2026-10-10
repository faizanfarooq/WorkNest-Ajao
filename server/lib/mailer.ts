import { env } from '../config/env.ts';

interface Mail {
  to: string;
  subject: string;
  text: string;
}

/**
 * Sends via Resend when RESEND_API_KEY is set; otherwise prints to the console
 * so password-reset links still work during local development.
 */
export async function sendMail(mail: Mail) {
  const { RESEND_API_KEY, MAIL_FROM, NODE_ENV } = env();
  if (NODE_ENV === 'test') return;

  if (!RESEND_API_KEY) {
    console.log(`\n[mail] to=${mail.to}\n[mail] subject=${mail.subject}\n${mail.text}\n`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: MAIL_FROM, to: mail.to, subject: mail.subject, text: mail.text }),
  });
  if (!res.ok) console.error('[mail] Resend rejected the message', res.status, await res.text());
}
