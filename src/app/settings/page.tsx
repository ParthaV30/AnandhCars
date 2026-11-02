"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Save, Building, Key, Shield, Database, Bell, User, Palette, CreditCard, Hash, MapPin, Mail, Phone, Lock, Users, AlertTriangle, FileText, Percent } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import toast from "react-hot-toast";

const tabs = [
  { id: "workshop", label: "Workshop", icon: Building },
  { id: "tax", label: "Tax Settings", icon: Shield },
  { id: "numbering", label: "Numbering", icon: Database },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "users", label: "Users", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Key },
];

const defaultWorkshop = {
  name: "Orbenyx Auto Workshop",
  address: "123 Workshop Street, Industrial Area, Chennai - 600001, Tamil Nadu",
  phone: "044-23456789",
  email: "info@orbenyx.com",
  gstin: "33AAACO1234B1Z5",
  stateCode: "33",
  bankDetails: {
    bankName: "State Bank of India",
    accountName: "Orbenyx Auto Workshop",
    accountNumber: "12345678901",
    ifscCode: "SBIN0001234",
    branch: "Chennai Industrial Branch",
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("workshop");
  const [saving, setSaving] = useState(false);
  const [workshop, setWorkshop] = useState(defaultWorkshop);
  const [taxSettings, setTaxSettings] = useState({
    defaultTaxConfig: "CGST_SGST",
    defaultGstRate: 1800,
    roundingPolicy: "EXCEL",
    defaultPricing: "EXCLUSIVE",
  });
  const [numberingSettings, setNumberingSettings] = useState({
    taxInvoicePrefix: "INV",
    labourBillPrefix: "LAB",
    repairEstimatePrefix: "EST",
    insuranceClaimPrefix: "CLM",
    simpleEstimatePrefix: "QUO",
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    primaryColor: "#17365D",
    compactMode: false,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-[var(--text-secondary)]">Configure your workshop billing application</p>
        </div>

        {/* Tabs */}
        <Card>
          <CardBody className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1 p-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-3 px-4 justify-center">
                    <tab.icon className="w-4 h-4" aria-hidden="true" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Workshop Settings */}
              <TabsContent value="workshop" className="p-6 space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary" />
                      Workshop Information
                    </h3>
                    <Input
                      label="Workshop Name *"
                      value={workshop.name}
                      onChange={(e) => setWorkshop({ ...workshop, name: e.target.value })}
                      placeholder="Enter workshop name"
                      required
                      leftIcon={<Building className="w-5 h-5" />}
                    />
                    <Textarea
                      label="Address *"
                      value={workshop.address}
                      onChange={(e) => setWorkshop({ ...workshop, address: e.target.value })}
                      placeholder="Full address"
                      rows={3}
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Phone *"
                        value={workshop.phone}
                        onChange={(e) => setWorkshop({ ...workshop, phone: e.target.value })}
                        placeholder="044-23456789"
                        required
                        leftIcon={<Phone className="w-5 h-5" />}
                      />
                      <Input
                        label="Email *"
                        type="email"
                        value={workshop.email}
                        onChange={(e) => setWorkshop({ ...workshop, email: e.target.value })}
                        placeholder="info@workshop.com"
                        required
                        leftIcon={<Mail className="w-5 h-5" />}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="GSTIN"
                        value={workshop.gstin}
                        onChange={(e) => setWorkshop({ ...workshop, gstin: e.target.value.toUpperCase() })}
                        placeholder="33AAACO1234B1Z5"
                        leftIcon={<Hash className="w-5 h-5" />}
                      />
                      <Input
                        label="State Code"
                        value={workshop.stateCode}
                        onChange={(e) => setWorkshop({ ...workshop, stateCode: e.target.value })}
                        placeholder="33"
                        leftIcon={<Shield className="w-5 h-5" />}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Bank Details
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">Used on invoices and payment documents</p>
                    <Input
                      label="Bank Name"
                      value={workshop.bankDetails.bankName}
                      onChange={(e) => setWorkshop({ ...workshop, bankDetails: { ...workshop.bankDetails, bankName: e.target.value } })}
                      placeholder="State Bank of India"
                      leftIcon={<Building className="w-5 h-5" />}
                    />
                    <Input
                      label="Account Name"
                      value={workshop.bankDetails.accountName}
                      onChange={(e) => setWorkshop({ ...workshop, bankDetails: { ...workshop.bankDetails, accountName: e.target.value } })}
                      placeholder="Orbenyx Auto Workshop"
                      leftIcon={<User className="w-5 h-5" />}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Account Number"
                        value={workshop.bankDetails.accountNumber}
                        onChange={(e) => setWorkshop({ ...workshop, bankDetails: { ...workshop.bankDetails, accountNumber: e.target.value } })}
                        placeholder="12345678901"
                        leftIcon={<CreditCard className="w-5 h-5" />}
                      />
                      <Input
                        label="IFSC Code"
                        value={workshop.bankDetails.ifscCode}
                        onChange={(e) => setWorkshop({ ...workshop, bankDetails: { ...workshop.bankDetails, ifscCode: e.target.value.toUpperCase() } })}
                        placeholder="SBIN0001234"
                        leftIcon={<Key className="w-5 h-5" />}
                      />
                    </div>
                    <Input
                      label="Branch"
                      value={workshop.bankDetails.branch}
                      onChange={(e) => setWorkshop({ ...workshop, bankDetails: { ...workshop.bankDetails, branch: e.target.value } })}
                      placeholder="Chennai Industrial Branch"
                      leftIcon={<MapPin className="w-5 h-5" />}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--border-primary)]">
                  <Button onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Workshop Settings
                  </Button>
                </div>
              </TabsContent>

              {/* Tax Settings */}
              <TabsContent value="tax" className="p-6 space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Default Tax Configuration
                    </h3>
                    <Select
                      label="Default Tax Configuration"
                      value={taxSettings.defaultTaxConfig}
                      onChange={(e) => setTaxSettings({ ...taxSettings, defaultTaxConfig: e.target.value })}
                      options={[
                        { value: "CGST_SGST", label: "CGST + SGST (Intra-state)" },
                        { value: "IGST", label: "IGST (Inter-state)" },
                        { value: "EXEMPT", label: "Exempt" },
                      ]}
                      placeholder="Select default"
                    />
                    <Input
                      label="Default GST Rate (basis points)"
                      type="number"
                      value={taxSettings.defaultGstRate}
                      onChange={(e) => setTaxSettings({ ...taxSettings, defaultGstRate: parseInt(e.target.value) || 0 })}
                      placeholder="1800"
                      helperText="18% = 1800 bp, 28% = 2800 bp"
                      leftIcon={<Percent className="w-5 h-5" />}
                    />
                    <Select
                      label="Rounding Policy"
                      value={taxSettings.roundingPolicy}
                      onChange={(e) => setTaxSettings({ ...taxSettings, roundingPolicy: e.target.value })}
                      options={[
                        { value: "EXCEL", label: "Excel Style (aggregate rounding)" },
                        { value: "LINE_RUPEE", label: "Line Rupee (per-line rounding)" },
                      ]}
                      placeholder="Select policy"
                    />
                    <Select
                      label="Default Pricing"
                      value={taxSettings.defaultPricing}
                      onChange={(e) => setTaxSettings({ ...taxSettings, defaultPricing: e.target.value })}
                      options={[
                        { value: "EXCLUSIVE", label: "Tax Exclusive (add tax on top)" },
                        { value: "INCLUSIVE", label: "Tax Inclusive (tax included in price)" },
                      ]}
                      placeholder="Select pricing"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-[var(--border-primary)]">
                  <Button onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Tax Settings
                  </Button>
                </div>
              </TabsContent>

              {/* Numbering Settings */}
              <TabsContent value="numbering" className="p-6 space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Document Number Prefixes
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">Format: PREFIX/Financial-Year/Sequence (e.g., INV/2026-27/0001)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: "taxInvoicePrefix", label: "Tax Invoice", icon: FileText },
                      { key: "labourBillPrefix", label: "Labour Bill", icon: FileText },
                      { key: "repairEstimatePrefix", label: "Repair Estimate", icon: FileText },
                      { key: "insuranceClaimPrefix", label: "Insurance Claim", icon: FileText },
                      { key: "simpleEstimatePrefix", label: "Simple Estimate", icon: FileText },
                    ].map(({ key, label, icon: IconComponent }) => (
                      <Input
                        key={key}
                        label={label}
                        value={numberingSettings[key as keyof typeof numberingSettings]}
                        onChange={(e) => setNumberingSettings({ ...numberingSettings, [key]: e.target.value.toUpperCase() })}
                        placeholder="INV"
                        leftIcon={<IconComponent className="w-5 h-5" />}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-[var(--border-primary)]">
                  <Button onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Numbering Settings
                  </Button>
                </div>
              </TabsContent>

              {/* Appearance */}
              <TabsContent value="appearance" className="p-6 space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Theme
                    </h3>
                    <Select
                      label="Theme"
                      value={appearanceSettings.theme}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, theme: e.target.value })}
                      options={[
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" },
                        { value: "system", label: "System" },
                      ]}
                      placeholder="Select theme"
                    />
                    <div className="flex items-center gap-4">
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Primary Color</label>
                      <Input
                        type="color"
                        value={appearanceSettings.primaryColor}
                        onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primaryColor: e.target.value })}
                        className="w-16 h-12 cursor-pointer border-none p-0"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-4">
                      <input
                        type="checkbox"
                        checked={appearanceSettings.compactMode}
                        onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                        className="w-4 h-4 rounded border-[var(--border-primary)] text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-[var(--text-secondary)]">Compact Mode (denser tables)</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-[var(--border-primary)]">
                  <Button onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Appearance Settings
                  </Button>
                </div>
              </TabsContent>

              {/* Users - Placeholder */}
              <TabsContent value="users" className="p-6 animate-fade-in">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">User Management</h3>
                  <p className="text-[var(--text-secondary)] mb-6">Manage user accounts, roles, and permissions</p>
                  <Button leftIcon={<User className="w-4 h-4" />}>Add User</Button>
                </div>
              </TabsContent>

              {/* Notifications - Placeholder */}
              <TabsContent value="notifications" className="p-6 animate-fade-in">
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Notification Settings</h3>
                  <p className="text-[var(--text-secondary)] mb-6">Configure email, SMS, and WhatsApp notifications</p>
                  <Button leftIcon={<Bell className="w-4 h-4" />}>Configure</Button>
                </div>
              </TabsContent>

              {/* Security */}
              <TabsContent value="security" className="p-6 animate-fade-in">
                <div className="space-y-6 max-w-md">
                  <Card variant="outlined">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      <Input label="Current Password" type="password" placeholder="••••••••" leftIcon={<Lock className="w-5 h-5" />} />
                      <Input label="New Password" type="password" placeholder="••••••••" leftIcon={<Lock className="w-5 h-5" />} />
                      <Input label="Confirm New Password" type="password" placeholder="••••••••" leftIcon={<Lock className="w-5 h-5" />} />
                      <Button leftIcon={<Save className="w-4 h-4" />}>Update Password</Button>
                    </CardBody>
                  </Card>
                  <Card variant="outlined">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Two-Factor Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      <p className="text-[var(--text-secondary)]">Add an extra layer of security to your account</p>
                      <Button variant="outline" leftIcon={<Shield className="w-4 h-4" />}>Enable 2FA</Button>
                    </CardBody>
                  </Card>
                  <Card variant="outlined">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-primary" />
                        Session Management
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <Button variant="outline" className="w-full" leftIcon={<AlertTriangle className="w-4 h-4" />}>
                        Log out of all other sessions
                      </Button>
                    </CardBody>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}