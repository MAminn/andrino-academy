// Re-export database client and schema for easier imports
export { db } from "../../backend/database/db";
export * as schema from "../../backend/database/schema";
export type { DatabaseClient } from "../../backend/database/db";

// Common Drizzle imports
export { eq, and, or, desc, asc, count, sql, isNull, isNotNull, inArray, like, gte, lte, gt, lt } from "drizzle-orm";
