import { SupportLang } from '@job-tracker-lite-angular/schemas';

interface RestoreEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

const restoreEmailTemplates: Record<
  SupportLang,
  {
    subject: string;
    text: (url: string, expiresInDays: number) => string;
    html: (url: string, expiresInDays: number) => string;
  }
> = {
  hu: {
    subject: 'Email visszaállítása - Job Tracker Lite',
    text: (url: string, expiresInDays: number) =>
      `Az email címedet megváltoztatták a Job Tracker Lite fiókodban. Ha ezt nem te kérted, állítsd vissza ezen a linken: ${url}. A link ${expiresInDays} napig érvényes.`,
    html: (url: string, expiresInDays: number) => `
      <p>Szia!</p>
      <p>Az email címedet megváltoztatták a Job Tracker Lite fiókodban.</p>
      <p>Ha ezt nem te kérted, kattints ide az eredeti email visszaállításához:</p>
      <p><a href="${url}">Email visszaállítása</a></p>
      <p>A visszaállító link ${expiresInDays} napig érvényes.</p>
    `,
  },
  en: {
    subject: 'Restore your previous email - Job Tracker Lite',
    text: (url: string, expiresInDays: number) =>
      `Your Job Tracker Lite account email was changed. If this was not you, restore your previous email with this link: ${url}. This link expires in ${expiresInDays} days.`,
    html: (url: string, expiresInDays: number) => `
      <p>Hello!</p>
      <p>Your Job Tracker Lite account email was changed.</p>
      <p>If this was not you, click the link below to restore your previous email:</p>
      <p><a href="${url}">Restore Previous Email</a></p>
      <p>This restore link expires in ${expiresInDays} days.</p>
    `,
  },
};

export function getRestoreEmailTemplate(
  url: string,
  expiresInDays: number,
  lang: SupportLang = 'en',
): RestoreEmailTemplate {
  const template = restoreEmailTemplates[lang] ?? restoreEmailTemplates.en;

  return {
    subject: template.subject,
    text: template.text(url, expiresInDays),
    html: template.html(url, expiresInDays),
  };
}
