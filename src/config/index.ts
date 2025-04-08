import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const isProduction = process.env.NODE_ENV === 'production';
export const {
  NODE_ENV,
  PORT,
  SECRET_KEY,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_TOKEN_EXPIRY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
} = process.env;
