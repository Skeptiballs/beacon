"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, CATEGORY_CODES } from "@/lib/categories";
import { useCompanies } from "@/hooks/useCompanies";
import { CategoryCode } from "@/lib/types";

export function PopularCategories() {
  const [activeCategory, setActiveCategory] = useState<CategoryCode>("PMIS");
  const { data: companies, isLoading } = useCompanies({ category: activeCategory });

  // Get first 6 companies for the active category
  const displayCompanies = companies?.data.slice(0, 6) || [];

  return (
    <section className="container max-w-screen-xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-background">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Categories List */}
        <div className="w-full lg:w-1/3 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Most Popular Software <br />
              Categories
            </h2>
          </div>
          
          <div className="flex flex-col space-y-1">
            {CATEGORY_CODES.map((code) => (
              <button
                key={code}
                onClick={() => setActiveCategory(code)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors rounded-md",
                  activeCategory === code
                    ? "bg-background text-emerald-500 border border-emerald-500"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {CATEGORY_LABELS[code]}
                {activeCategory === code && (
                  <ArrowRight className="h-4 w-4 text-emerald-500" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/companies"
              className="text-sm font-medium text-emerald-500 hover:text-emerald-600 flex items-center gap-2"
            >
              See all {CATEGORY_LABELS[activeCategory]} Software
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Side: Company Grid */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-lg border bg-card/50 animate-pulse"
                />
              ))
            ) : displayCompanies.length > 0 ? (
              displayCompanies.map((company) => (
                <Link key={company.id} href={`/companies/${company.id}`}>
                  <Card className="h-full hover:border-emerald-500/50 transition-colors p-6 flex flex-col items-center justify-center text-center space-y-4 group bg-card hover:bg-muted/50">
                    <div className="w-16 h-16 rounded-lg bg-background border flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-emerald-500">
                          {company.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-emerald-500 transition-colors">
                        {company.name}
                      </h3>
                      {company.hq_country && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {company.hq_country}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full h-48 flex items-center justify-center border rounded-lg bg-muted/20 text-muted-foreground">
                No companies found in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

