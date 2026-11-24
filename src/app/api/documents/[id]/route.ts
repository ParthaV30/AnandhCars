import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: {
        OR: [{ id }, { documentNumber: id }],
      },
      include: {
        customer: true,
        vehicle: true,
        items: true,
        taxLines: true,
        payments: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const settings = await prisma.workshopSettings.findFirst();

    const cgstAmount = document.taxLines
      .filter((l) => l.taxType === "CGST")
      .reduce((sum, l) => sum + l.taxAmount, 0);
    const sgstAmount = document.taxLines
      .filter((l) => l.taxType === "SGST")
      .reduce((sum, l) => sum + l.taxAmount, 0);

    const defaultSmartCarSettings = {
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
    };

    return NextResponse.json({
      data: {
        ...document,
        totalAmount: document.grandTotal,
        taxableAmount: document.taxableTotal,
        advanceAmount: document.amountPaid,
        balanceDue: document.balanceDue,
        cgstAmount,
        sgstAmount,
        items: document.items.map((item) => ({
          ...item,
          description: item.descriptionSnapshot,
          partNumber: item.partNumberSnapshot || "",
          hsnSacCode: item.hsnSacSnapshot || "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxableAmount: item.taxableValue,
          totalAmount: item.lineTotal,
          gstRateBp: item.gstRateBpSnapshot,
        })),
        workshopSettings: settings || defaultSmartCarSettings,
      },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
