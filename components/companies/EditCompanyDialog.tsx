"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCompany } from "@/hooks/useCompanies";
import { CATEGORY_CODES } from "@/lib/categories";
import { REGION_CODES, REGION_LABELS } from "@/lib/regions";
import { CompanyResponse, CreateCompanyInput, RegionCode, CategoryCode } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface EditCompanyDialogProps {
  company: CompanyResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCompanyDialog({ company, open, onOpenChange }: EditCompanyDialogProps) {
  const [formData, setFormData] = useState<CreateCompanyInput>({
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
  });
  
  const updateCompany = useUpdateCompany();

  // Populate form when company changes or dialog opens
  useEffect(() => {
    if (company && open) {
      setFormData({
        name: company.name,
        website: company.website || "",
        linkedin_url: company.linkedin_url || "",
        logo_url: company.logo_url || "",
        hq_country: company.hq_country || "",
        hq_city: company.hq_city || "",
        categories: company.categories || [],
        summary: company.summary || "",
        employees: company.employees || "",
        regions: company.regions || [],
      });
    }
  }, [company, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      await updateCompany.mutateAsync({
        id: company.id,
        data: {
          ...formData,
          name: formData.name.trim(),
          website: formData.website || undefined,
          linkedin_url: formData.linkedin_url || undefined,
          logo_url: formData.logo_url || undefined,
          hq_country: formData.hq_country || undefined,
          hq_city: formData.hq_city || undefined,
          summary: formData.summary || undefined,
          employees: formData.employees || undefined,
        },
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update company:", error);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company information in your database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name - required */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>

            {/* Website */}
            <div className="grid gap-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            {/* LinkedIn */}
            <div className="grid gap-2">
              <Label htmlFor="edit-linkedin">LinkedIn URL</Label>
              <Input
                id="edit-linkedin"
                value={formData.linkedin_url || ""}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            {/* Logo URL */}
            <div className="grid gap-2">
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input
                id="edit-logo"
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* HQ Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="grid gap-2">
                <Label htmlFor="edit-country">HQ Country</Label>
                <Input
                  id="edit-country"
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
                <Label htmlFor="edit-city">HQ City</Label>
                <Input
                  id="edit-city"
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
              <Label htmlFor="edit-employees">Employees</Label>
              <Input
                id="edit-employees"
                value={formData.employees || ""}
                onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                placeholder="e.g., 50-200"
              />
            </div>

            {/* Summary */}
            <div className="grid gap-2">
              <Label htmlFor="edit-summary">Summary</Label>
              <Input
                id="edit-summary"
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
              onClick={() => onOpenChange(false)}
              disabled={updateCompany.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateCompany.isPending || !formData.name.trim()}>
              {updateCompany.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

