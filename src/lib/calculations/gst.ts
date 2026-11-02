/**
 * GST Financial Calculation Engine
 * Implements the calculation logic from the ORBENYX specification
 * All money values are in paise (integer)
 */

import type {
  Paise,
  RateBp,
  TaxConfiguration,
  SupplyType,
  Pricing,
  RoundingPolicy,
  TaxLine,
  TaxSlab,
  TaxDocument,
  TaxOptions,
} from "@/types";

const BP = 10_000; // Basis points multiplier (100% = 10000 bp)

/** Slabs the tax invoice summary always prints, even when empty. */
const PRINTED_SLABS: RateBp[] = [rateBp(1800), rateBp(2800)];

/**
 * Integer division rounded half away from zero (Excel's ROUND behaviour).
 * Used for all financial rounding to match Excel calculations.
 */
export function roundDiv(numerator: number, divisor: number): number {
  if (divisor === 0) throw new RangeError("roundDiv: divisor must not be zero");
  // Safe integers only: beyond 2^53 a product like taxable × rateBp silently loses paise.
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(divisor)) {
    throw new TypeError("roundDiv: arguments must be safe integers");
  }
  const sign = Math.sign(numerator) * Math.sign(divisor);
  const quotient = Math.floor(
    (2 * Math.abs(numerator) + Math.abs(divisor)) / (2 * Math.abs(divisor))
  );
  return sign * quotient + 0; // `+ 0` turns -0 into 0
}

/** Rupees (may carry paise, e.g. 61111.52) → integer paise. */
export function rupeesToPaise(amount: number): Paise {
  if (!Number.isFinite(amount)) throw new RangeError(`rupeesToPaise: invalid amount ${amount}`);
  return (Math.sign(amount) * Math.round(Math.abs(amount) * 100) + 0) as Paise;
}

/** Paise → whole rupees, rounded the way Excel displays a 0-decimal cell. */
export function paiseToDisplayRupees(amount: Paise): number {
  return roundDiv(amount, 100);
}

