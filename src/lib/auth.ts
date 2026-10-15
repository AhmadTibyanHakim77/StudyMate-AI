import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.trim().toLowerCase() },
          });
          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid email or password");
          }
          return {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
          };
        } catch (error: unknown) {
          if (error instanceof Error && (error.message === "Invalid email or password" || error.message === "Missing credentials")) {
            throw error;
          }
          throw new Error("Internal server error or database offline");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
