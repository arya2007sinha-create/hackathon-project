import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || 'https://qmfetvrsqzseacdoscsb.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZmV0dnJzcXpzZWFjZG9zY3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODUwNzMsImV4cCI6MjEwNjE2MTA3M30.2cUpsX9Zi13nohBlrIBCFligwFet2lNI7Zi-0UzSt0U',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'priora-enterprise-jwt-super-secret-key-2026-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'priora-refresh-jwt-secret-key-2026-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
