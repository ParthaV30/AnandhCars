/**
 * Document Numbering Service
 * Handles sequential numbering for all document types with financial year support
 */

import { prisma } from "@/lib/db/prisma";
import type { DocumentType } from "@/types";

// Document type prefixes for display
export const DOCUMENT_PREFIXES: Record<DocumentType, string> = {
  TAX_INVOICE: "INV",
  LABOUR_BILL: "LAB",
  REPAIR_ESTIMATE: "EST",
  INSURANCE_CLAIM: "CLM",
  SIMPLE_ESTIMATE: "QUO",
};

/**
 * Get the current financial year in format "YYYY-YY" (e.g., "2026-27")
 * Indian financial year: April 1 to March 31
 */
export function getCurrentFinancialYear(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  // If month is April (3) or later, financial year is current year - next year
  // If month is Jan-Mar (0-2), financial year is previous year - current year
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `${fyStart}-${String(fyEnd).slice(-2)}`;
}

/**
 * Parse financial year string to get start and end dates
 */
export function parseFinancialYear(fy: string): { start: Date; end: Date } {
  const [startYearStr, endYearStr] = fy.split("-");
  const startYear = parseInt(startYearStr, 10);
  const endYear = startYear + 1;
  // Financial year starts April 1
  const start = new Date(startYear, 3, 1); // April 1
  const end = new Date(endYear, 2, 31, 23, 59, 59); // March 31
  return { start, end };
}

/**
 * Generate the next document number for a given type and financial year.
 * Uses database transaction to ensure atomicity and prevent duplicates.
 */
export async function getNextDocumentNumber(
  documentType: DocumentType,
  financialYear?: string
): Promise<{ documentNumber: string; fullNumber: string }> {
  const fy = financialYear || getCurrentFinancialYear();

  const sequence = await prisma.documentSequence.upsert({
    where: {
      documentType_financialYear: {
        documentType,
        financialYear: fy,
      },
    },
    create: {
      documentType,
      financialYear: fy,
      nextNumber: 2, // Next will be 2, current is 1
    },
    update: {
      nextNumber: { increment: 1 },
    },
  });

  const number = sequence.nextNumber - 1; // The number we just allocated
  const prefix = DOCUMENT_PREFIXES[documentType];
  const paddedNumber = String(number).padStart(4, "0");
  const documentNumber = paddedNumber;
  const fullNumber = `${prefix}/${fy}/${paddedNumber}`;

  return { documentNumber, fullNumber };
}

/**
 * Get the current next number without incrementing (for preview)
 */
export async function previewNextDocumentNumber(
  documentType: DocumentType,
  financialYear?: string
): Promise<{ documentNumber: string; fullNumber: string }> {
  const fy = financialYear || getCurrentFinancialYear();

  const sequence = await prisma.documentSequence.findUnique({
    where: {
      documentType_financialYear: {
        documentType,
        financialYear: fy,
      },
    },
  });

  const nextNumber = sequence?.nextNumber || 1;
  const prefix = DOCUMENT_PREFIXES[documentType];
  const paddedNumber = String(nextNumber).padStart(4, "0");
  const documentNumber = paddedNumber;
  const fullNumber = `${prefix}/${fy}/${paddedNumber}`;

  return { documentNumber, fullNumber };
}

/**
 * Reset document sequence (admin only - use with caution)
 */
export async function resetDocumentSequence(
  documentType: DocumentType,
  financialYear: string,
  nextNumber = 1
): Promise<void> {
  await prisma.documentSequence.upsert({
    where: {
      documentType_financialYear: {
        documentType,
        financialYear,
      },
    },
    create: {
      documentType,
      financialYear,
      nextNumber,
    },
    update: {
      nextNumber,
    },
  });
}

/**
 * Get all document sequences for a financial year
 */
export async function getDocumentSequences(financialYear?: string) {
  const fy = financialYear || getCurrentFinancialYear();
  return prisma.documentSequence.findMany({
    where: { financialYear: fy },
    orderBy: { documentType: "asc" },
  });
}

/**
 * Format document number for display
 */
export function formatDocumentNumber(
  documentType: DocumentType,
  documentNumber: string,
  financialYear: string
): string {
  const prefix = DOCUMENT_PREFIXES[documentType];
  return `${prefix}/${financialYear}/${documentNumber}`;
}