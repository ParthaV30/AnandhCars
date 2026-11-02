"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Download, Calendar, BarChart3, FileText, TrendingUp, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

const reportTypes = [
  { id: "billing", name: "Billing Report", description: "Summary of all invoices and estimates", icon: FileText },
  { id: "payments", name: "Payments Report", description: "Detailed payment collection report", icon: TrendingUp },
  { id: "outstanding", name: "Outstanding Report", description: "Pending payments and ageing analysis", icon: TrendingUp },
  { id: "customer", name: "Customer Report", description: "Customer-wise billing summary", icon: FileText },
  { id: "vehicle", name: "Vehicle Report", description: "Vehicle-wise service history", icon: FileText },
];

const mockBillingData = [
  { type: "TAX_INVOICE", count: 45, taxable: 125000000, tax: 22500000, total: 147500000 },
  { type: "LABOUR_BILL", count: 32, taxable: 0, tax: 0, total: 85000000 },
  { type: "REPAIR_ESTIMATE", count: 18, taxable: 95000000, tax: 17100000, total: 112100000 },
  { type: "INSURANCE_CLAIM", count: 12, taxable: 68000000, tax: 12240000, total: 80240000 },
  { type: "SIMPLE_ESTIMATE", count: 25, taxable: 0, tax: 0, total: 35000000 },
];

const mockOutstandingData = [
  { customer: "New India Assurance", docNo: "INV/2026-27/0045", date: "2026-10-30", dueDate: "2026-11-15", amount: 8500000, days: 5 },
  { customer: "SLNP Silks", docNo: "LAB/2026-27/0023", date: "2026-10-30", dueDate: "2026-11-15", amount: 6500000, days: 5 },
  { customer: "United India Insurance", docNo: "INV/2026-27/0042", date: "2026-10-25", dueDate: "2026-11-10", amount: 10000000, days: 10 },
  { customer: "Mahindra Service", docNo: "QUO/2026-27/0067", date: "2026-10-28", dueDate: "2026-11-13", amount: 2200000, days: 2 },
];

const formatAmount = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("billing");
  const [dateFrom, setDateFrom] = useState(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  const report = reportTypes.find((r) => r.id === activeReport)!;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
            <p className="text-[var(--text-secondary)]">Generate and export business reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              Export Current
            </Button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <Card>
          <CardBody className="p-2">
            <Tabs defaultValue="billing" onChange={setActiveReport} variant="pills" className="w-full">
              <TabsList className="w-full" aria-label="Report types">
                {reportTypes.map((rt) => (
                  <TabsTrigger key={rt.id} value={rt.id} className="flex-1 justify-center">
                    <rt.icon className="w-4 h-4" aria-hidden="true" />
                    {rt.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardBody>
        </Card>

        {/* Date Range Filter */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">From</label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full max-w-xs" leftIcon={<Calendar className="w-5 h-5" />} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">To</label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full max-w-xs" leftIcon={<Calendar className="w-5 h-5" />} />
                </div>
              </div>
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                Export Report
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Report Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>{report.name}</CardTitle>
                <p className="text-sm text-[var(--text-secondary)]">{report.description}</p>
              </div>
              <Badge variant="info">Period: {dateFrom} to {dateTo}</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {activeReport === "billing" && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Taxable Value</TableHead>
                      <TableHead className="text-right">Tax Amount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBillingData.map((row) => (
                      <TableRow key={row.type}>
                        <TableCell className="font-medium">{row.type.replace("_", " ")}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{formatAmount(row.taxable)}</TableCell>
                        <TableCell className="text-right">{formatAmount(row.tax)}</TableCell>
                        <TableCell className="text-right font-medium">{formatAmount(row.total)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-[var(--bg-tertiary)] font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{mockBillingData.reduce((a, b) => a + b.count, 0)}</TableCell>
                      <TableCell className="text-right">{formatAmount(mockBillingData.reduce((a, b) => a + b.taxable, 0))}</TableCell>
                      <TableCell className="text-right">{formatAmount(mockBillingData.reduce((a, b) => a + b.tax, 0))}</TableCell>
                      <TableCell className="text-right">{formatAmount(mockBillingData.reduce((a, b) => a + b.total, 0))}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {activeReport === "outstanding" && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOutstandingData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.customer}</TableCell>
                        <TableCell className="font-mono">{row.docNo}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.dueDate}</TableCell>
                        <TableCell className="text-right font-medium">{formatAmount(row.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={row.days > 30 ? "error" : row.days > 15 ? "warning" : "info"}>
                            {row.days} days
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {(activeReport === "payments" || activeReport === "customer" || activeReport === "vehicle") && (
              <div className="empty-state py-16">
                <BarChart3 className="w-16 h-16 text-[var(--text-muted)]" />
                <h3 className="empty-state-title">{report.name}</h3>
                <p className="empty-state-description">Detailed view coming soon. Configure date range and filters to generate this report.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}