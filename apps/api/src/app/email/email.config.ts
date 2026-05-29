export const mailConfig = () => ({
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    secure: process.env.MAIL_SECURE === 'true', // true = 465, false = STARTTLS
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM ?? '"No Reply" <noreply@example.com>',
  },
});