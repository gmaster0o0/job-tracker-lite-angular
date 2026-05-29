import { SupportLang } from '@job-tracker-lite-angular/schemas';

interface ResetPasswordEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

const resetPasswordEmailTemplates: Record<
  SupportLang,
  {
    subject: string;
    text: (url: string) => string;
    html: (url: string) => string;
  }
> = {
  hu: {
    subject: 'Jelszo visszaallitasa - Job Tracker Lite',
    text: (url: string) =>
      `Kerted a jelszavad visszaallitasat a Job Tracker Lite alkalmazasban. Hasznald ezt a linket: ${url}`,
    html: (url: string) => `
        <p>Szia!</p>
        <p>Kerted a jelszavad visszaallitasat a Job Tracker Lite alkalmazasban.</p>
        <p>Kattints az alabbi linkre az uj jelszo megadasahoz:</p>
        <p><a href="${url}">Jelszo visszaallitasa</a></p>
        <p>Ha nem te kerted ezt a levelet, nyugodtan hagyd figyelmen kivul.</p>
      `,
  },
  en: {
    subject: 'Reset your password - Job Tracker Lite',
    text: (url: string) =>
      `You requested to reset your password for your Job Tracker Lite account. Use this link: ${url}`,
    html: (url: string) => `
        <p>Hello!</p>
        <p>You requested to reset your password for your Job Tracker Lite account.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${url}">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
  },
};

export function getResetPasswordEmailTemplate(
  url: string,
  lang: SupportLang = 'en',
): ResetPasswordEmailTemplate {
  const template =
    resetPasswordEmailTemplates[lang] ?? resetPasswordEmailTemplates.en;

  return {
    subject: template.subject,
    text: template.text(url),
    html: template.html(url),
  };
}
