import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Fail fast and loud — an insecure fallback secret in production is a
    // silent security hole, not a convenience.
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and set it before starting the server.`
    );
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/journal-management-system',
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // Comma-separated list of allowed frontend origins, e.g.
  // "https://your-journal.com,https://www.your-journal.com"
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
