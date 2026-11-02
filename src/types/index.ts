// Application-wide types

// Money is stored as integer paise (1 rupee = 100 paise)
export type Paise = number & { readonly __brand: unique symbol };

export function paise(amount: number): Paise {
  return amount as Paise;
}

export function rupeesToPaise(rupees: number): Paise {
  return Math.round(rupees * 100) as Paise;
}

export function paiseToRupees(paise: Paise): number {
  return paise / 100;
}

export function formatPaise(paise: Paise, decimals = 2): string {
  const sign = paise < 0 ? "-" : "";
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const remainingPaise = abs % 100;
  if (decimals === 0) {
    return `${sign}${rupees}`;
  }
  return `${sign}${rupees}.${String(remainingPaise).padStart(2, "0")}`;
}

// GST rate in basis points (1% = 100bp, 18% = 1800bp)
export type RateBp = number & { readonly __brand: unique symbol };

export function rateBp(bp: number): RateBp {
  return bp as RateBp;
}

// Document types
export type DocumentType =
  | "TAX_INVOICE"
  | "LABOUR_BILL"
  | "REPAIR_ESTIMATE"
  | "INSURANCE_CLAIM"
  | "SIMPLE_ESTIMATE";

export type DocumentStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED"
  | "APPROVED"
  | "REJECTED";

export type Role =
  | "OWNER"
  | "ADMIN"
  | "BILLING_STAFF"
  | "ACCOUNTANT"
  | "INVENTORY_MANAGER"
  | "SERVICE_ADVISOR"
  | "BRANCH_MANAGER";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "OTHER";

export type TaxConfiguration = "CGST_SGST" | "IGST" | "EXEMPT";
export type SupplyType = "INTRA" | "INTER";
export type Pricing = "EXCLUSIVE" | "INCLUSIVE";
export type RoundingPolicy = "EXCEL" | "LINE_RUPEE";

// User session
export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Customer
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  stateCode?: string;
  pinCode?: string;
  gstin?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle
export interface Vehicle {
  id: string;
  customerId: string;
  registrationNo: string;
  manufacturer: string;
  model: string;
  odometerReading?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Parts/Service Item
export interface PartsService {
  id: string;
  description: string;
  partNumber?: string;
  hsnSacCode?: string;
  category: string;
  unit: string;
  defaultPrice: Paise;
  taxConfiguration: TaxConfiguration;
  gstRateBp: RateBp;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Document Item (line item)
export interface DocumentItem {
  id: string;
  documentId: string;
  itemId?: string;
  descriptionSnapshot: string;
  partNumberSnapshot?: string;
  hsnSacSnapshot?: string;
  quantity: number;
  unitPrice: Paise;
  taxableValue: Paise;
  taxConfigurationSnapshot: TaxConfiguration;
  gstRateBpSnapshot: RateBp;
  taxAmount: Paise;
  lineTotal: Paise;
  sortOrder: number;
  section?: string;
}

// Document Tax Line
export interface DocumentTaxLine {
  id: string;
  documentId: string;
  taxType: string; // CGST, SGST, IGST
  taxRateBp: RateBp;
  taxableValue: Paise;
  taxAmount: Paise;
}

// Payment
export interface Payment {
  id: string;
  documentId: string;
  paymentDate: Date;
  amount: Paise;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

// Document
export interface Document {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  financialYear: string;
  customerId?: string;
  vehicleId?: string;
  documentDate: Date;
  status: DocumentStatus;
  taxableTotal: Paise;
  taxTotal: Paise;
  grandTotal: Paise;
  amountPaid: Paise;
  balanceDue: Paise;
  templateVersion: string;
  issuedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  vehicle?: Vehicle;
  items: DocumentItem[];
  taxLines: DocumentTaxLine[];
  payments: Payment[];
  workshopSettings?: WorkshopSettings;
}

export function getFullNumber(document: Document): string {
  const prefixes: Record<DocumentType, string> = {
    TAX_INVOICE: "INV",
    LABOUR_BILL: "LAB",
    REPAIR_ESTIMATE: "EST",
    INSURANCE_CLAIM: "CLM",
    SIMPLE_ESTIMATE: "QUO",
  };
  return `${prefixes[document.documentType]}/${document.financialYear}/${document.documentNumber}`;
}

// Workshop Settings
export interface WorkshopSettings {
  id: string;
  workshopName: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  stateCode?: string;
  bankDetails?: BankDetails;
  signatureUrl?: string;
  logoUrl?: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
}

// Insurance Claim
export interface InsuranceClaim {
  id: string;
  documentId: string;
  policyNumber?: string;
  policyStartDate?: Date;
  policyEndDate?: Date;
  insuredName?: string;
  accidentDate?: Date;
  accidentLocation?: string;
  accidentDescription?: string;
  idvAmount?: Paise;
  estimatedLoss?: Paise;
  firCsrDetails?: string;
  surveyDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response format
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form types
export interface CustomerFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  stateCode?: string;
  pinCode?: string;
  gstin?: string;
}

export interface VehicleFormData {
  customerId: string;
  registrationNo: string;
  manufacturer: string;
  model: string;
  odometerReading?: string;
}

export interface PartsServiceFormData {
  description: string;
  partNumber?: string;
  hsnSacCode?: string;
  category: string;
  unit: string;
  defaultPrice: number; // In rupees
  taxConfiguration: TaxConfiguration;
  gstRateBp: number; // In basis points
  isActive: boolean;
}

// Document creation form data
export interface DocumentFormData {
  documentType: DocumentType;
  customerId?: string;
  vehicleId?: string;
  documentDate: string;
  items: DocumentItemFormData[];
}

export interface DocumentItemFormData {
  itemId?: string;
  description: string;
  partNumber?: string;
  hsnSacCode?: string;
  quantity: number;
  unitPrice: number; // In rupees
  taxConfiguration: TaxConfiguration;
  gstRateBp: number; // In basis points
  section?: string;
}

// Tax calculation types
export interface TaxBreakup {
  taxable: Paise;
  cgst: Paise;
  sgst: Paise;
  igst: Paise;
  total: Paise;
}

export interface TaxLine extends TaxBreakup {
  description: string;
  hsnSac: string;
  partNumber?: string;
  quantity: number;
  unitPrice: Paise;
  gstRateBp: RateBp;
  section?: string;
}

export interface TaxSlab extends TaxBreakup {
  rateBp: RateBp;
}

export interface TaxDocument {
  lines: TaxLine[];
  slabs: TaxSlab[];
  taxable: Paise;
  cgst: Paise;
  sgst: Paise;
  igst: Paise;
  taxTotal: Paise;
  grandTotal: Paise;
  roundOff: Paise;
}

export interface TaxOptions {
  supplyType: SupplyType;
  rounding: RoundingPolicy;
  pricing?: Pricing;
}