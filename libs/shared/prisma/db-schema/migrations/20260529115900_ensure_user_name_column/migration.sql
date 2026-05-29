-- Ensure the "user" table has the "name" column before backfilling and create system user
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='name') THEN
        ALTER TABLE "user" ADD COLUMN "name" text NOT NULL DEFAULT 'Unknown';
    END IF;
END $$;

-- Create a default user for backfilling existing records
INSERT INTO
    "user" (
        "id",
        "name",
        "email",
        "updatedAt"
    )
VALUES (
        'system-user',
        'System',
        'system@example.com',
        now()
    )
ON CONFLICT ("email") DO NOTHING;