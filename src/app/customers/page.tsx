"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Plus, Search, Edit, MoreHorizontal, UserPlus, Phone, Mail, MapPin, Hash, Trash2 } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const mockCustomers = [
  { id: "1", name: "New India Assurance Co Ltd", phone: "9876543210", email: "claims@newindia.com", address: "Chennai, Tamil Nadu", gstin: "33AAACN4165C4ZV", status: "active" },
  { id: "2", name: "SLNP Silks", phone: "9443322110", email: "accounts@slnpsilks.com", address: "Coimbatore, Tamil Nadu", gstin: "33AABCS1234D5Z6", status: "active" },
  { id: "3", name: "Leela Krishnan", phone: "9944201329", email: "leela.k@email.com", address: "No. 101, The Castle Periyar Nagar, Coimbatore", gstin: "", status: "active" },
  { id: "4", name: "United India Insurance", phone: "9840012345", email: "claims@unitedindia.com", address: "Chennai, Tamil Nadu", gstin: "33AAACU1234E1Z2", status: "active" },
  { id: "5", name: "Mahindra Service Center", phone: "9884455667", email: "service@mahindra.com", address: "Chennai, Tamil Nadu", gstin: "33AAACM5678F9Z3", status: "active" },
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<typeof mockCustomers[0] | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", gstin: "" });

  const handleEdit = (customer: typeof mockCustomers[0]) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, phone: customer.phone || "", email: customer.email || "", address: customer.address || "", gstin: customer.gstin || "" });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingCustomer(null);
    setFormData({ name: "", phone: "", email: "", address: "", gstin: "" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    // In real app, call API to save
  };

  const filteredCustomers = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.gstin?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Customers</h1>
            <p className="text-[var(--text-secondary)]">Manage customer records and view history</p>
          </div>
          <Button onClick={handleNew} leftIcon={<UserPlus className="w-4 h-4" />}>
            Add Customer
          </Button>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search customers by name, phone, or GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md flex-1"
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
          </CardBody>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Customers</CardTitle>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                {filteredCustomers.length} of {mockCustomers.length} customers
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <UserPlus className="empty-state-icon" />
                <h3 className="empty-state-title">No customers found</h3>
                <p className="empty-state-description">
                  {searchQuery ? "Try adjusting your search query" : "Add your first customer to get started"}
                </p>
                <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />} className="mt-4">
                  Add Customer
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono text-sm text-[var(--text-muted)]">#{customer.id}</TableCell>
                        <TableCell className="font-medium text-[var(--text-primary)]">{customer.name}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                          <span>{customer.phone || <span className="text-[var(--text-muted)]">—</span>}</span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                          <span>{customer.email || <span className="text-[var(--text-muted)]">—</span>}</span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="font-mono text-sm">{customer.gstin || <span className="text-[var(--text-muted)]">—</span>}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.status === "active" ? "success" : "neutral"}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(customer)} aria-label="Edit customer">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" aria-label="View customer details">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add/Edit Customer Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingCustomer ? "Edit Customer" : "Add Customer"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Customer Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter customer name"
              required
              leftIcon={<UserPlus className="w-5 h-5" />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                leftIcon={<Phone className="w-5 h-5" />}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@email.com"
                leftIcon={<Mail className="w-5 h-5" />}
              />
            </div>
            <Input
              label="GSTIN"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              placeholder="33AAACN4165C4ZV"
              helperText="15-character GSTIN (optional)"
              leftIcon={<Hash className="w-5 h-5" />}
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address with city, state, PIN"
              leftIcon={<MapPin className="w-5 h-5" />}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCustomer ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}