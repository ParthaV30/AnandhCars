import { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";
import type { Role } from "@/types";

function validateCredentials(credentials: Record<string, string> | undefined) {
  if (!credentials) return null;
  const email = credentials.email?.trim();
  const password = credentials.password;
  if (!email || !password) return null;
  if (!email.includes("@")) return null;
  return { email, password };
}

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('[NextAuth] Authorize called with credentials:', credentials);
        const validated = validateCredentials(credentials as Record<string, string>);
        console.log('[NextAuth] Validated:', validated);
        if (!validated) return null;

        const { email, password } = validated;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        console.log('[NextAuth] User found:', user ? 'YES' : 'NO');
        if (!user || !user.isActive) return null;

        const isValid = await compare(password, user.passwordHash);
        console.log('[NextAuth] Password valid:', isValid);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "OWNER" | "ADMIN" | "BILLING_STAFF" | "ACCOUNTANT" | "INVENTORY_MANAGER" | "SERVICE_ADVISOR" | "BRANCH_MANAGER",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.role = user.role as Role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};