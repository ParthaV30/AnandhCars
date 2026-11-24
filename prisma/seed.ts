import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for SMART CAR AC WORKS...");

  const hashedPassword = await hash("admin123", 12);

  // Users
  const users = [
    { email: "admin@smartcar.com", name: "Parthasarathi (Admin)" },
    { email: "smartcaracs@gmail.com", name: "Smart Car AC Works Admin" },
    { email: "admin@orbenyx.com", name: "Legacy Admin" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: hashedPassword, isActive: true },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: hashedPassword,
        role: "OWNER",
        isActive: true,
      },
    });
    console.log("Seeded user:", u.email);
  }

  // Workshop settings (SMART CAR AC WORKS)
  await prisma.workshopSettings.upsert({
    where: { id: "singleton" },
    update: {
      workshopName: "SMART CAR AC WORKS",
      address: "No.: 88, K.R.N Complex, Nehru Nagar, 2nd Bus Stop, Kalapatti Road, Coimbatore - 641 014.",
      phone: "98944 88847",
      email: "smartcaracs@gmail.com",
      gstin: "33ANLPN0999B1ZX",
      stateCode: "33",
      bankDetails: JSON.stringify({
        bankName: "KARUR VYSYA BANK",
        accountName: "SMART CAR AC WORKS",
        accountNumber: "1662135000004834",
        ifscCode: "KVBL0001662",
        branch: "NEHRU NAGAR",
        canaraBankName: "CANARA BANK",
        canaraAccount: "2988201002428",
        canaraBranch: "PSG COLLEGE ARTS SCIENCE",
        canaraIfsc: "CNRB0002988",
        gpay: "98944 88847",
      }),
    },
    create: {
      id: "singleton",
      workshopName: "SMART CAR AC WORKS",
      address: "No.: 88, K.R.N Complex, Nehru Nagar, 2nd Bus Stop, Kalapatti Road, Coimbatore - 641 014.",
      phone: "98944 88847",
      email: "smartcaracs@gmail.com",
      gstin: "33ANLPN0999B1ZX",
      stateCode: "33",
      bankDetails: JSON.stringify({
        bankName: "KARUR VYSYA BANK",
        accountName: "SMART CAR AC WORKS",
        accountNumber: "1662135000004834",
        ifscCode: "KVBL0001662",
        branch: "NEHRU NAGAR",
        canaraBankName: "CANARA BANK",
        canaraAccount: "2988201002428",
        canaraBranch: "PSG COLLEGE ARTS SCIENCE",
        canaraIfsc: "CNRB0002988",
        gpay: "98944 88847",
      }),
    },
  });

  console.log("Updated workshop settings to SMART CAR AC WORKS");

  // Sample client parts & services
  const parts = [
    {
      description: "AC Gas (R134a)",
      partNumber: "AC-GAS-450",
      hsnSacCode: "8708",
      category: "Spare Parts",
      unit: "CAN",
      defaultPrice: 150000,
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "AC System Service & Leak Testing",
      partNumber: "",
      hsnSacCode: "9987",
      category: "Labour",
      unit: "JOB",
      defaultPrice: 120000,
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "Wind Screen",
      partNumber: "WS-8708",
      hsnSacCode: "8708",
      category: "Spare Parts",
      unit: "NOS",
      defaultPrice: 6807700,
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "Head Light",
      partNumber: "HL-8512",
      hsnSacCode: "8512",
      category: "Spare Parts",
      unit: "NOS",
      defaultPrice: 8314900,
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "Bumper Cover",
      partNumber: "BC-8708",
      hsnSacCode: "8708",
      category: "Spare Parts",
      unit: "NOS",
      defaultPrice: 7292900,
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "Labour Charges As per Surveyor approved",
      partNumber: "",
      hsnSacCode: "9987",
      category: "Labour",
      unit: "JOB",
      defaultPrice: 7305000,
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "FRONT SUSPENSION WORK LABOUR",
      partNumber: "",
      hsnSacCode: "9987",
      category: "Labour",
      unit: "JOB",
      defaultPrice: 350000,
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
    {
      description: "STAB LINK ASSY",
      partNumber: "SLA-01",
      hsnSacCode: "8708",
      category: "Spare Parts",
      unit: "NOS",
      defaultPrice: 123300,
      taxConfiguration: "CGST_SGST",
      gstRateBp: 1800,
      isActive: true,
    },
  ];

  for (const part of parts) {
    await prisma.partsService.upsert({
      where: { id: part.description },
      update: part,
      create: {
        ...part,
        id: part.description,
      },
    });
  }

  // Seed customers
  const customers = [
    {
      name: "M/s, THE NEW INDIA ASSURANCE COMPANY LIMITED",
      phone: "0422-2244556",
      address: "Motor OD Claims, Coimbatore",
      gstin: "33AAACN4165C4ZV",
    },
    {
      name: "Ms. SLNP SILKS",
      phone: "98944 88847",
      address: "Coimbatore, Tamil Nadu",
      gstin: "",
    },
    {
      name: "United India Insurance Co. Ltd.",
      phone: "0422-2233445",
      address: "Divisional Office, Coimbatore",
      gstin: "33AAACU5552C1ZQ",
    },
  ];

  for (const c of customers) {
    const existing = await prisma.customer.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.customer.create({ data: c });
    }
  }

  // Seed sample vehicles
  const defaultCustomer = await prisma.customer.findFirst();
  if (defaultCustomer) {
    const vehicles = [
      { registrationNo: "PY 01 DF 8282", manufacturer: "VOLVO", model: "XC 60", customerId: defaultCustomer.id },
      { registrationNo: "TN 40 AA 5333", manufacturer: "MARUTI", model: "XL 6", customerId: defaultCustomer.id },
      { registrationNo: "TN 38 CW 8176", manufacturer: "MARUTI", model: "BALENO", customerId: defaultCustomer.id },
      { registrationNo: "TN 28 BY 8622", manufacturer: "MAHINDRA", model: "XUV 500", customerId: defaultCustomer.id },
    ];

    for (const v of vehicles) {
      const existing = await prisma.vehicle.findFirst({ where: { registrationNo: v.registrationNo } });
      if (!existing) {
        await prisma.vehicle.create({ data: v });
      }
    }
  }

  console.log("Database seeding completed!");
  console.log("\n=== SMART CAR AC WORKS LOGIN CREDENTIALS ===");
  console.log("Email: smartcaracs@gmail.com  (or admin@smartcar.com)");
  console.log("Password: admin123");
  console.log("============================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
