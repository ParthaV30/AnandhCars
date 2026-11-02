"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Plus, Search, FileText, Eye, Download, Printer, Edit, Trash2, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

const documentTypes = [
  { value: "TAX_INVOICE", label: "Tax Invoice", icon: FileText, color: "primary", prefix: "INV" },
  { value: "LABOUR_BILL", label: "Labour Bill", icon: FileText, color: "success", prefix: "LAB" },
  { value: "REPAIR_ESTIMATE", label: "Repair Estimate", icon: FileText, color: "info", prefix: "EST" },
  { value: "INSURANCE_CLAIM", label: "Insurance Claim", icon: FileText, color: "warning", prefix: "CLM" },
  { value: "SIMPLE_ESTIMATE", label: "Simple Estimate", icon: FileText, color: "neutral", prefix: "QUO" },
];

const variantColorMap: Record<string, "primary" | "success" | "warning" | "error" | "info" | "neutral"> = {
  primary: "primary",
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  neutral: "neutral",
};

const mockDocuments = [
  { id: "1", type: "TAX_INVOICE", number: "INV/2026-27/0045", customer: "New India Assurance", vehicle: "PY 01 DF 8282", date: "2026-10-30", amount: 8500000, status: "ISSUED" },
  { id: "2", type: "LABOUR_BILL", number: "LAB/2026-27/0023", customer: "SLNP Silks", vehicle: "TN 40 AA 5333", date: "2026-10-30", amount: 12500000, status: "PARTIALLY_PAID" },
  { id: "3", type: "REPAIR_ESTIMATE", number: "EST/2026-27/0012", customer: "Leela Krishnan", vehicle: "TN 38 CW 8176", date: "2026-10-29", amount: 24500000, status: "DRAFT" },
  { id: "4", type: "INSURANCE_CLAIM", number: "CLM/2026-27/0005", customer: "United India Insurance", vehicle: "TN 28 BY 8622", date: "2026-10-29", amount: 18000000, status: "ISSUED" },
  { id: "5", type: "SIMPLE_ESTIMATE", number: "QUO/2026-27/0067", customer: "Mahindra Service", vehicle: "TN 28 BY 8622", date: "2026-10-28", amount: 2200000, status: "DRAFT" },
];

const statusVariants: Record<string, "success" | "warning" | "neutral" | "error" | "info"> = {
  ISSUED: "success",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  DRAFT: "neutral",
  CANCELLED: "error",
  APPROVED: "success",
  REJECTED: "error",
};

const formatAmount = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

// Helper for current financial year
const FY = (() => {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${String(year + 1).slice(-2)}`;
})();

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState("TAX_INVOICE");

  const filteredDocuments = mockDocuments.filter((d) =>
    (d.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vehicle.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (typeFilter === "" || d.type === typeFilter) &&
    (statusFilter === "" || d.status === statusFilter)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Documents</h1>
            <p className="text-[var(--text-secondary)]">Create and manage all workshop documents</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            New Document
          </Button>
        </div>

        {/* Document Type Quick Actions */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-wrap gap-3">
              {documentTypes.map((dt) => (
                <Link
                  key={dt.value}
                  href={`/documents/new?type=${dt.value}`}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-150 text-sm font-medium",
                    "border-[var(--border-primary)] bg-transparent hover:bg-[var(--bg-hover)]",
                    selectedType === dt.value && "border-primary bg-primary/5 text-primary",
                    variantColorMap[dt.color]
                  )}
                  onClick={() => setSelectedType(dt.value)}
                >
                  <dt.icon className="w-4 h-4" aria-hidden="true" />
                  {dt.label}
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Filters */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md flex-1"
                leftIcon={<Search className="w-5 h-5" />}
              />
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[{ value: "", label: "All Types" }, ...documentTypes.map((dt) => ({ value: dt.value, label: dt.label }))]}
                placeholder="Filter by type"
                className="max-w-xs"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "", label: "All Status" },
                  { value: "DRAFT", label: "Draft" },
                  { value: "ISSUED", label: "Issued" },
                  { value: "PARTIALLY_PAID", label: "Partially Paid" },
                  { value: "PAID", label: "Paid" },
                  { value: "CANCELLED", label: "Cancelled" },
                ]}
                placeholder="Filter by status"
                className="max-w-xs"
              />
            </div>
          </CardBody>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Documents</CardTitle>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                {filteredDocuments.length} of {mockDocuments.length} documents
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {filteredDocuments.length === 0 ? (
              <div className="empty-state">
                <FileText className="empty-state-icon" />
                <h3 className="empty-state-title">No documents found</h3>
                <p className="empty-state-description">
                  {searchQuery || typeFilter || statusFilter
                    ? "Try adjusting your filters or search query"
                    : "Create your first document to get started"}
                </p>
                <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />} className="mt-4">
                  Create Document
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Document No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-48 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc, index) => {
                      const dt = documentTypes.find((t) => t.value === doc.type)!;
                      return (
                        <TableRow key={doc.id}>
                          <TableCell className="font-mono text-sm text-[var(--text-muted)]">#{index + 1}</TableCell>
                          <TableCell className="font-mono font-medium text-[var(--text-primary)]">{doc.number}</TableCell>
                          <TableCell>
                            <Badge variant={variantColorMap[dt.color] || "neutral"} className="gap-1">
                              <dt.icon className="w-3 h-3" aria-hidden="true" />
                              {dt.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{doc.customer}</TableCell>
                          <TableCell className="font-mono">{doc.vehicle}</TableCell>
                          <TableCell>{doc.date}</TableCell>
                          <TableCell className="text-right font-medium text-[var(--text-primary)]">{formatAmount(doc.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariants[doc.status] || "neutral"}>
                              {doc.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/documents/${doc.id}`}
                                className="btn-ghost btn-icon-sm"
                                aria-label="View document"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Button variant="ghost" size="icon-sm" aria-label="Download PDF">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" aria-label="Print">
                                <Printer className="w-4 h-4" />
                              </Button>
                              {doc.status === "DRAFT" && (
                                <Link
                                  href={`/documents/${doc.id}/edit`}
                                  className="btn-ghost btn-icon-sm"
                                  aria-label="Edit document"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Create Document Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Document"
          description="Choose a document type to get started"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Select Document Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {documentTypes.map((dt) => (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() => {
                      setSelectedType(dt.value);
                      setShowCreateModal(false);
                      window.location.href = `/documents/new?type=${dt.value}`;
                    }}
                    className={clsx(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      selectedType === dt.value
                        ? "border-primary bg-primary/5"
                        : "border-[var(--border-primary)] hover:border-primary/50 hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center mb-2", variantColorMap[dt.color])}>
                      <dt.icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="font-medium text-[var(--text-primary)]">{dt.label}</div>
                    <div className="text-xs text-[var(--text-muted)]">{dt.prefix}/{FY}/####</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--border-primary)]">
              <p className="text-sm text-[var(--text-muted)] text-center">
                Or go directly to the document creation page for more options.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}