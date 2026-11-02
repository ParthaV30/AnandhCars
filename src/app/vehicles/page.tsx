"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Plus, Search, Edit, Car, CarFront, MapPin } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

const mockVehicles = [
  { id: "1", regNo: "PY 01 DF 8282", make: "VOLVO", model: "XC 60", kms: "", customer: "New India Assurance Co Ltd", customerId: "1" },
  { id: "2", regNo: "TN 40 AA 5333", make: "MARUTI", model: "XL 6", kms: "103341", customer: "SLNP Silks", customerId: "2" },
  { id: "3", regNo: "TN 38 CW 8176", make: "MARUTI", model: "BALENO", kms: "", customer: "Leela Krishnan", customerId: "3" },
  { id: "4", regNo: "TN 28 BY 8622", make: "MAHINDRA", model: "XUV 500", kms: "", customer: "Mahindra Service Center", customerId: "5" },
];

const customers = [
  { id: "1", name: "New India Assurance Co Ltd" },
  { id: "2", name: "SLNP Silks" },
  { id: "3", name: "Leela Krishnan" },
  { id: "5", name: "Mahindra Service Center" },
];

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<typeof mockVehicles[0] | null>(null);
  const [formData, setFormData] = useState({ customerId: "", regNo: "", make: "", model: "", kms: "" });

  const handleEdit = (vehicle: typeof mockVehicles[0]) => {
    setEditingVehicle(vehicle);
    setFormData({ customerId: vehicle.customerId, regNo: vehicle.regNo, make: vehicle.make, model: vehicle.model, kms: vehicle.kms });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingVehicle(null);
    setFormData({ customerId: "", regNo: "", make: "", model: "", kms: "" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    // In real app, call API to save
  };

  const filteredVehicles = mockVehicles.filter((v) =>
    v.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Vehicles</h1>
            <p className="text-[var(--text-secondary)]">Manage vehicle records and service history</p>
          </div>
          <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
            Add Vehicle
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardBody className="p-4">
            <Input
              placeholder="Search vehicles by registration, make, model, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
              leftIcon={<Search className="w-5 h-5" />}
            />
          </CardBody>
        </Card>

        {/* Vehicles Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Vehicles</CardTitle>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                {filteredVehicles.length} of {mockVehicles.length} vehicles
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {filteredVehicles.length === 0 ? (
              <div className="empty-state">
                <Car className="empty-state-icon" />
                <h3 className="empty-state-title">No vehicles found</h3>
                <p className="empty-state-description">
                  {searchQuery ? "Try adjusting your search query" : "Add your first vehicle to get started"}
                </p>
                <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />} className="mt-4">
                  Add Vehicle
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Registration No</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Kms</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="w-40 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle, index) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-mono text-sm text-[var(--text-muted)]">#{index + 1}</TableCell>
                        <TableCell className="font-medium text-[var(--text-primary)] font-mono">{vehicle.regNo}</TableCell>
                        <TableCell>{vehicle.make}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell className="font-mono">{vehicle.kms || <span className="text-[var(--text-muted)]">—</span>}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                          {vehicle.customer}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(vehicle)} aria-label="Edit vehicle">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Link href={`/vehicles/${vehicle.id}`}>
                              <Button variant="ghost" size="icon-sm" aria-label="View vehicle history">
                                <CarFront className="w-4 h-4" />
                              </Button>
                            </Link>
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

        {/* Add/Edit Vehicle Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Customer *"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select customer"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registration No *"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value.toUpperCase() })}
                placeholder="TN 01 AB 1234"
                required
              />
              <Input
                label="Kms Reading"
                value={formData.kms}
                onChange={(e) => setFormData({ ...formData, kms: e.target.value })}
                placeholder="103341"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Manufacturer *"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value.toUpperCase() })}
                placeholder="MARUTI"
                required
              />
              <Input
                label="Model *"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value.toUpperCase() })}
                placeholder="BALENO"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingVehicle ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}