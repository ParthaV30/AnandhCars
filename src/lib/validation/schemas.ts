import { z } from "zod";
import type {
  TaxConfiguration,
  SupplyType,
  Pricing,
  RoundingPolicy,
  PaymentMethod,
  DocumentType,
  DocumentStatus,
  Role,
} from "@/types";

// Reusable schemas
const paiseSchema = z.number().int().min(0).max(999999999);
const rateBpSchema = z.number().int().min(0).max(2800); // Max 28% GST
const positiveIntSchema = z.number().int().positive();
const nonNegativeIntSchema = z.number().int().nonnegative();
const optionalStringSchema = z.string().optional().nullable();

// Customer schemas
export const customerCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email("Invalid email").max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  stateCode: z.string().max(2).optional().nullable(),
  pinCode: z.string().max(10).optional().nullable(),
  gstin: z
    .string()
    .regex(/^\d{2}[A-Z0-9]{13}$/, "Invalid GSTIN format")
    .optional()
    .nullable(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customerSearchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;

// Vehicle schemas
export const vehicleCreateSchema = z.object({
  customerId: z.string().cuid("Invalid customer ID"),
  registrationNo: z
    .string()
    .min(1, "Registration number is required")
    .max(20)
    .regex(/^[A-Z0-9\s]+$/, "Invalid registration number format"),
  manufacturer: z.string().min(1, "Manufacturer is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  odometerReading: z.string().max(20).optional().nullable(),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

export const vehicleSearchSchema = z.object({
  query: z.string().optional(),
  customerId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;

// Parts/Service schemas
export const partsServiceCreateSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  partNumber: z.string().max(100).optional().nullable(),
  hsnSacCode: z.string().max(20).optional().nullable(),
  category: z.string().min(1, "Category is required").max(100),
  unit: z.string().min(1, "Unit is required").max(20).default("NOS"),
  defaultPrice: z.number().int().min(0).default(0),
  taxConfiguration: z.enum(["CGST_SGST", "IGST", "EXEMPT"]).default("CGST_SGST"),
  gstRateBp: z.number().int().min(0).max(2800).default(1800),
  isActive: z.boolean().default(true),
});

export const partsServiceUpdateSchema = partsServiceCreateSchema.partial();

export const partsServiceSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PartsServiceCreateInput = z.infer<typeof partsServiceCreateSchema>;
export type PartsServiceUpdateInput = z.infer<typeof partsServiceUpdateSchema>;

// Document Item schema (for line items)
export const documentItemSchema = z.object({
  itemId: z.string().cuid().optional().nullable(),
  description: z.string().min(1, "Description is required").max(500),
  partNumber: z.string().max(100).optional().nullable(),
  hsnSacCode: z.string().max(20).optional().nullable(),
  quantity: z.number().positive("Quantity must be positive").default(1),
  unitPrice: z.number().int().min(0).default(0), // In paise
  taxConfiguration: z.enum(["CGST_SGST", "IGST", "EXEMPT"]).default("CGST_SGST"),
  gstRateBp: z.number().int().min(0).max(2800).default(1800),
  section: z.string().max(100).optional().nullable(),
});

// Document creation schema
export const documentCreateSchema = z.object({
  documentType: z.enum([
    "TAX_INVOICE",
    "LABOUR_BILL",
    "REPAIR_ESTIMATE",
    "INSURANCE_CLAIM",
    "SIMPLE_ESTIMATE",
  ]),
  customerId: z.string().cuid().optional().nullable(),
  vehicleId: z.string().cuid().optional().nullable(),
  documentDate: z.string().datetime({ offset: true }),
  items: z.array(documentItemSchema).min(1, "At least one item is required"),
  // Tax invoice specific
  supplyType: z.enum(["INTRA", "INTER"]).optional(),
  rounding: z.enum(["EXCEL", "LINE_RUPEE"]).optional(),
  pricing: z.enum(["EXCLUSIVE", "INCLUSIVE"]).optional(),
  // Labour bill specific
  advance: z.number().int().min(0).optional(),
  // Repair estimate specific
  jobCardNo: z.string().max(50).optional().nullable(),
  preparedBy: z.string().max(100).optional().nullable(),
  // Insurance claim specific
  policyNumber: z.string().max(50).optional().nullable(),
  policyStartDate: z.string().datetime({ offset: true }).optional().nullable(),
  policyEndDate: z.string().datetime({ offset: true }).optional().nullable(),
  insuredName: z.string().max(200).optional().nullable(),
  accidentDate: z.string().datetime({ offset: true }).optional().nullable(),
  accidentLocation: z.string().max(500).optional().nullable(),
  accidentDescription: z.string().max(2000).optional().nullable(),
  idvAmount: z.number().int().min(0).optional().nullable(),
  estimatedLoss: z.number().int().min(0).optional().nullable(),
  firCsrDetails: z.string().max(500).optional().nullable(),
  surveyDetails: z.string().max(500).optional().nullable(),
});

export const documentUpdateSchema = documentCreateSchema.partial().extend({
  id: z.string().cuid(),
  status: z
    .enum(["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "CANCELLED", "APPROVED", "REJECTED"])
    .optional(),
});

export const documentSearchSchema = z.object({
  documentType: z
    .enum([
      "TAX_INVOICE",
      "LABOUR_BILL",
      "REPAIR_ESTIMATE",
      "INSURANCE_CLAIM",
      "SIMPLE_ESTIMATE",
    ])
    .optional(),
  status: z
    .enum(["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "CANCELLED", "APPROVED", "REJECTED"])
    .optional(),
  customerId: z.string().cuid().optional(),
  vehicleId: z.string().cuid().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type DocumentCreateInput = z.infer<typeof documentCreateSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;

// Payment schemas
export const paymentCreateSchema = z.object({
  documentId: z.string().cuid("Invalid document ID"),
  paymentDate: z.string().datetime({ offset: true }),
  amount: z.number().int().positive("Amount must be positive"),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]),
  referenceNumber: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const paymentUpdateSchema = paymentCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;

// Workshop Settings schema
export const workshopSettingsSchema = z.object({
  workshopName: z.string().min(1, "Workshop name is required").max(200),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email("Invalid email").max(200).optional().nullable(),
  gstin: z
    .string()
    .regex(/^\d{2}[A-Z0-9]{13}$/, "Invalid GSTIN format")
    .optional()
    .nullable(),
  stateCode: z.string().max(2).optional().nullable(),
  bankDetails: z
    .object({
      bankName: z.string().max(200),
      accountName: z.string().max(200),
      accountNumber: z.string().max(50),
      ifscCode: z.string().max(20),
      branch: z.string().max(200),
    })
    .optional()
    .nullable(),
});

export type WorkshopSettingsInput = z.infer<typeof workshopSettingsSchema>;

// User schemas
export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").max(200),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["OWNER", "ADMIN", "BILLING_STAFF", "ACCOUNTANT", "INVENTORY_MANAGER", "SERVICE_ADVISOR", "BRANCH_MANAGER"]),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(200).optional(),
  role: z.enum(["OWNER", "ADMIN", "BILLING_STAFF", "ACCOUNTANT", "INVENTORY_MANAGER", "SERVICE_ADVISOR", "BRANCH_MANAGER"]).optional(),
  isActive: z.boolean().optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Report schemas
export const billingReportSchema = z.object({
  dateFrom: z.string().datetime({ offset: true }),
  dateTo: z.string().datetime({ offset: true }),
  documentType: z
    .enum([
      "TAX_INVOICE",
      "LABOUR_BILL",
      "REPAIR_ESTIMATE",
      "INSURANCE_CLAIM",
      "SIMPLE_ESTIMATE",
    ])
    .optional(),
  customerId: z.string().cuid().optional(),
});

export const paymentsReportSchema = z.object({
  dateFrom: z.string().datetime({ offset: true }),
  dateTo: z.string().datetime({ offset: true }),
  paymentMethod: z
    .enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"])
    .optional(),
});

export const outstandingReportSchema = z.object({
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  customerId: z.string().cuid().optional(),
});

export type BillingReportInput = z.infer<typeof billingReportSchema>;
export type PaymentsReportInput = z.infer<typeof paymentsReportSchema>;
export type OutstandingReportInput = z.infer<typeof outstandingReportSchema>;