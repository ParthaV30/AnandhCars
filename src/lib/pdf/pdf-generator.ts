/**
 * PDF Generation Service
 * Uses Playwright + Chromium to render HTML/CSS templates to PDF
 * Ensures visual fidelity with client's existing document formats
 */

import { chromium, type Browser, type Page } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import type { Document, DocumentType, Paise } from "@/types";
import { getFullNumber } from "@/types";
import { formatPaise, amountInWords } from "@/lib/calculations/gst";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global browser instance (reuse for performance)
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Generate PDF from HTML template
 */
export async function generatePdfFromHtml(
  html: string,
  options: {
    format?: "A4" | "A5" | "Legal" | "Letter";
    margin?: { top: string; right: string; bottom: string; left: string };
    printBackground?: boolean;
    scale?: number;
  } = {}
): Promise<Buffer> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();

  try {
    // Set content and wait for fonts to load
    await page.setContent(html, { waitUntil: "networkidle" });

    // Wait for fonts to load
    await page.evaluateHandle(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: options.format || "A4",
      margin: options.margin || { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      printBackground: options.printBackground !== false,
      scale: options.scale || 1,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

/**
 * Generate PDF for a specific document type
 */
export async function generateDocumentPdf(document: Document): Promise<Buffer> {
  const html = renderDocumentTemplate(document);
  return generatePdfFromHtml(html, getPdfOptions(document.documentType));
}

/**
 * Get PDF options based on document type
 */
function getPdfOptions(documentType: DocumentType) {
  const baseOptions = {
    format: "A4" as const,
    margin: { top: "10mm", right: "10mm", bottom: "15mm", left: "10mm" },
    printBackground: true,
    scale: 1,
  };

  // Document-specific adjustments
  switch (documentType) {
    case "TAX_INVOICE":
      return { ...baseOptions, margin: { top: "8mm", right: "8mm", bottom: "12mm", left: "8mm" } };
    case "LABOUR_BILL":
      return { ...baseOptions, margin: { top: "10mm", right: "10mm", bottom: "15mm", left: "10mm" } };
    case "REPAIR_ESTIMATE":
      return { ...baseOptions, format: "Legal" as const };
    case "INSURANCE_CLAIM":
      return { ...baseOptions };
    case "SIMPLE_ESTIMATE":
      return { ...baseOptions, format: "A5" as const };
    default:
      return baseOptions;
  }
}

/**
 * Render document template based on type
 */
function renderDocumentTemplate(document: Document): string {
  switch (document.documentType) {
    case "TAX_INVOICE":
      return renderTaxInvoiceTemplate(document);
    case "LABOUR_BILL":
      return renderLabourBillTemplate(document);
    case "REPAIR_ESTIMATE":
      return renderRepairEstimateTemplate(document);
    case "INSURANCE_CLAIM":
      return renderInsuranceClaimTemplate(document);
    case "SIMPLE_ESTIMATE":
      return renderSimpleEstimateTemplate(document);
    default:
      throw new Error(`Unknown document type: ${document.documentType}`);
  }
}

// ============================================
// TEMPLATE RENDERERS
// These will be replaced with actual HTML/CSS templates
// that match the client's exact PDF formats
// ============================================

function renderTaxInvoiceTemplate(document: Document): string {
  const settings = document.workshopSettings || getDefaultSettings();
  const customer = document.customer;
  const vehicle = document.vehicle;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${getFullNumber(document)}</title>
  <style>${getTaxInvoiceStyles()}</style>
</head>
<body>
  <div class="page">
    <!-- Workshop Header -->
    <header class="workshop-header">
      <div class="logo-section">
        ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo" class="logo">` : ""}
        <div class="workshop-info">
          <h1 class="workshop-name">${settings.workshopName}</h1>
          <p class="workshop-address">${settings.address}</p>
          <p class="workshop-contact">Ph: ${settings.phone} | Email: ${settings.email}</p>
          <p class="workshop-gstin">GSTIN: ${settings.gstin} | State: ${settings.stateCode}</p>
        </div>
      </div>
      <div class="invoice-title">TAX INVOICE</div>
    </header>

    <!-- Invoice Info -->
    <div class="invoice-info-grid">
      <div class="info-block">
        <label>Invoice No.</label>
        <span>${getFullNumber(document)}</span>
      </div>
      <div class="info-block">
        <label>Date</label>
        <span>${formatDate(document.documentDate)}</span>
      </div>
      <div class="info-block">
        <label>State</label>
        <span>${customer?.address?.includes("Tamil") ? "Tamil Nadu" : settings.stateCode}</span>
      </div>
    </div>

    <!-- Vehicle Info -->
    <div class="vehicle-info">
      <div class="info-row">
        <span><strong>Vehicle:</strong> ${vehicle?.registrationNo || ""}</span>
        <span><strong>Make:</strong> ${vehicle?.manufacturer || ""}</span>
        <span><strong>Model:</strong> ${vehicle?.model || ""}</span>
        <span><strong>Odometer:</strong> ${vehicle?.odometerReading || ""}</span>
      </div>
    </div>

    <!-- Bill To / Ship To -->
    <div class="party-info-grid">
      <div class="party-block">
        <h3>Bill To Party</h3>
        <p><strong>${customer?.name || ""}</strong></p>
        <p>${customer?.address || ""}</p>
        <p>GSTIN: ${customer?.gstin || ""}</p>
        <p>State: ${customer?.stateCode || ""}</p>
      </div>
      <div class="party-block">
        <h3>Ship To Party</h3>
        <p><strong>${customer?.name || ""}</strong></p>
        <p>${customer?.address || ""}</p>
        <p>GSTIN: ${customer?.gstin || ""}</p>
        <p>State: ${customer?.stateCode || ""}</p>
      </div>
    </div>

    <!-- Line Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th class="col-sno">S.No</th>
          <th class="col-hsn">HSN Code</th>
          <th class="col-desc">Description</th>
          <th class="col-qty">Qty</th>
          <th class="col-rate">Rate</th>
          <th class="col-taxable">Taxable Value</th>
          <th class="col-cgst">CGST</th>
          <th class="col-sgst">SGST</th>
          <th class="col-total">Total</th>
        </tr>
      </thead>
      <tbody>
        ${document.items
          .map(
            (item, index) => `
          <tr>
            <td class="col-sno">${index + 1}</td>
            <td class="col-hsn">${item.hsnSacSnapshot}</td>
            <td class="col-desc">${item.descriptionSnapshot}${item.partNumberSnapshot ? ` (${item.partNumberSnapshot})` : ""}</td>
            <td class="col-qty">${item.quantity}</td>
            <td class="col-rate">${formatPaise(item.unitPrice)}</td>
            <td class="col-taxable">${formatPaise(item.taxableValue)}</td>
            <td class="col-cgst">${item.taxConfigurationSnapshot === "CGST_SGST" ? formatPaise((item.taxAmount / 2) as Paise) : "-"}</td>
            <td class="col-sgst">${item.taxConfigurationSnapshot === "CGST_SGST" ? formatPaise((item.taxAmount / 2) as Paise) : "-"}</td>
            <td class="col-total">${formatPaise(item.lineTotal)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- Tax Summary -->
    <div class="tax-summary">
      <table class="tax-table">
        <thead>
          <tr>
            <th>Tax Rate</th>
            <th>Taxable Value</th>
            <th>CGST</th>
            <th>SGST</th>
            <th>IGST</th>
            <th>Total Tax</th>
          </tr>
        </thead>
        <tbody>
          ${document.taxLines
            .map(
              (line) => `
            <tr>
              <td>${line.taxRateBp / 100}%</td>
              <td>${formatPaise(line.taxableValue)}</td>
              <td>${line.taxType === "CGST" ? formatPaise(line.taxAmount) : "-"}</td>
              <td>${line.taxType === "SGST" ? formatPaise(line.taxAmount) : "-"}</td>
              <td>${line.taxType === "IGST" ? formatPaise(line.taxAmount) : "-"}</td>
              <td>${formatPaise(line.taxAmount)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Financial Summary -->
    <div class="financial-summary">
      <div class="summary-row"><span>Total Taxable Value</span><span>${formatPaise(document.taxableTotal)}</span></div>
      <div class="summary-row"><span>Total CGST</span><span>${formatPaise(document.taxLines.filter(l => l.taxType === "CGST").reduce((a, b) => a + b.taxAmount, 0) as Paise)}</span></div>
      <div class="summary-row"><span>Total SGST</span><span>${formatPaise(document.taxLines.filter(l => l.taxType === "SGST").reduce((a, b) => a + b.taxAmount, 0) as Paise)}</span></div>
      <div class="summary-row"><span>Total IGST</span><span>${formatPaise(document.taxLines.filter(l => l.taxType === "IGST").reduce((a, b) => a + b.taxAmount, 0) as Paise)}</span></div>
      <div class="summary-row"><span>Total Tax</span><span>${formatPaise(document.taxTotal)}</span></div>
      <div class="summary-row round-off"><span>Round Off</span><span>${formatPaise((document.grandTotal - document.taxableTotal - document.taxTotal) as Paise)}</span></div>
      <div class="summary-row grand-total"><span>Grand Total</span><span>${formatPaise(document.grandTotal)}</span></div>
    </div>

    <!-- Amount in Words -->
    <div class="amount-words">
      <p><strong>Amount in Words:</strong> ${amountInWords(document.grandTotal)}</p>
    </div>

    <!-- Footer -->
    <footer class="document-footer">
      <div class="bank-details">
        <h4>Bank Details</h4>
        <p>${settings.bankDetails?.bankName || ""}</p>
        <p>A/c: ${settings.bankDetails?.accountNumber || ""} | IFSC: ${settings.bankDetails?.ifscCode || ""}</p>
        <p>Branch: ${settings.bankDetails?.branch || ""}</p>
      </div>
      <div class="declaration">
        <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
      </div>
      <div class="signatures">
        <div class="signature-block">
          <p>Authorized Signatory</p>
          ${settings.signatureUrl ? `<img src="${settings.signatureUrl}" alt="Signature" class="signature-img">` : ""}
        </div>
        <div class="signature-block">
          <p>Receiver's Signature</p>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>
  `;
}

function renderLabourBillTemplate(document: Document): string {
  // Simplified - will be expanded with actual template
  return getBaseTemplate("Labour Bill", document, document.items);
}

function renderRepairEstimateTemplate(document: Document): string {
  // Simplified - will be expanded with actual template
  return getBaseTemplate("Repair Estimate", document, document.items);
}

function renderInsuranceClaimTemplate(document: Document): string {
  // Simplified - will be expanded with actual template
  return getBaseTemplate("Insurance Claim", document, document.items);
}

function renderSimpleEstimateTemplate(document: Document): string {
  // Simplified - will be expanded with actual template
  return getBaseTemplate("Estimation", document, document.items);
}

function getBaseTemplate(title: string, document: Document, items: Document["items"]): string {
  const settings = document.workshopSettings || getDefaultSettings();
  const customer = document.customer;
  const vehicle = document.vehicle;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${getFullNumber(document)}</title>
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="page">
    <header class="workshop-header">
      <h1 class="workshop-name">${settings.workshopName}</h1>
      <p>${settings.address}</p>
      <p>Ph: ${settings.phone} | GSTIN: ${settings.gstin}</p>
      <h2 class="document-title">${title.toUpperCase()}</h2>
    </header>

    <div class="info-grid">
      <div><strong>No:</strong> ${getFullNumber(document)}</div>
      <div><strong>Date:</strong> ${formatDate(document.documentDate)}</div>
      <div><strong>Customer:</strong> ${customer?.name || ""}</div>
      <div><strong>Mobile:</strong> ${customer?.phone || ""}</div>
      <div><strong>Vehicle:</strong> ${vehicle?.registrationNo || ""}</div>
      <div><strong>Make/Model:</strong> ${vehicle?.manufacturer || ""} ${vehicle?.model || ""}</div>
      <div><strong>Kms:</strong> ${vehicle?.odometerReading || ""}</div>
    </div>

    <table class="items-table">
      <thead>
        <tr><th>S.No</th><th>Particulars</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.descriptionSnapshot}</td>
            <td>${item.quantity}</td>
            <td>${formatPaise(item.unitPrice)}</td>
            <td>${formatPaise(item.lineTotal)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row"><span>Total</span><span>${formatPaise(document.grandTotal)}</span></div>
      ${document.amountPaid > 0 ? `<div class="total-row"><span>Advance Paid</span><span>${formatPaise(document.amountPaid)}</span></div>` : ""}
      <div class="total-row balance"><span>Balance Due</span><span>${formatPaise(document.balanceDue)}</span></div>
    </div>

    <footer class="document-footer">
      <div class="bank-details">
        <p>${settings.bankDetails?.bankName || ""} | A/c: ${settings.bankDetails?.accountNumber || ""}</p>
        <p>IFSC: ${settings.bankDetails?.ifscCode || ""}</p>
      </div>
      <div class="signatures">
        <div>Authorized Signatory</div>
        <div>Customer Signature</div>
      </div>
    </footer>
  </div>
</body>
</html>
  `;
}

// ============================================
// STYLES
// ============================================

function getTaxInvoiceStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10px; line-height: 1.4; color: #000; }
    .page { width: 210mm; min-height: 297mm; padding: 8mm; }
    .workshop-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 8px; }
    .workshop-name { font-size: 18px; font-weight: bold; margin: 0; }
    .workshop-address { font-size: 9px; margin: 2px 0; }
    .workshop-contact, .workshop-gstin { font-size: 8px; margin: 1px 0; }
    .invoice-title { font-size: 16px; font-weight: bold; background: #f0f0f0; padding: 4px 12px; border: 1px solid #000; }
    .info-grid, .invoice-info-grid, .party-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
    .info-block label, .party-block h3 { font-size: 8px; font-weight: bold; text-transform: uppercase; }
    .info-block span { font-size: 10px; }
    .party-block { border: 1px solid #000; padding: 6px; }
    .party-block h3 { border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px; }
    .vehicle-info { border: 1px solid #000; padding: 6px; margin-bottom: 10px; font-size: 9px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9px; }
    .items-table th, .items-table td { border: 1px solid #000; padding: 4px; text-align: center; }
    .items-table th { background: #f0f0f0; font-weight: bold; }
    .col-desc { text-align: left; padding-left: 6px !important; }
    .tax-summary { margin-bottom: 10px; }
    .tax-table { width: 100%; border-collapse: collapse; font-size: 9px; }
    .tax-table th, .tax-table td { border: 1px solid #000; padding: 4px; text-align: center; }
    .tax-table th { background: #f0f0f0; }
    .financial-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; margin-bottom: 10px; font-size: 10px; }
    .summary-row { display: flex; justify-content: space-between; padding: 3px 8px; border: 1px solid #000; }
    .summary-row.grand-total { font-weight: bold; font-size: 11px; background: #f0f0f0; }
    .amount-words { border: 1px solid #000; padding: 8px; margin-bottom: 10px; font-size: 10px; }
    .document-footer { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; font-size: 9px; }
    .bank-details h4 { font-size: 9px; margin-bottom: 4px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
    .signature-block { text-align: center; }
    .signature-img { max-height: 40px; margin-top: 20px; }
  `;
}

function getBaseStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10px; line-height: 1.4; color: #000; }
    .page { width: 210mm; min-height: 297mm; padding: 10mm; }
    .workshop-header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .workshop-name { font-size: 18px; font-weight: bold; }
    .document-title { font-size: 16px; font-weight: bold; margin-top: 8px; }
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 15px; font-size: 10px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px; }
    .items-table th, .items-table td { border: 1px solid #000; padding: 6px; text-align: center; }
    .items-table th { background: #f0f0f0; }
    .items-table td:nth-child(2) { text-align: left; }
    .total-section { text-align: right; margin-bottom: 20px; }
    .total-row { display: inline-block; margin-left: 20px; padding: 4px 12px; border: 1px solid #000; }
    .total-row.balance { font-weight: bold; background: #f0f0f0; }
    .document-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; font-size: 9px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
  `;
}

function getDefaultSettings() {
  return {
    workshopName: "ORBENYX WORKSHOP",
    address: "Workshop Address",
    phone: "1234567890",
    email: "info@orbenyx.com",
    gstin: "33AAAAA0000A1Z5",
    stateCode: "33",
    bankDetails: {
      bankName: "Bank Name",
      accountName: "Account Name",
      accountNumber: "0000000000",
      ifscCode: "BANK0000000",
      branch: "Branch Name",
    },
    signatureUrl: "",
    logoUrl: "",
  };
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, " ");
}