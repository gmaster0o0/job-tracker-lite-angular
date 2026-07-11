import { SupportLang } from '@job-tracker-lite-angular/schemas';

interface EmailChangeConfirmationTemplate {
  subject: string;
  text: string;
  html: string;
}

const templates: Record<
  SupportLang,
  {
    subject: string;
    text: (url: string) => string;
    html: (url: string) => string;
  }
> = {
  hu: {
    subject: 'Email-cím változtatás megerősítése - Job Tracker Lite',
    text: (url: string) =>
      `Kérted, hogy megváltoztasd a Job Tracker Lite fiókod email címét. A változtatást ezen a linken erősítsd meg: ${url}`,
    html: (url: string) => `
      <p>Szia!</p>
      <p>Kérted, hogy megváltoztasd a Job Tracker Lite fiókod email címét.</p>
      <p>Kattints az alábbi linkre a változtatás megerősítéséhez:</p>
      <p><a href="${url}">Email-cím változtatás megerősítése</a></p>
      <p>Ha nem te kérted, hagyd figyelmen kívül ezt az emailt.</p>
    `,
  },
  en: {
    subject: 'Confirm your email change - Job Tracker Lite',
    text: (url: string) =>
      `You requested to change your Job Tracker Lite account email. Confirm the change using this link: ${url}`,
    html: (url: string) => `
      <p>Hello!</p>
      <p>You requested to change your Job Tracker Lite account email.</p>
      <p>Click the link below to confirm this change:</p>
      <p><a href="${url}">Confirm Email Change</a></p>
      <p>If this was not you, you can ignore this email.</p>
    `,
  },
};

export function getEmailChangeConfirmationTemplate(
  url: string,
  lang: SupportLang = 'en',
): EmailChangeConfirmationTemplate {
  const template = templates[lang] ?? templates.en;

  return {
    subject: template.subject,
    text: template.text(url),
    html: template.html(url),
  };
}
