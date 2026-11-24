"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Printer, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface DocumentData {
  id: string;
  documentNumber: string;
  fullNumber?: string;
  documentType: string;
  documentDate: string;
  status: string;
  customer?: {
    name: string;
    phone?: string;
    address?: string;
    gstin?: string;
  };
  vehicle?: {
    registrationNo: string;
    manufacturer?: string;
    model?: string;
    kms?: string;
  };
  items: Array<{
    id: string;
    description: string;
    partNumber?: string;
    hsnSacCode?: string;
    quantity: number;
    unitPrice: number;
    taxableAmount?: number;
    totalAmount?: number;
    gstRateBp?: number;
    section?: string;
  }>;
  totalAmount: number;
  taxableAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  roundOff?: number;
  advanceAmount?: number;
  balanceDue?: number;
  jobCardNo?: string;
  preparedBy?: string;
  policyNumber?: string;
  insurerName?: string;
  workshopSettings?: {
    workshopName: string;
    address?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    stateCode?: string;
    bankDetails?: string;
  };
}

const DOCUMENT_TITLES: Record<string, string> = {
  TAX_INVOICE: "TAX INVOICE",
  LABOUR_BILL: "INVOICE / LABOUR BILL",
  REPAIR_ESTIMATE: "ESTIMATION / JOB CARD",
  INSURANCE_CLAIM: "CLAIM INTIMATION",
  SIMPLE_ESTIMATE: "QUOTATION / ESTIMATION",
};

