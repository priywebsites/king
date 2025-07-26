import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('[VERCEL DEBUG] Database URL exists:', !!process.env.DATABASE_URL);
console.log('[VERCEL DEBUG] Database URL starts with:', process.env.DATABASE_URL?.substring(0, 20));

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Test database connection
pool.query('SELECT 1 as test').then(() => {
  console.log('[VERCEL DEBUG] Database connection successful');
}).catch(error => {
  console.error('[VERCEL DEBUG] Database connection failed:', error.message);
});
