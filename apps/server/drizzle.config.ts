/// <reference types="node" />

export default {
  schema: './src/db/schema.ts',
  out: '../database/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
};
