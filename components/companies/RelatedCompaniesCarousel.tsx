"use client";

import Link from "next/link";
import { useCompanies } from "@/hooks/useCompanies";
import { CategoryCode } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function RelatedCompaniesCarousel({
  companyId,
  category,
}: {
  companyId: number;
  category?: CategoryCode;
}) {
  const { data, isLoading } = useCompanies({ 
    category,
    sortBy: "name-asc" 
  });

  // Filter out the current company and limit to 10
  const relatedCompanies = data?.data
    .filter((c) => c.id !== companyId)
    .slice(0, 10) || [];

  if (isLoading || relatedCompanies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground/90">
          <Building2 className="h-5 w-5 text-blue-500" />
          <h2>Related Companies</h2>
        </div>
        <Link 
          href={`/companies?category=${category}`}
          className="text-sm text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="px-1">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {relatedCompanies.map((company) => (
              <CarouselItem key={company.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Link 
                  href={`/companies/${company.id}`}
                  className="block h-full"
                >
                  <Card className="h-full hover:border-emerald-500/50 transition-colors group">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-background border flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={company.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground/50" />
                          )}
                        </div>
                        {company.hq_country && (
                          <Badge variant="secondary" className="font-normal text-xs">
                            {company.hq_country}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold group-hover:text-emerald-500 transition-colors truncate">
                          {company.name}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
                          {company.summary || "No description available."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {company.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-[10px] h-5 px-1.5">
                            {cat}
                          </Badge>
                        ))}
                        {company.categories.length > 2 && (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                            +{company.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          {relatedCompanies.length > 2 && (
            <>
              <CarouselPrevious className="-left-4 lg:-left-5" />
              <CarouselNext className="-right-4 lg:-right-5" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
}
