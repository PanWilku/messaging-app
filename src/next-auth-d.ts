import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string;
      name?: string | null;
      type: "user" | "guest"; // Add user type
    };
  }

  interface User {
    id: string;
    email?: string;
    name?: string | null;
    type: "user" | "guest"; // Add user type
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string | null;
    type?: "user" | "guest"; // Add user type
  }
}