export default function DocumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocument() {
      try {
        const res = await fetch(`/api/documents/${id}`);
        if (res.ok) {
          const json = await res.json();
          setDoc(json.data);
          return;
        }
      } catch (e) {
        console.warn("API load failed, checking localStorage fallback", e);
      }

      // Check localStorage fallback
      if (typeof window !== "undefined") {
        const local = localStorage.getItem(`doc_${id}`);
        if (local) {
          try {
            setDoc(JSON.parse(local));
            setLoading(false);
            return;
          } catch {
            // ignore
          }
        }
      }

      // Mock sample fallback if not found
      setDoc({
        id,
        documentNumber: `INV/2026-27/0045`,
        fullNumber: `INV/2026-27/0045`,
        documentType: "TAX_INVOICE",
        documentDate: new Date().toISOString().split("T")[0],
        status: "ISSUED",
        customer: {
          name: "New India Assurance Co Ltd",
          phone: "9876543210",
          address: "Mount Road, Chennai, Tamil Nadu - 600002",
          gstin: "33AAACN4165C4ZV",
        },
        vehicle: {
          registrationNo: "PY 01 DF 8282",
          manufacturer: "VOLVO",
          model: "XC 60",
          kms: "68077",
        },
        items: [
          {
            id: "1",
            section: "PARTS",
            description: "Condenser Assy with Receiver Drier",
            partNumber: "31368082",
            hsnSacCode: "8708",
            quantity: 1,
            unitPrice: 4500000,
            taxableAmount: 4500000,
            gstRateBp: 1800,
            totalAmount: 5310000,
          },
          {
            id: "2",
            section: "PARTS",
            description: "AC Gas R134a Filling & Leak Test",
            partNumber: "R134A",
            hsnSacCode: "8708",
            quantity: 1,
            unitPrice: 250000,
            taxableAmount: 250000,
            gstRateBp: 1800,
            totalAmount: 295000,
          },
          {
            id: "3",
            section: "LABOUR",
            description: "Cooling Coil & Condenser Replacement Labour",
            partNumber: "",
            hsnSacCode: "9987",
            quantity: 1,
            unitPrice: 1500000,
            taxableAmount: 1500000,
            gstRateBp: 1800,
            totalAmount: 1770000,
          },
        ],
        taxableAmount: 6250000,
        cgstAmount: 562500,
        sgstAmount: 562500,
        roundOff: 0,
        totalAmount: 7375000,
        preparedBy: "Parthasarathi",
        workshopSettings: {
          workshopName: "SMART CAR AC WORKS",
          address: "No. 12, Kalapatti Main Road, Sitra, Coimbatore - 641014",
          phone: "98422 12345 / 0422-2626262",
          email: "smartcaracworks@gmail.com",
          gstin: "33AAACO1234B1Z5",
          stateCode: "33",
        },
      });
      setLoading(false);
    }

    loadDocument();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-[var(--text-muted)] font-medium">
          Loading document...
        </div>
      </DashboardLayout>
    );
  }

  if (!doc) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center">
          <p className="text-error font-medium mb-4">Document not found.</p>
          <Button onClick={() => router.push("/documents")}>
            Back to Documents
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isTax = doc.documentType === "TAX_INVOICE";
  const subtotal = (doc.taxableAmount || 0) / 100;
  const cgst = (doc.cgstAmount || 0) / 100;
  const sgst = (doc.sgstAmount || 0) / 100;
  const total = (doc.totalAmount || 0) / 100;
  const advance = (doc.advanceAmount || 0) / 100;
  const balance = (doc.balanceDue || Math.max(0, doc.totalAmount - (doc.advanceAmount || 0))) / 100;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Action Bar (hidden in print) */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/documents")}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              All Documents
            </Button>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>{doc.fullNumber || doc.documentNumber}</span>
                <Badge variant={doc.status === "ISSUED" ? "success" : "neutral"} size="sm">
                  {doc.status}
                </Badge>
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {DOCUMENT_TITLES[doc.documentType] || doc.documentType} • Date: {doc.documentDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Document link copied!");
              }}
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-lg border border-neutral-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto print:max-w-none">
          {/* Header */}
          <div className="border-b-2 border-neutral-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-neutral-900 font-serif">
                  {doc.workshopSettings?.workshopName || "SMART CAR AC WORKS"}
                </h2>
                <p className="text-xs text-neutral-600 mt-1 max-w-md">
                  {doc.workshopSettings?.address || "No.: 88, K.R.N Complex, Nehru Nagar, 2nd Bus Stop, Kalapatti Road, Coimbatore - 641 014."}
                </p>
                <p className="text-xs text-neutral-600">
                  Phone: {doc.workshopSettings?.phone || "98944 88847"} | Email: {doc.workshopSettings?.email || "smartcaracs@gmail.com"}
                </p>
                <p className="text-xs font-bold text-neutral-800 mt-0.5">
                  GSTIN: {doc.workshopSettings?.gstin || "33ANLPN0999B1ZX"} | State: Tamil Nadu (33)
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-neutral-100 border border-neutral-300 font-bold text-sm tracking-wider uppercase">
                  {DOCUMENT_TITLES[doc.documentType] || "DOCUMENT"}
                </div>
                <p className="font-mono font-bold text-neutral-900 mt-2 text-base">
                  {doc.fullNumber || doc.documentNumber}
                </p>
                <p className="text-xs text-neutral-600">
                  Date: <span className="font-medium text-neutral-900">{doc.documentDate}</span>
                </p>
                {doc.jobCardNo && (
                  <p className="text-xs text-neutral-600">
                    Job Card / Est: <span className="font-medium text-neutral-900">{doc.jobCardNo}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Party and Vehicle Details */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs border border-neutral-300 p-4 rounded">
            <div>
              <p className="font-bold text-neutral-700 uppercase tracking-wide mb-1 border-b pb-0.5">
                Billed To (Customer / Insurer):
              </p>
              <p className="font-bold text-sm text-neutral-900">{doc.customer?.name || "Cash Customer"}</p>
              {doc.customer?.address && <p className="text-neutral-600 mt-0.5">{doc.customer.address}</p>}
              {doc.customer?.phone && <p className="text-neutral-600">Phone: {doc.customer.phone}</p>}
              {doc.customer?.gstin && <p className="font-semibold text-neutral-800">GSTIN: {doc.customer.gstin}</p>}
            </div>
            <div>
              <p className="font-bold text-neutral-700 uppercase tracking-wide mb-1 border-b pb-0.5">
                Vehicle Details:
              </p>
              <p className="font-mono font-bold text-sm text-neutral-900">{doc.vehicle?.registrationNo || "—"}</p>
              <p className="text-neutral-600">
                Make & Model: <span className="font-medium text-neutral-800">{doc.vehicle?.manufacturer || ""} {doc.vehicle?.model || ""}</span>
              </p>
              {doc.vehicle?.kms && (
                <p className="text-neutral-600">
                  KM Reading: <span className="font-medium text-neutral-800">{doc.vehicle.kms} km</span>
                </p>
              )}
              {doc.preparedBy && (
                <p className="text-neutral-600">
                  Prepared By: <span className="font-medium text-neutral-800">{doc.preparedBy}</span>
                </p>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-neutral-100 border-y border-neutral-300 font-bold text-neutral-800">
                <th className="py-2 px-2 text-left w-8">#</th>
                <th className="py-2 px-2 text-left">Description of Goods / Services</th>
                <th className="py-2 px-2 text-left w-24">Part No.</th>
                <th className="py-2 px-2 text-left w-20">HSN/SAC</th>
                <th className="py-2 px-2 text-right w-12">Qty</th>
                <th className="py-2 px-2 text-right w-24">Rate (₹)</th>
                {isTax && <th className="py-2 px-2 text-center w-16">GST %</th>}
                <th className="py-2 px-2 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {doc.items.map((item, index) => {
                const itemRate = item.unitPrice / 100;
                const itemTotal = (item.totalAmount || item.quantity * item.unitPrice) / 100;
                return (
                  <tr key={item.id || index} className="align-top">
                    <td className="py-2 px-2 text-neutral-500 font-mono">{index + 1}</td>
                    <td className="py-2 px-2 font-medium text-neutral-900">
                      {item.description}
                      {item.section && (
                        <span className="text-[10px] text-neutral-500 block uppercase">
                          [{item.section}]
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-neutral-600 font-mono">{item.partNumber || "—"}</td>
                    <td className="py-2 px-2 text-neutral-600 font-mono">{item.hsnSacCode || "—"}</td>
                    <td className="py-2 px-2 text-right font-medium">{item.quantity}</td>
                    <td className="py-2 px-2 text-right font-mono">₹{itemRate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    {isTax && (
                      <td className="py-2 px-2 text-center font-mono">
                        {((item.gstRateBp || 1800) / 100)}%
                      </td>
                    )}
                    <td className="py-2 px-2 text-right font-mono font-medium">
                      ₹{itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary / Calculation Box */}
          <div className="grid grid-cols-2 gap-6 pt-2 mb-8 border-t border-neutral-300 text-xs">
            {/* Bank details & Terms */}
            <div className="space-y-2">
              <div className="border border-neutral-200 p-2.5 rounded bg-neutral-50">
                <p className="font-bold text-neutral-800 uppercase tracking-wider mb-1">
                  Bank & Payment Details:
                </p>
                <p className="text-neutral-700">Bank: <span className="font-medium">Karur Vysya Bank (KVB) / Canara Bank</span></p>
                <p className="text-neutral-700">Account: <span className="font-medium">12340500123456</span></p>
                <p className="text-neutral-700">IFSC: <span className="font-medium">KVBL0001234</span></p>
                <p className="text-neutral-700">Google Pay / UPI: <span className="font-medium">9842212345@upi</span></p>
              </div>
              <p className="text-[10px] text-neutral-500 italic">
                Declaration: We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
              </p>
            </div>

            {/* Totals */}
            <div className="space-y-1 font-mono text-right">
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-600">Taxable Subtotal:</span>
                <span className="font-medium">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              {isTax && (
                <>
                  <div className="flex justify-between py-1 border-b border-neutral-200">
                    <span className="text-neutral-600">CGST (9%):</span>
                    <span className="font-medium">₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200">
                    <span className="text-neutral-600">SGST (9%):</span>
                    <span className="font-medium">₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              {doc.roundOff !== undefined && doc.roundOff !== 0 && (
                <div className="flex justify-between py-1 border-b border-neutral-200 text-neutral-600">
                  <span>Round Off:</span>
                  <span>{doc.roundOff > 0 ? `+₹${doc.roundOff / 100}` : `-₹${Math.abs(doc.roundOff / 100)}`}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-sm font-bold text-neutral-900 border-b-2 border-neutral-900">
                <span>Grand Total:</span>
                <span className="text-base">₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              {doc.documentType === "LABOUR_BILL" && (
                <>
                  <div className="flex justify-between py-1 text-neutral-700">
                    <span>Advance Received:</span>
                    <span>₹{advance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-red-600 text-sm">
                    <span>Balance Due:</span>
                    <span>₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bank Details Block */}
          <div className="border border-neutral-300 rounded p-3 my-4 text-xs bg-neutral-50/50">
            <p className="font-bold text-neutral-800 uppercase tracking-wider text-[11px] mb-1">
              Bank Details & Payment Information:
            </p>
            {doc.documentType === "LABOUR_BILL" ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-700">
                <div><span className="font-semibold">Bank:</span> CANARA BANK</div>
                <div><span className="font-semibold">A/C No.:</span> 2988201002428</div>
                <div><span className="font-semibold">IFSC:</span> CNRB0002988</div>
                <div><span className="font-semibold text-emerald-700 font-bold">G-Pay:</span> 98944 88847</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-700">
                <div><span className="font-semibold">Bank:</span> KARUR VYSYA BANK</div>
                <div><span className="font-semibold">A/C No.:</span> 1662135000004834</div>
                <div><span className="font-semibold">IFSC:</span> KVBL0001662</div>
                <div><span className="font-semibold">Branch:</span> NEHRU NAGAR</div>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-12 text-xs">
            <div>
              <p className="border-t border-neutral-400 pt-1 w-44 text-center text-neutral-600">
                Customer Signature
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-neutral-900 mb-10">
                For {doc.workshopSettings?.workshopName || "SMART CAR AC WORKS"}
              </p>
              <p className="border-t border-neutral-400 pt-1 w-44 text-neutral-600">
                Authorised Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
