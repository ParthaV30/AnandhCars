import { getServerSession } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { authOptions } from "./auth-options";

export const auth = () => getServerSession(authOptions);

export { signIn, signOut };

export type { Role } from "@/types";