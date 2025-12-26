import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Allow the app to start without database for development/testing
// The database will be required when routes are accessed
let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn("⚠️  DATABASE_URL not set. Database features will be unavailable.");
  console.warn("   Set DATABASE_URL to enable full functionality.");
}

export { pool, db };
