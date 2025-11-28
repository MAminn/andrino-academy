import "dotenv/config";
import { db } from "./db";
import * as schema from "./schema";
import { inArray } from "drizzle-orm";

async function resetTestAccounts() {
  console.log("🗑️  Deleting old test accounts...");

  try {
    const testEmails = [
      "ceo@andrino.academy",
      "manager@andrino.academy",
      "coordinator@andrino.academy",
      "instructor@andrino.academy",
      "student@andrino.academy",
    ];

    // Delete from accounts table (Better-Auth)
    await db.delete(schema.accounts).where(
      inArray(
        schema.accounts.userId,
        db.select({ id: schema.users.id }).from(schema.users).where(inArray(schema.users.email, testEmails))
      )
    );
    console.log("✅ Deleted from accounts table");

    // Delete from sessions table
    await db.delete(schema.sessions).where(
      inArray(
        schema.sessions.userId,
        db.select({ id: schema.users.id }).from(schema.users).where(inArray(schema.users.email, testEmails))
      )
    );
    console.log("✅ Deleted from sessions table");

    // Delete from users table
    await db.delete(schema.users).where(inArray(schema.users.email, testEmails));
    console.log("✅ Deleted from users table");

    console.log("🎉 Old test accounts deleted successfully!");
  } catch (error) {
    console.error("❌ Error deleting test accounts:", error);
    throw error;
  }
}

resetTestAccounts()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
