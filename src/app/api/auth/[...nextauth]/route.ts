import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

const handler = NextAuth({
  ...authOptions,
  debug: true,
});

export { handler as GET, handler as POST };