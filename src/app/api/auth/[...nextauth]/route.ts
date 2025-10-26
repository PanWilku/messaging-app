// app/api/auth/[...nextauth]/route.ts
import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// import Google from "next-auth/providers/google" // example OAuth provider

const handler = NextAuth({
  session: {
    strategy: "jwt", // use JWT-backed sessions
  },
  // Optional: customize JWT behavior
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    // You only need encode/decode if you want to fully customize signing/encryption
    // async encode(params) { ... },
    // async decode(params) { ... },
  },
  // Add at least one provider (Credentials shown for example)
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
        // Check if credentials are provided
        if (!creds?.email || !creds?.password) {
          return null;
        }

        // Find user in database using Prisma
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
        // Check if name is provided
        if (!creds?.name) {
          return null;
        }

        // Find or create guest
        let guest = await prisma.guest.findFirst({
          where: { name: creds.name },
        });

        // If guest doesn't exist, create a new one
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
  // Enrich the token & session
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
});

export { handler as GET, handler as POST };
