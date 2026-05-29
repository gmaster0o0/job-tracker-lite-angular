export const EMAIL_CONFIG = 'EMAIL_CONFIG';

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};
