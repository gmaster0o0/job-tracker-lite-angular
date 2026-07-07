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
    subject: 'Fioktorles megerositese - Job Tracker Lite',
    text: (url: string, graceDays: number) =>
      `Kerted a Job Tracker Lite fiokod torleset. A torlest ezen a linken erositsd meg: ${url}. A megerosites utan ${graceDays} napos turelmi ido indul, amely alatt visszavonhatod a torlest.`,
    html: (url: string, graceDays: number) => `
      <p>Szia!</p>
      <p>Kerted a Job Tracker Lite fiokod torleset.</p>
      <p>A torlest ezen a linken erositsd meg: <a href="${url}">${url}</a></p>
      <p>A megerosites utan ${graceDays} napos turelmi ido indul, amely alatt visszavonhatod a torlest.</p>
    `,
  },
  en: {
    subject: 'Confirm your account deletion - Job Tracker Lite',
    text: (url: string, graceDays: number) =>
      `You requested account deletion for your Job Tracker Lite account. Confirm deletion using this link: ${url}. After confirmation, a ${graceDays}-day grace period starts and you can still recover the account during that time.`,
    html: (url: string, graceDays: number) => `
      <p>Hello!</p>
      <p>You requested account deletion for your Job Tracker Lite account.</p>
      <p>Confirm deletion using this link: <a href="${url}">${url}</a></p>
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
