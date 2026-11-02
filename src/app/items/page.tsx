"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Search, Edit, Package, Tag, RotateCcw } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const mockItems = [
  { id: "1", description: "Wind Screen", partNumber: "WS-VOLVO-XC60", hsnSac: "8708", category: "Spare Parts", unit: "NOS", price: 80331, taxConfig: "CGST_SGST", gstRate: 1800, active: true },
  { id: "2", description: "Head Light", partNumber: "HL-VOLVO-XC60", hsnSac: "8512", category: "Spare Parts", unit: "NOS", price: 98116, taxConfig: "CGST_SGST", gstRate: 1800, active: true },
  { id: "3", description: "Bumper Cover", partNumber: "BC-VOLVO-XC60", hsnSac: "8708", category: "Spare Parts", unit: "NOS", price: 86056, taxConfig: "CGST_SGST", gstRate: 1800, active: true },
  { id: "4", description: "Labour Charges", partNumber: "", hsnSac: "9987", category: "Labour", unit: "NOS", price: 86199, taxConfig: "CGST_SGST", gstRate: 1800, active: true },
  { id: "5", description: "Engine Oil", partNumber: "EO-5W30-4L", hsnSac: "2710", category: "Spare Parts", unit: "LIT", price: 800, taxConfig: "CGST_SGST", gstRate: 1800, active: true },
  { id: "6", description: "Front Bumper R&R", partNumber: "", hsnSac: "9987", category: "Labour", unit: "NOS", price: 800, taxConfig: "CGST_SGST", gstRate: 1800, active: true },
];

const categories = ["Spare Parts", "Labour", "Painting", "Servicing", "Other"];
const taxConfigs = ["CGST_SGST", "IGST", "EXEMPT"];
const units = ["NOS", "LIT", "KG", "MTR", "SET", "PCS"];

export default function ItemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof mockItems[0] | null>(null);
  const [formData, setFormData] = useState({
    description: "", partNumber: "", hsnSac: "", category: "Spare Parts", unit: "NOS",
    price: 0, taxConfig: "CGST_SGST", gstRate: 1800, active: true
  });

  const handleEdit = (item: typeof mockItems[0]) => {
    setEditingItem(item);
    setFormData({
      description: item.description, partNumber: item.partNumber, hsnSac: item.hsnSac,
      category: item.category, unit: item.unit, price: item.price,
      taxConfig: item.taxConfig, gstRate: item.gstRate, active: item.active
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ description: "", partNumber: "", hsnSac: "", category: "Spare Parts", unit: "NOS", price: 0, taxConfig: "CGST_SGST", gstRate: 1800, active: true });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    // In real app, call API to save
  };

  const formatPrice = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  const filteredItems = mockItems.filter((i) =>
    (i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.hsnSac.includes(searchQuery)) &&
    (categoryFilter === "" || i.category === categoryFilter)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Parts & Services</h1>
            <p className="text-[var(--text-secondary)]">Manage your catalogue of parts, labour, and services</p>
          </div>
          <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
            Add Item
          </Button>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search items by description, part number, or HSN/SAC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md flex-1"
                leftIcon={<Search className="w-5 h-5" />}
              />
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c, label: c }))]}
                placeholder="Filter by category"
                className="max-w-xs"
              />
            </div>
          </CardBody>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Items</CardTitle>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                {filteredItems.length} of {mockItems.length} items
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <Package className="empty-state-icon" />
                <h3 className="empty-state-title">No items found</h3>
                <p className="empty-state-description">
                  {searchQuery || categoryFilter ? "Try adjusting your filters or search query" : "Add your first item to get started"}
                </p>
                <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />} className="mt-4">
                  Add Item
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Part No</TableHead>
                      <TableHead>HSN/SAC</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm text-[var(--text-muted)]">#{index + 1}</TableCell>
                        <TableCell className="font-medium text-[var(--text-primary)]">{item.description}</TableCell>
                        <TableCell className="font-mono text-sm">{item.partNumber || <span className="text-[var(--text-muted)]">—</span>}</TableCell>
                        <TableCell className="font-mono text-sm">{item.hsnSac}</TableCell>
                        <TableCell><Badge variant="info">{item.category}</Badge></TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(item.price)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="neutral" className="text-xs">
                            {item.taxConfig === "CGST_SGST" ? `CGST+SGST ${item.gstRate/100}%` : item.taxConfig === "IGST" ? `IGST ${item.gstRate/100}%` : "Exempt"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.active ? "success" : "neutral"}>{item.active ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)} aria-label="Edit item">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add/Edit Item Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? "Edit Item" : "Add Item"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Part Number"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                placeholder="Optional"
              />
              <Input
                label="HSN/SAC Code"
                value={formData.hsnSac}
                onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                placeholder="8708"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={categories.map((c) => ({ value: c, label: c }))}
                placeholder="Select category"
              />
              <Select
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                options={units.map((u) => ({ value: u, label: u }))}
                placeholder="Select unit"
              />
              <Input
                label="Price (₹)"
                type="number"
                value={formData.price / 100}
                onChange={(e) => setFormData({ ...formData, price: Math.round(parseFloat(e.target.value || "0") * 100) })}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Tax Config"
                value={formData.taxConfig}
                onChange={(e) => setFormData({ ...formData, taxConfig: e.target.value })}
                options={taxConfigs.map((t) => ({ value: t, label: t }))}
                placeholder="Select tax config"
              />
              <Input
                label="GST Rate (bp)"
                type="number"
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: parseInt(e.target.value) || 0 })}
                placeholder="1800"
              />
              <label className="flex items-center gap-2 cursor-pointer pt-6">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--border-primary)] text-primary focus:ring-primary"
                />
                <span className="text-sm text-[var(--text-secondary)]">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}