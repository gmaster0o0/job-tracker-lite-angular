CREATE TABLE IF NOT EXISTS "verification" (
    "id" text NOT NULL PRIMARY KEY,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamp(3) NOT NULL,
    "createdAt" timestamp(3) NOT NULL DEFAULT now(),
    "updatedAt" timestamp(3) NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "verification_identifier_index" ON "verification" ("identifier");