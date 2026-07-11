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
    subject: 'Fiókod törlése ütemezve lett - Job Tracker Lite',
    text: (scheduledDeletionAt: Date, recoverUrl: string) =>
      `Szia! Fiókod törlését ütemeztük, a végleges törlés dátuma: ${scheduledDeletionAt.toLocaleDateString(
        'hu-HU',
      )}. Ha meggondoltad magad, a következő linken bármikor visszaállíthatod a fiókodat: ${recoverUrl}`,
    html: (scheduledDeletionAt: Date, recoverUrl: string) => `
      <p>Szia!</p>
      <p>Ezúton értesítünk, hogy fiókod törlése ütemezésre került. A végleges törlés dátuma: <strong>${scheduledDeletionAt.toLocaleDateString(
        'hu-HU',
      )}</strong>.</p>
      <p>Ha meggondoltad magad, és mégsem szeretnéd törölni a profilodat, az alábbi gombra vagy linkre kattintva bármikor visszaállíthatod azt:</p>
      <p><a href="${recoverUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Fiók visszaállítása</a></p>
      <p>A megadott dátumig az adataid még biztonságban elérhetőek, ezt követően azonban véglegesen és visszaállíthatatlanul törlődnek.</p>
      <p>Üdvözlettel,<br>A Job Tracker Lite csapata</p>
    `,
  },
  en: {
    subject: 'Your account is scheduled for deletion - Job Tracker Lite',
    text: (scheduledDeletionAt: Date, recoverUrl: string) =>
      `Hi! Your account has been scheduled for deletion. The final deletion date is ${scheduledDeletionAt.toLocaleDateString(
        'en-US',
      )}. If you change your mind, you can restore your account anytime using the following link: ${recoverUrl}`,
    html: (scheduledDeletionAt: Date, recoverUrl: string) => `
      <p>Hi there!</p>
      <p>We are writing to inform you that your account has been scheduled for deletion. The final deletion date is: <strong>${scheduledDeletionAt.toLocaleDateString(
        'en-US',
      )}</strong>.</p>
      <p>If you've changed your mind and want to keep your profile, you can restore it at any time by clicking the link below:</p>
      <p><a href="${recoverUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Restore Account</a></p>
      <p>Your data will remain secure until the deletion date, after which it will be permanently and irreversibly removed.</p>
      <p>Best regards,<br>The Job Tracker Lite Team</p>
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
