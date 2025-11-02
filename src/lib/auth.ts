import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        creds: { email?: string; password?: string } | undefined
      ) {
        if (!creds?.email || !creds?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: creds.email,
            type: "user", // Only find regular users
          },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(creds.password, user.passwordHash);
        if (!isValid) return null;

        // Convert null to undefined for NextAuth compatibility
        return {
          id: user.id.toString(),
          email: user.email ?? undefined, // Convert null to undefined
          name: user.name,
          type: user.type,
        };
      },
    }),
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {
        name: { label: "Name", type: "text" },
      },
      async authorize(creds: { name?: string } | undefined) {
        if (!creds?.name || !creds.name.trim()) {
          return null;
        }

        // Check if guest with this name already exists
        let guest = await prisma.user.findFirst({
          where: {
            name: creds.name.trim(),
            type: "guest",
          },
        });

        // If guest doesn't exist, create new guest
        if (!guest) {
          guest = await prisma.user.create({
            data: {
              name: creds.name.trim(),
              type: "guest",
              // email and passwordHash are optional, so we omit them
            },
          });
        }

        return {
          id: guest.id.toString(),
          name: guest.name,
          type: "guest" as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First login: attach DB info to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose token fields to the client session
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.type = token.type as "user" | "guest";
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
