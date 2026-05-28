-- Ensure Better Auth-required columns exist on user/session/account tables.

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "emailVerified" boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "image" text,
ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) NOT NULL DEFAULT now();

ALTER TABLE "session"
ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS "ipAddress" text,
ADD COLUMN IF NOT EXISTS "userAgent" text;

ALTER TABLE "account"
ADD COLUMN IF NOT EXISTS "accessToken" text,
ADD COLUMN IF NOT EXISTS "refreshToken" text,
ADD COLUMN IF NOT EXISTS "idToken" text,
ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" timestamp(3),
ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" timestamp(3),
ADD COLUMN IF NOT EXISTS "scope" text,
ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS "updatedAt" timestamp(3) NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user" ("email");

CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session" ("token");

CREATE INDEX IF NOT EXISTS "session_userId_index" ON "session" ("userId");

CREATE INDEX IF NOT EXISTS "account_userId_index" ON "account" ("userId");