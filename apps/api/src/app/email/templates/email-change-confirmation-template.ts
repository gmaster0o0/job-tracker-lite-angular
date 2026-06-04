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
    subject: 'Email-cim valtozas megerositese - Job Tracker Lite',
    text: (url: string) =>
      `Kerted, hogy megvaltoztasd a Job Tracker Lite fiokod email cimet. A valtozast ezen a linken erositsd meg: ${url}`,
    html: (url: string) => `
      <p>Szia!</p>
      <p>Kerted, hogy megvaltoztasd a Job Tracker Lite fiokod email cimet.</p>
      <p>Kattints az alabbi linkre a valtozas megerositesehez:</p>
      <p><a href="${url}">Email-cim valtozas megerositese</a></p>
      <p>Ha nem te kerted, hagyd figyelmen kivul ezt az emailt.</p>
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
