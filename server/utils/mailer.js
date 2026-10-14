const { BREVO_API_KEY, MAIL_FROM, MAIL_FROM_NAME = 'TechLearn' } = process.env;

export async function sendMail(to, subject, html) {
    if (!BREVO_API_KEY || !MAIL_FROM) { console.warn('mail skipped: Brevo not configured'); return; }
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ sender: { name: MAIL_FROM_NAME, email: MAIL_FROM }, to: [{ email: to }], subject, htmlContent: html }),
    });
    if (!r.ok) console.error('mail failed', await r.text().catch(() => r.status));
}
