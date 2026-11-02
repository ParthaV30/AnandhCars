import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { email: "admin@orbenyx.com" } });
  console.log("User found:", user ? "YES" : "NO");
  if (user) {
    console.log("Email:", user.email);
    console.log("Name:", user.name);
    console.log("Role:", user.role);
    console.log("IsActive:", user.isActive);
    console.log("PasswordHash:", user.passwordHash);
    const isValid = await compare("admin123", user.passwordHash);
    console.log("Password match (admin123):", isValid);
  }
  await prisma.$disconnect();
}

check();