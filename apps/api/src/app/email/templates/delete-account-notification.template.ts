import { SupportLang } from '@job-tracker-lite-angular/schemas';

interface DeleteAccountNotificationTemplate {
  subject: string;
  text: string;
  html: string;
}

const templates: Record<
  SupportLang,
  {
    subject: string;
    text: (scheduledDeletionAt: Date, recoverUrl: string) => string;
    html: (scheduledDeletionAt: Date, recoverUrl: string) => string;
  }
> = {
  hu: {
    subject: 'Fiókod törlésre került - Job Tracker Lite',
    text: (scheduledDeletionAt: Date, recoverUrl: string) =>
      `A fiókod törlésre került ütemezve, a törlés végleges időpontja: ${scheduledDeletionAt.toLocaleDateString(
        'hu-HU',
      )}. Ha meggondoltad magad, a fiókodat a következő linken állíthatod vissza: ${recoverUrl}.`,
    html: (scheduledDeletionAt: Date, recoverUrl: string) => `
      <p>Szia!</p>
      <p>A fiókod törlésre került ütemezve. A törlés végleges időpontja: <strong>${scheduledDeletionAt.toLocaleDateString(
        'hu-HU',
      )}</strong>.</p>
      <p>Ha meggondoltad magad, a fiókodat az alábbi linken állíthatod vissza:</p>
      <p><a href="${recoverUrl}">Fiók visszaállítása</a></p>
      <p>Az adataid biztonságban vannak, és a törlés után véglegesen eltávolításra kerülnek.</p>
    `,
  },
  en: {
    subject: 'Your account has been scheduled for deletion - Job Tracker Lite',
    text: (scheduledDeletionAt: Date, recoverUrl: string) =>
      `Your account has been scheduled for deletion. The final deletion date is: ${scheduledDeletionAt.toLocaleDateString(
        'en-US',
      )}. If you change your mind, you can recover your account using this link: ${recoverUrl}.`,
    html: (scheduledDeletionAt: Date, recoverUrl: string) => `
      <p>Hello!</p>
      <p>Your account has been scheduled for deletion. The final deletion date is: <strong>${scheduledDeletionAt.toLocaleDateString(
        'en-US',
      )}</strong>.</p>
      <p>If you change your mind, you can recover your account using the link below:</p>
      <p><a href="${recoverUrl}">Recover Account</a></p>
      <p>Your data is safe and will be permanently deleted after the deletion date.</p>
    `,
  },
};

export function getDeleteAccountNotificationTemplate(
  scheduledDeletionAt: Date,
  recoverUrl: string,
  lang: SupportLang = 'en',
): DeleteAccountNotificationTemplate {
  const template = templates[lang];
  return {
    subject: template.subject,
    text: template.text(scheduledDeletionAt, recoverUrl),
    html: template.html(scheduledDeletionAt, recoverUrl),
  };
}
