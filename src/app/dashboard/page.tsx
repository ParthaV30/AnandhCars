"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Plus, Users, Car, FileText, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface StatCardProps {
  name: string;
  value: string;
  change: string;
  icon: React.ElementType;
  variant: "primary" | "success" | "warning" | "error" | "info" | "neutral";
  trend: "up" | "down" | "neutral";
}

const stats: StatCardProps[] = [
  {
    name: "Documents Today",
    value: "12",
    change: "+3 from yesterday",
    icon: FileText,
    variant: "primary",
    trend: "up",
  },
  {
    name: "Invoices Issued",
    value: "8",
    change: "+2 from yesterday",
    icon: FileText,
    variant: "success",
    trend: "up",
  },
  {
    name: "Total Invoiced",
    value: "₹2,45,600",
    change: "+12% vs last week",
    icon: TrendingUp,
    variant: "info",
    trend: "up",
  },
  {
    name: "Payments Received",
    value: "₹1,80,000",
    change: "+5% vs last week",
    icon: CreditCard,
    variant: "success",
    trend: "up",
  },
  {
    name: "Outstanding",
    value: "₹3,25,400",
    change: "5 invoices pending",
    icon: AlertTriangle,
    variant: "warning",
    trend: "down",
  },
  {
    name: "Estimates Pending",
    value: "3",
    change: "2 approved today",
    icon: Clock,
    variant: "info",
    trend: "up",
  },
];

const variantStyles: Record<string, string> = {
  primary: "bg-primary-light text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
  success: "bg-success-light text-success-700 dark:bg-success-900/30 dark:text-success-300",
  warning: "bg-warning-light text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
  error: "bg-error-light text-error-700 dark:bg-error-900/30 dark:text-error-300",
  info: "bg-primary-light text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
};

const quickActions = [
  { name: "New Tax Invoice", href: "/documents/new?type=TAX_INVOICE", icon: FileText, variant: "primary" },
  { name: "New Labour Bill", href: "/documents/new?type=LABOUR_BILL", icon: FileText, variant: "success" },
  { name: "New Repair Estimate", href: "/documents/new?type=REPAIR_ESTIMATE", icon: FileText, variant: "info" },
  { name: "New Insurance Claim", href: "/documents/new?type=INSURANCE_CLAIM", icon: FileText, variant: "warning" },
  { name: "New Simple Estimate", href: "/documents/new?type=SIMPLE_ESTIMATE", icon: FileText, variant: "neutral" },
  { name: "Add Customer", href: "/customers/new", icon: Users, variant: "primary" },
  { name: "Add Vehicle", href: "/vehicles/new", icon: Car, variant: "info" },
  { name: "Record Payment", href: "/payments/new", icon: CreditCard, variant: "success" },
];

const recentActivity = [
  { docNo: "INV/2026-27/0045", customer: "New India Assurance", vehicle: "TN 01 AB 1234", type: "Tax Invoice", date: "2026-10-30", amount: "₹85,000", status: "ISSUED" },
  { docNo: "LAB/2026-27/0023", customer: "SLNP Silks", vehicle: "TN 40 AA 5333", type: "Labour Bill", date: "2026-10-30", amount: "₹1,25,000", status: "PARTIALLY_PAID" },
  { docNo: "EST/2026-27/0012", customer: "Leela Krishnan", vehicle: "TN 38 CW 8176", type: "Repair Estimate", date: "2026-10-29", amount: "₹2,45,000", status: "DRAFT" },
  { docNo: "CLM/2026-27/0005", customer: "United India Insurance", vehicle: "TN 28 BY 8622", type: "Insurance Claim", date: "2026-10-29", amount: "₹1,80,000", status: "ISSUED" },
  { docNo: "QUO/2026-27/0067", customer: "Mahindra Service", vehicle: "TN 28 BY 8622", type: "Simple Estimate", date: "2026-10-28", amount: "₹22,000", status: "DRAFT" },
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

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-[var(--text-secondary)]">Overview of your workshop billing activity</p>
          </div>
          <div className="flex gap-2">
            <Link href="/reports">
              <Button variant="outline">View Reports</Button>
            </Link>
            <Link href="/documents/new?type=TAX_INVOICE">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-auto-fit">
          {stats.map((stat) => (
            <Card key={stat.name} className="stat-card">
              <CardBody className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-secondary)] truncate">{stat.name}</p>
                    <p className="stat-value mt-1">{stat.value}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{stat.change}</p>
                  </div>
                  <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", variantStyles[stat.variant])}>
                    <stat.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                </div>
                <div className={clsx("mt-3 flex items-center gap-1 text-xs", stat.trend === "up" ? "text-success" : stat.trend === "down" ? "text-error" : "text-[var(--text-muted)]")}>
                  {stat.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                  {stat.trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                  <span>{stat.change.split(" ")[0]}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid-auto-fit-lg">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <div className="grid grid-cols-2 gap-3 p-5">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={clsx(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border-primary)] hover:border-primary/50 hover:bg-[var(--bg-hover)] transition-all text-center group"
                    )}
                  >
                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform", variantStyles[action.variant])}>
                      <action.icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-primary transition-colors">{action.name}</span>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Link href="/documents">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity, index) => (
                    <TableRow key={activity.docNo}>
                      <TableCell className="font-mono text-sm text-[var(--text-muted)]">#{index + 1}</TableCell>
                      <TableCell>
                        <Link href={`/documents/${activity.docNo}`} className="font-medium text-primary hover:underline">
                          {activity.docNo}
                        </Link>
                      </TableCell>
                      <TableCell>{activity.customer}</TableCell>
                      <TableCell className="font-mono">{activity.vehicle}</TableCell>
                      <TableCell>
                        <Badge variant="info">{activity.type}</Badge>
                      </TableCell>
                      <TableCell>{activity.date}</TableCell>
                      <TableCell className="text-right font-medium text-[var(--text-primary)]">{activity.amount}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[activity.status] || "neutral"}>
                          {activity.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}