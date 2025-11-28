import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Create a MySQL connection pool with proper configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = mysql.createPool({
  uri: connectionString,
  connectionLimit: 10,
  idleTimeout: 60000,
  queueLimit: 0,
});

console.log("[DB Connection] MySQL pool created successfully");

// Initialize Drizzle with the MySQL pool (single instance)
export const db = drizzle(pool, { schema, mode: "default" });

export type DatabaseClient = typeof db;