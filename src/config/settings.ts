import { z } from 'zod';

const configSchema = z.object({
  // Bot configuration
  botToken: z.string().min(1, 'BOT_TOKEN is required'),

  // Database configuration
  databaseUrl: z.string().min(1, 'DATABASE_URL is required'),

  // Google Sheets configuration
  googleSheetsId: z.string().min(1, 'GOOGLE_SHEETS_ID is required'),
  googleSheetsRange: z.string().default('Sheet1!A:J'),
  googleCredentialsPath: z.string().min(1, 'GOOGLE_CREDENTIALS_PATH is required'),

  // App configuration
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Config = z.infer<typeof configSchema>;

export const config = configSchema.parse({
  botToken: process.env.BOT_TOKEN,
  databaseUrl: process.env.DATABASE_URL,
  googleSheetsId: process.env.GOOGLE_SHEETS_ID,
  googleSheetsRange: process.env.GOOGLE_SHEETS_RANGE,
  googleCredentialsPath: process.env.GOOGLE_CREDENTIALS_PATH,
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL,
});
