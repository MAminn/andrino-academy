import type { Session as BetterAuthSession, User as BetterAuthUser } from "better-auth/types";

declare module "better-auth/types" {
  interface User extends BetterAuthUser {
    role: string;
  }

  interface Session extends BetterAuthSession {
    user: User;
  }
}

