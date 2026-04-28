import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import * as path from 'path';

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

export default defineConfig({
  schema: './db-schema/schema.prisma',

  migrations: {
    path: './db-schema/migrations',
  },

  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
