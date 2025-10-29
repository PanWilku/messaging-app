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
          where: { email: creds.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(creds.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          type: "user" as const,
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
        if (!creds?.name) {
          return null;
        }

        let guest = await prisma.guest.findFirst({
          where: { name: creds.name },
        });

        if (!guest) {
          guest = await prisma.guest.create({
            data: { name: creds.name },
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
};
