import { SupportLang } from '@job-tracker-lite-angular/schemas';

interface DeleteAccountVerificationTemplate {
  subject: string;
  text: string;
  html: string;
}

const templates: Record<
  SupportLang,
  {
    subject: string;
    text: (url: string, graceDays: number) => string;
    html: (url: string, graceDays: number) => string;
  }
> = {
  hu: {
    subject: 'Fióktörlés megerősítése - Job Tracker Lite',
    text: (url: string, graceDays: number) =>
      `Kérted a Job Tracker Lite fiókod törlését. A törlést ezen a linken erősítsd meg: ${url}. A megerősítés után ${graceDays} napos türelmi idő indul, amely alatt visszavonhatod a törlést.`,
    html: (url: string, graceDays: number) => `
      <p>Szia!</p>
      <p>Kérted a Job Tracker Lite fiókod törlését.</p>
      <p>Kattints az alábbi linkre a törlés megerősítéséhez:</p>
      <p><a href="${url}">Fiók törlésének megerősítése</a></p>
      <p>A megerősítés után ${graceDays} napos türelmi idő indul, amely alatt visszavonhatod a törlést.</p>
    `,
  },
  en: {
    subject: 'Confirm your account deletion - Job Tracker Lite',
    text: (url: string, graceDays: number) =>
      `You requested account deletion for your Job Tracker Lite account. Confirm deletion using this link: ${url}. After confirmation, a ${graceDays}-day grace period starts and you can still recover the account during that time.`,
    html: (url: string, graceDays: number) => `
      <p>Hello!</p>
      <p>You requested account deletion for your Job Tracker Lite account.</p>
      <p><a href="${url}">Confirm Account Deletion</a></p>
      <p>After confirmation, a ${graceDays}-day grace period starts and you can still recover the account during that time.</p>
    `,
  },
};

export function getDeleteAccountVerificationTemplate(
  url: string,
  graceDays: number,
  lang: SupportLang = 'en',
): DeleteAccountVerificationTemplate {
  const template = templates[lang];
  return {
    subject: template.subject,
    text: template.text(url, graceDays),
    html: template.html(url, graceDays),
  };
}
