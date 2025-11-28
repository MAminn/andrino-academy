"use client";
// @ts-ignore - better-auth/react types may not be detected properly
import { createAuthClient } from "better-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Client-only auth client (safe for browser)
export const authClient = createAuthClient({
  baseURL: BASE_URL,
});

// Export for convenience (following connect-homes-web pattern)
export const { useSession, signIn, signOut, signUp } = authClient;
