import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/db/prisma";
import { documentCreateSchema, documentSearchSchema } from "@/lib/validation/schemas";
import { getNextDocumentNumber } from "@/lib/numbering/document-numbering";
import { computeTaxDocument } from "@/lib/calculations/gst";
import type { Paise, RateBp, TaxConfiguration, SupplyType, Pricing, RoundingPolicy } from "@/types";

interface DocumentWhereInput {
  documentType?: string;
  status?: string;
  customerId?: string;
  vehicleId?: string;
  documentDate?: {
    gte?: Date;
    lte?: Date;
  };
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const documentType = searchParams.get("documentType");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const vehicleId = searchParams.get("vehicleId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const skip = (page - 1) * limit;

    const where: DocumentWhereInput = {};

    if (documentType) where.documentType = documentType;
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (dateFrom || dateTo) {
      where.documentDate = {};
      if (dateFrom) where.documentDate = { ...where.documentDate, gte: new Date(dateFrom) };
      if (dateTo) where.documentDate = { ...where.documentDate, lte: new Date(dateTo) };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { documentDate: "desc" },
        include: {
          customer: true,
          vehicle: true,
          items: true,
          taxLines: true,
          payments: true,
        },
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      data: documents,
      meta: {
        total,
        page: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = documentCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = validated.data;

    // Get the next document number
    const { documentNumber, fullNumber } = await getNextDocumentNumber(data.documentType);

    // Calculate financials based on document type
    let taxableTotal = 0;
    let taxTotal = 0;
    let grandTotal = 0;
    let amountPaid = 0;
    let balanceDue = 0;
    let taxLines: Array<{ taxType: string; taxRateBp: RateBp; taxableValue: Paise; taxAmount: Paise }> = [];

    // Prepare items for tax calculation
    const itemsForTaxCalc = data.items.map((item) => ({
      description: item.description,
      hsnSac: item.hsnSacCode ?? "",
      partNumber: item.partNumber ?? undefined,
      quantity: item.quantity,
      unitPrice: Math.round((item.unitPrice || 0) * 100) as Paise,
      gstRateBp: item.gstRateBp as RateBp,
      section: item.section ?? undefined,
    }));

    let computeOptions: { supplyType: SupplyType; rounding: RoundingPolicy; pricing: Pricing } = {
      supplyType: "INTRA",
      rounding: "EXCEL",
      pricing: "EXCLUSIVE",
    };

    if (data.documentType === "TAX_INVOICE") {
      computeOptions = {
        supplyType: (data.supplyType as SupplyType) || "INTRA",
        rounding: (data.rounding as RoundingPolicy) || "EXCEL",
        pricing: (data.pricing as Pricing) || "EXCLUSIVE",
      };

      const taxDoc = computeTaxDocument(itemsForTaxCalc, computeOptions);
      taxableTotal = taxDoc.taxable;
      taxTotal = taxDoc.taxTotal;
      grandTotal = taxDoc.grandTotal;

      taxLines = taxDoc.slabs
        .filter((slab) => slab.taxable !== 0 || [1800, 2800].includes(slab.rateBp))
        .flatMap((slab) => [
          { taxType: "CGST", taxRateBp: slab.rateBp, taxableValue: slab.taxable, taxAmount: slab.cgst },
          { taxType: "SGST", taxRateBp: slab.rateBp, taxableValue: slab.taxable, taxAmount: slab.sgst },
          { taxType: "IGST", taxRateBp: slab.rateBp, taxableValue: slab.taxable, taxAmount: slab.igst },
        ])
        .filter((line) => line.taxAmount !== 0 || [1800, 2800].includes(line.taxRateBp));
    } else if (data.documentType === "LABOUR_BILL") {
      // Simple calculation for labour bill
      const subtotal = data.items.reduce((sum, item) => sum + Math.round((item.unitPrice || 0) * 100) * item.quantity, 0);
      taxableTotal = subtotal;
      grandTotal = Math.round(subtotal / 100) * 100;
      taxTotal = 0;
    } else {
      // Simple calculation for estimates
      const subtotal = data.items.reduce((sum, item) => sum + Math.round((item.unitPrice || 0) * 100) * item.quantity, 0);
      taxableTotal = subtotal;
      grandTotal = Math.round(subtotal / 100) * 100;
      taxTotal = 0;
    }

    amountPaid = data.advance || 0;
    balanceDue = grandTotal - amountPaid;

    // Create document with items and tax lines
    const document = await prisma.document.create({
      data: {
        documentType: data.documentType,
        documentNumber,
        financialYear: getCurrentFinancialYear(),
        customerId: data.customerId || null,
        vehicleId: data.vehicleId || null,
        documentDate: new Date(data.documentDate),
        status: "DRAFT",
        taxableTotal,
        taxTotal,
        grandTotal,
        amountPaid,
        balanceDue,
        templateVersion: "1.0",
        createdBy: session.user.id,
        items: {
          create: data.items.map((item, index) => ({
            itemId: item.itemId || null,
            descriptionSnapshot: item.description,
            partNumberSnapshot: item.partNumber || null,
            hsnSacSnapshot: item.hsnSacCode || null,
            quantity: item.quantity,
            unitPrice: Math.round((item.unitPrice || 0) * 100) as Paise,
            taxableValue: Math.round((item.unitPrice || 0) * 100) * item.quantity,
            taxConfigurationSnapshot: item.taxConfiguration,
            gstRateBpSnapshot: item.gstRateBp as RateBp,
            taxAmount: 0, // Will be calculated per line if needed
            lineTotal: Math.round((item.unitPrice || 0) * 100) * item.quantity,
            sortOrder: index,
            section: item.section || null,
          })),
        },
        taxLines: {
          create: taxLines,
        },
        ...(data.documentType === "INSURANCE_CLAIM" && {
          insuranceClaim: {
            create: {
              policyNumber: data.policyNumber,
              policyStartDate: data.policyStartDate ? new Date(data.policyStartDate) : null,
              policyEndDate: data.policyEndDate ? new Date(data.policyEndDate) : null,
              insuredName: data.insuredName,
              accidentDate: data.accidentDate ? new Date(data.accidentDate) : null,
              accidentLocation: data.accidentLocation,
              accidentDescription: data.accidentDescription,
              idvAmount: data.idvAmount ? Math.round(data.idvAmount * 100) : null,
              estimatedLoss: data.estimatedLoss ? Math.round(data.estimatedLoss * 100) : null,
              firCsrDetails: data.firCsrDetails,
              surveyDetails: data.surveyDetails,
            },
          },
        }),
      },
      include: {
        customer: true,
        vehicle: true,
        items: true,
        taxLines: true,
        insuranceClaim: true,
      },
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getCurrentFinancialYear(): string {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${String(year + 1).slice(-2)}`;
}