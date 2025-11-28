import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../backend/database/db";
import * as schema from "../../backend/database/schema";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Better Auth configuration
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.users,
      session: schema.sessions,
      verification: schema.verificationTokens,
      account: schema.accounts,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  baseURL: BASE_URL,
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session data for 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        required: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
