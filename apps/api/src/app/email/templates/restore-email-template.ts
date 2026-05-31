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
    text: (url: string) => string;
    html: (url: string) => string;
  }
> = {
  hu: {
    subject: 'Email visszaállítása - Job Tracker Lite',
    text: (url: string) =>
      `Az email címedet megváltoztatták a Job Tracker Lite fiókodban. Ha ezt nem te kérted, állítsd vissza ezen a linken: ${url}`,
    html: (url: string) => `
      <p>Szia!</p>
      <p>Az email címedet megváltoztatták a Job Tracker Lite fiókodban.</p>
      <p>Ha ezt nem te kérted, kattints ide az eredeti email visszaállításához:</p>
      <p><a href="${url}">Email visszaállítása</a></p>
      <p>A visszaállító link 7 napig érvényes.</p>
    `,
  },
  en: {
    subject: 'Restore your previous email - Job Tracker Lite',
    text: (url: string) =>
      `Your Job Tracker Lite account email was changed. If this was not you, restore your previous email with this link: ${url}`,
    html: (url: string) => `
      <p>Hello!</p>
      <p>Your Job Tracker Lite account email was changed.</p>
      <p>If this was not you, click the link below to restore your previous email:</p>
      <p><a href="${url}">Restore Previous Email</a></p>
      <p>This restore link expires in 7 days.</p>
    `,
  },
};

export function getRestoreEmailTemplate(
  url: string,
  lang: SupportLang = 'en',
): RestoreEmailTemplate {
  const template = restoreEmailTemplates[lang] ?? restoreEmailTemplates.en;

  return {
    subject: template.subject,
    text: template.text(url),
    html: template.html(url),
  };
}