/** Plain number as the templates print it: no thousands separators, no currency sign. */
export function formatPaise(amount: Paise, { decimals = 0 }: { decimals?: 0 | 2 } = {}): string {
  if (decimals === 0) return String(paiseToDisplayRupees(amount));
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Calculate line amount: quantity × unit price, or explicit amount. */
export function lineAmount(
  qty: number,
  unitPrice: Paise,
  explicitAmount?: Paise
): Paise {
  if (explicitAmount !== undefined) return explicitAmount;
  return (Math.round(qty * unitPrice) + 0) as Paise;
}

/**
 * Extract state code from GSTIN (first 2 digits).
 */
export function stateCodeFromGstin(gstin: string): string {
  const GSTIN_REGEX = /^\d{2}[A-Z0-9]{13}$/;
  if (!GSTIN_REGEX.test(gstin)) throw new RangeError(`Invalid GSTIN "${gstin}"`);
  return gstin.slice(0, 2);
}

/**
 * Determine supply type: intra-state (CGST+SGST) or inter-state (IGST).
 */
export function supplyTypeFor(supplierGstin: string, placeOfSupplyStateCode: string): SupplyType {
  return stateCodeFromGstin(supplierGstin) === placeOfSupplyStateCode ? "INTRA" : "INTER";
}

interface TaxBreakup {
  taxable: Paise;
  cgst: Paise;
  sgst: Paise;
  igst: Paise;
  total: Paise;
}

/**
 * Split an amount into taxable + tax components.
 * @param base - Taxable value (exclusive pricing) or gross amount (inclusive pricing)
 * @param rateBp - GST rate in basis points
 * @param options - Calculation options
 */
function splitTax(base: Paise, rateBp: RateBp, options: TaxOptions): TaxBreakup {
  const inclusive = options.pricing === "INCLUSIVE";
  const shares = options.supplyType === "INTRA" ? 2 : 1;
  const unit = options.rounding === "LINE_RUPEE" ? 100 : 1;
  const divisor = shares * (inclusive ? BP + rateBp : BP) * unit;
  const share = roundDiv(base * rateBp, divisor) * unit;
  const tax = share * shares;
  const taxable = inclusive ? base - tax : base;
  return {
    taxable: taxable as Paise,
    cgst: (shares === 2 ? share : 0) as Paise,
    sgst: (shares === 2 ? share : 0) as Paise,
    igst: (shares === 1 ? share : 0) as Paise,
    total: (taxable + tax) as Paise,
  };
}

/**
 * Compute tax for a single line item.
 */
function computeLine(
  input: Omit<TaxLine, keyof TaxBreakup>,
  options: TaxOptions
): TaxLine {
  if (!Number.isInteger(input.gstRateBp) || input.gstRateBp < 0 || input.gstRateBp > BP) {
    throw new RangeError(`Line "${input.description}" has an invalid GST rate`);
  }
  const baseAmount = lineAmount(input.quantity, input.unitPrice);
  return { ...input, ...splitTax(baseAmount, input.gstRateBp, options) };
}

const sumBy = <T>(items: T[], pick: (item: T) => number): number =>
  items.reduce((acc, item) => acc + pick(item), 0);

/**
 * Sum tax breakups across multiple lines.
 */
function sumLines(lines: TaxLine[]): TaxBreakup {
  return {
    taxable: sumBy(lines, (l) => l.taxable) as Paise,
    cgst: sumBy(lines, (l) => l.cgst) as Paise,
    sgst: sumBy(lines, (l) => l.sgst) as Paise,
    igst: sumBy(lines, (l) => l.igst) as Paise,
    total: sumBy(lines, (l) => l.total) as Paise,
  };
}

/**
 * Compute slab totals.
 * - "EXCEL" (excel): tax computed once on each slab's aggregate (matches client's Excel sheets)
 * - "LINE_RUPEE" (line-rupee): slab = sum of rounded lines, so printed columns always add up
 */
function slabTotals(lines: TaxLine[], rateBp: RateBp, options: TaxOptions): TaxSlab {
  if (options.rounding === "LINE_RUPEE") return { rateBp, ...sumLines(lines) };
  const base =
    options.pricing === "INCLUSIVE"
      ? sumBy(lines, (l) => l.total)
      : sumBy(lines, (l) => l.taxable);
  return { rateBp, ...splitTax(base as Paise, rateBp, options) };
}

/**
 * Find rates with non-zero taxable value that the tax invoice has no printed row for.
 * The invoice prints 18% and 28% slabs; any other rate with taxable value would break the printed ladder.
 */
export function unprintedSlabs(doc: TaxDocument): RateBp[] {
  return doc.slabs
    .filter((slab) => !PRINTED_SLABS.includes(slab.rateBp) && slab.taxable !== 0)
    .map((s) => s.rateBp);
}

/**
 * Main entry point: compute complete tax document from line inputs.
 */
export function computeTaxDocument(
  inputs: Omit<TaxLine, keyof TaxBreakup>[],
  options: TaxOptions
): TaxDocument {
  const lines = inputs.map((input) => computeLine(input, options));
  const rates = [
    ...new Set([...PRINTED_SLABS, ...lines.map((l) => l.gstRateBp)]),
  ].sort((a, b) => a - b);
  const slabs = rates.map((rateBp) =>
    slabTotals(lines.filter((l) => l.gstRateBp === rateBp), rateBp, options)
  );
  const totals = {
    taxable: sumBy(slabs, (s) => s.taxable) as Paise,
    cgst: sumBy(slabs, (s) => s.cgst) as Paise,
    sgst: sumBy(slabs, (s) => s.sgst) as Paise,
    igst: sumBy(slabs, (s) => s.igst) as Paise,
  };
  const exactTotal = sumBy(slabs, (s) => s.total);
  const grandTotal = (roundDiv(exactTotal, 100) * 100) as Paise;
  return {
    ...totals,
    lines,
    slabs,
    taxTotal: (totals.cgst + totals.sgst + totals.igst) as Paise,
    grandTotal,
    roundOff: (grandTotal - exactTotal) as Paise,
  };
}

/**
 * Compute simple document totals (no GST) for Labour Bill and Simple Estimate.
 */
export function computeSimpleDocument(
  items: Array<{
    quantity: number;
    unitPrice: Paise;
    explicitAmount?: Paise;
  }>
): { subtotal: Paise; grandTotal: Paise } {
  const subtotal = items.reduce(
    (sum, item) => sum + lineAmount(item.quantity, item.unitPrice, item.explicitAmount),
    0
  ) as Paise;
  const grandTotal = (roundDiv(subtotal, 100) * 100) as Paise;
  return { subtotal, grandTotal };
}

/**
 * Calculate payment balance.
 */
export function calculateBalance(grandTotal: Paise, amountPaid: Paise): Paise {
  return (grandTotal - amountPaid) as Paise;
}

/**
 * Convert amount to words (Indian numbering system).
 * Returns the amount in words for printing on documents.
 */
export function amountInWords(amount: Paise): string {
  const rupees = Math.floor(amount / 100);
  const paise = amount % 100;

  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertHundreds(num: number): string {
    let result = "";
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + " ";
      num = 0;
    }
    if (num > 0) {
      result += ones[num] + " ";
    }
    return result.trim();
  }

  function convertThousands(num: number): string {
    if (num === 0) return "";
    if (num < 1000) return convertHundreds(num);
    if (num < 100000) {
      // Thousands (Indian: 1,00,000 = 1 Lakh)
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      return (
        convertHundreds(thousands) +
        " Thousand" +
        (remainder ? " " + convertHundreds(remainder) : "")
      );
    }
    if (num < 10000000) {
      // Lakhs (Indian: 1,00,00,000 = 1 Crore)
      const lakhs = Math.floor(num / 100000);
      const remainder = num % 100000;
      return (
        convertHundreds(lakhs) +
        " Lakh" +
        (remainder ? " " + convertThousands(remainder) : "")
      );
    }
    // Crores
    const crores = Math.floor(num / 10000000);
    const remainder = num % 10000000;
    return (
      convertHundreds(crores) +
      " Crore" +
      (remainder ? " " + convertThousands(remainder) : "")
    );
  }

  const rupeesWords = convertThousands(rupees).trim();
  const paiseWords = paise > 0 ? convertHundreds(paise).trim() : "";

  let result = "";
  if (rupeesWords) result += `${rupeesWords} Rupees`;
  if (paiseWords) {
    if (result) result += " and ";
    result += `${paiseWords} Paise`;
  }
  return result + " Only";
}

// Type helper
function rateBp(bp: number): RateBp {
  return bp as RateBp;
}