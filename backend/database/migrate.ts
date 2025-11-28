import { migrate } from "drizzle-orm/mysql2/migrator";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function runMigrations() {
  console.log("⏳ Running migrations...");

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });

  const db = drizzle(connection);

  await migrate(db, { migrationsFolder: "./backend/database/migrations" });

  console.log("✅ Migrations completed successfully");

  await connection.end();
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
