import * as path from 'path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

export default defineConfig({
  schema: './db-schema/schema.prisma',

  migrations: {
    path: './db-schema/migrations',
  },

  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
