import { SupportLang } from '@job-tracker-lite-angular/schemas';

interface VerificationEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

const verificationEmailTemplates: Record<
  SupportLang,
  {
    subject: string;
    text: (url: string) => string;
    html: (url: string) => string;
  }
> = {
  hu: {
    subject: 'Email cím megerősítése - Job Tracker Lite',
    text: (url: string) =>
      `Kérted az email címed megerősítését a Job Tracker Lite alkalmazásban. Használd ezt a linket: ${url}`,
    html: (url: string) => `
        <p>Szia!</p>
        <p>Kérted az email címed megerősítését a Job Tracker Lite alkalmazásban.</p>
        <p>Kattints az alábbi linkre az email címed megerősítéséhez:</p>
        <p><a href="${url}">Email cím megerősítése</a></p>
        <p>Ha nem te kérted ezt a levelet, nyugodtan hagyd figyelmen kívül.</p>
      `,
  },
  en: {
    subject: 'Verify your email - Job Tracker Lite',
    text: (url: string) =>
      `You requested to verify your email for your Job Tracker Lite account. Use this link: ${url}`,
    html: (url: string) => `
        <p>Hello!</p>
        <p>You requested to verify your email for your Job Tracker Lite account.</p>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${url}">Verify Email</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
  },
};

export function getVerificationEmailTemplate(
  url: string,
  lang: SupportLang = 'en',
): VerificationEmailTemplate {
  const template =
    verificationEmailTemplates[lang] ?? verificationEmailTemplates.en;

  return {
    subject: template.subject,
    text: template.text(url),
    html: template.html(url),
  };
}
