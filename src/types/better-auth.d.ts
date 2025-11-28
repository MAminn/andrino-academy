// Extend Better-Auth types to include role property
declare module "better-auth/types" {
  interface User {
    role: string;
  }
}

// Also extend the session hook return type
declare module "better-auth/react" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      createdAt: Date;
      updatedAt: Date;
      emailVerified: boolean;
      image?: string | null;
    };
    session: {
      token: string;
      expiresAt: Date;
    };
  }
}
