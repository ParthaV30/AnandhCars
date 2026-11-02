import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default admin user
  const hashedPassword = await hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@orbenyx.com" },
    update: {},
    create: {
      email: "admin@orbenyx.com",
      name: "Admin User",
      passwordHash: hashedPassword,
      role: "OWNER",
      isActive: true,
    },
  });

  console.log("Created admin user:", admin.email);

  // Create workshop settings
  await prisma.workshopSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      workshopName: "ORBENYX Workshop",
      address: "123 Workshop Street, Industrial Area, Chennai - 600001, Tamil Nadu",
      phone: "044-23456789",
      email: "info@orbenyx.com",
      gstin: "33AAACO1234B1Z5",
      stateCode: "33",
      bankDetails: JSON.stringify({
        bankName: "State Bank of India",
        accountName: "Orbenyx Auto Workshop",
        accountNumber: "12345678901",
        ifscCode: "SBIN0001234",
        branch: "Chennai Industrial Branch",
      }),
    },
  });

  console.log("Created workshop settings");

  // Create some sample parts/services
  const parts = [
    {
      description: "Engine Oil",
      partNumber: "EO-5W30-4L",
      hsnSacCode: "2710",
      category: "Spare Parts",
      unit: "LIT",
      defaultPrice: 80000, // 800.00 in paise
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "Oil Filter",
      partNumber: "OF-UNIVERSAL",
      hsnSacCode: "8421",
      category: "Spare Parts",
      unit: "NOS",
      defaultPrice: 15000, // 150.00 in paise
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "Brake Pads (Front)",
      partNumber: "BP-FRONT",
      hsnSacCode: "8708",
      category: "Spare Parts",
      unit: "SET",
      defaultPrice: 350000, // 3500.00 in paise
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "General Service Labour",
      partNumber: "",
      hsnSacCode: "9987",
      category: "Labour",
      unit: "NOS",
      defaultPrice: 80000, // 800.00 in paise
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "Brake Service Labour",
      partNumber: "",
      hsnSacCode: "9987",
      category: "Labour",
      unit: "NOS",
      defaultPrice: 120000, // 1200.00 in paise
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
  ];

  for (const part of parts) {
    await prisma.partsService.upsert({
      where: { id: part.description }, // Using description as unique identifier for demo
      update: part,
      create: {
        ...part,
        id: part.description, // Using description as ID for demo
      },
    });
  }

  console.log("Created sample parts/services");

  console.log("Database seeding completed!");
  console.log("\n=== LOGIN CREDENTIALS ===");
  console.log("Email: admin@orbenyx.com");
  console.log("Password: admin123");
  console.log("=========================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });