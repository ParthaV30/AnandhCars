"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Search, CreditCard, DollarSign, Calendar, Banknote, Landmark, Smartphone, Building2, FileText, HelpCircle } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const mockPayments = [
  { id: "1", docNo: "INV/2026-27/0045", customer: "New India Assurance", date: "2026-10-30", amount: 5000000, method: "BANK_TRANSFER", ref: "NEFT123456", status: "COMPLETED" },
  { id: "2", docNo: "LAB/2026-27/0023", customer: "SLNP Silks", date: "2026-10-30", amount: 6000000, method: "CASH", ref: "", status: "COMPLETED" },
  { id: "3", docNo: "INV/2026-27/0042", customer: "United India Insurance", date: "2026-10-29", amount: 10000000, method: "UPI", ref: "UPI789012", status: "COMPLETED" },
  { id: "4", docNo: "CLM/2026-27/0005", customer: "United India Insurance", date: "2026-10-28", amount: 18000000, method: "CHEQUE", ref: "CHQ345678", status: "PENDING" },
];

const methods = ["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"];
const methodIcons: Record<string, React.ReactNode> = {
  CASH: <Banknote className="w-4 h-4" />,
  CARD: <CreditCard className="w-4 h-4" />,
  UPI: <Smartphone className="w-4 h-4" />,
  BANK_TRANSFER: <Landmark className="w-4 h-4" />,
  CHEQUE: <FileText className="w-4 h-4" />,
  OTHER: <HelpCircle className="w-4 h-4" />,
};

const documents = [
  { id: "1", number: "INV/2026-27/0045", customer: "New India Assurance", balance: 3500000 },
  { id: "2", number: "LAB/2026-27/0023", customer: "SLNP Silks", balance: 6500000 },
  { id: "3", number: "INV/2026-27/0042", customer: "United India Insurance", balance: 0 },
];

const formatAmount = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    documentId: "", date: new Date().toISOString().split("T")[0], amount: "", method: "CASH", ref: "", notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    // In real app, call API to save
  };

  const filteredPayments = mockPayments.filter((p) =>
    (p.docNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ref.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (methodFilter === "" || p.method === methodFilter)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payments</h1>
            <p className="text-[var(--text-secondary)]">Record and track payments against documents</p>
          </div>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Record Payment
          </Button>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search payments by document, customer, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md flex-1"
                leftIcon={<Search className="w-5 h-5" />}
              />
              <Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                options={[{ value: "", label: "All Methods" }, ...methods.map((m) => ({ value: m, label: m }))]}
                placeholder="Filter by method"
                className="max-w-xs"
              />
            </div>
          </CardBody>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Payments</CardTitle>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                {filteredPayments.length} of {mockPayments.length} payments
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {filteredPayments.length === 0 ? (
              <div className="empty-state">
                <CreditCard className="empty-state-icon" />
                <h3 className="empty-state-title">No payments found</h3>
                <p className="empty-state-description">
                  {searchQuery || methodFilter ? "Try adjusting your filters or search query" : "Record your first payment to get started"}
                </p>
                <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />} className="mt-4">
                  Record Payment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment, index) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm text-[var(--text-muted)]">#{index + 1}</TableCell>
                        <TableCell className="font-mono">{payment.docNo}</TableCell>
                        <TableCell>{payment.customer}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="text-right font-medium text-[var(--text-primary)]">{formatAmount(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="info" className="gap-1">
                            {methodIcons[payment.method]}
                            {payment.method.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{payment.ref || <span className="text-[var(--text-muted)]">—</span>}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "COMPLETED" ? "success" : "warning"}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Record Payment Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Record Payment"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Document *"
              value={formData.documentId}
              onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
              options={documents.map((d) => ({ value: d.id, label: `${d.number} - ${d.customer} (Balance: ${formatAmount(d.balance)})` }))}
              placeholder="Select document"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Date *" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              <Input label="Amount (₹) *" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Method *" value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })} options={methods.map((m) => ({ value: m, label: m }))} placeholder="Select method" required />
              <Input label="Reference No" value={formData.ref} onChange={(e) => setFormData({ ...formData, ref: e.target.value })} placeholder="Transaction/cheque number" />
            </div>
            <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" />
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Record Payment</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}