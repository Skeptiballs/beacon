"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCompany } from "@/hooks/useCompanies";
import { CATEGORY_CODES, CATEGORY_LABELS } from "@/lib/categories";
import { REGION_CODES, REGION_LABELS } from "@/lib/regions";
import { CreateCompanyInput, RegionCode, CategoryCode } from "@/lib/types";
import { Plus, Loader2 } from "lucide-react";

const initialFormState: CreateCompanyInput = {
  name: "",
  website: "",
  linkedin_url: "",
  logo_url: "",
  hq_country: "",
  hq_city: "",
  categories: [],
  summary: "",
  employees: "",
  regions: [],
};

export function AddCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyInput>(initialFormState);
  const createCompany = useCreateCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      await createCompany.mutateAsync({
        ...formData,
        name: formData.name.trim(),
        website: formData.website || undefined,
        linkedin_url: formData.linkedin_url || undefined,
        logo_url: formData.logo_url || undefined,
        hq_country: formData.hq_country || undefined,
        hq_city: formData.hq_city || undefined,
        summary: formData.summary || undefined,
        employees: formData.employees || undefined,
      });
      
      // Reset form and close dialog on success
      setFormData(initialFormState);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create company:", error);
    }
  };

  const toggleRegion = (region: RegionCode) => {
    const currentRegions = formData.regions || [];
    const newRegions = currentRegions.includes(region)
      ? currentRegions.filter((r) => r !== region)
      : [...currentRegions, region];
    setFormData({ ...formData, regions: newRegions });
  };

  const toggleCategory = (category: CategoryCode) => {
    const currentCategories = formData.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    setFormData({ ...formData, categories: newCategories });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Add a new company to your customer intelligence database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name - required */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>

            {/* Website */}
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            {/* LinkedIn */}
            <div className="grid gap-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={formData.linkedin_url || ""}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            {/* Logo URL */}
            <div className="grid gap-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* HQ Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="grid gap-2">
                <Label htmlFor="country">HQ Country</Label>
                <Input
                  id="country"
                  value={formData.hq_country || ""}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 3);
                    setFormData({ ...formData, hq_country: value });
                  }}
                  placeholder="e.g., NLD"
                  maxLength={3}
                  pattern="[A-Z]{3}"
                  title="Must be a 3-letter country code (e.g., USA, GBR, NLD)"
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground">3-letter ISO code</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">HQ City</Label>
                <Input
                  id="city"
                  value={formData.hq_city || ""}
                  onChange={(e) => setFormData({ ...formData, hq_city: e.target.value })}
                  placeholder="e.g., Amsterdam"
                />
                <p className="text-xs text-muted-foreground">City where HQ is located</p>
              </div>
            </div>

            {/* Categories - multi-select via buttons */}
            <div className="grid gap-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_CODES.map((code) => (
                  <Button
                    key={code}
                    type="button"
                    variant={formData.categories?.includes(code) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(code)}
                    className="font-mono text-xs"
                  >
                    {code}
                  </Button>
                ))}
              </div>
            </div>

            {/* Regions - multi-select via buttons */}
            <div className="grid gap-2">
              <Label>Regions</Label>
              <div className="flex flex-wrap gap-2">
                {REGION_CODES.map((code) => (
                  <Button
                    key={code}
                    type="button"
                    variant={formData.regions?.includes(code) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleRegion(code)}
                  >
                    {REGION_LABELS[code]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Employees */}
            <div className="grid gap-2">
              <Label htmlFor="employees">Employees</Label>
              <Input
                id="employees"
                value={formData.employees || ""}
                onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                placeholder="e.g., 50-200"
              />
            </div>

            {/* Summary */}
            <div className="grid gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                value={formData.summary || ""}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief description of the company"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createCompany.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCompany.isPending || !formData.name.trim()}>
              {createCompany.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

