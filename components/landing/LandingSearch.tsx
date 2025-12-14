"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Building2, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/hooks/useCompanies";
import { useDebounce } from "@/hooks/useDebounce"; // Assuming we might need this, or I'll implement it inline
import { cn } from "@/lib/utils";

export function LandingSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Debounce query
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  const { data, isLoading } = useCompanies({ 
    search: debouncedQuery,
    // Limit results if API supported it, but we'll slice client-side for now
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/companies?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const results = data?.data || [];
  const hasResults = results.length > 0;
  const showDropdown = isOpen && debouncedQuery.length > 0;

  return (
    <div ref={containerRef} className="relative max-w-lg group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      {/* Glow effect on hover/focus */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-emerald-500/30 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500" />
      
      <form onSubmit={handleSearch} className="relative flex items-center p-1.5 bg-background/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-20">
        <div className="pl-4 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <Input 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          name="q"
          placeholder="Search companies, products, categories..." 
          className="h-14 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-base"
        />
        <Button 
          type="submit" 
          size="lg"
          className="h-12 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] hover:scale-[1.02]"
        >
          {isLoading && debouncedQuery !== query ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden z-30">
          {isLoading && !data ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Searching...
            </div>
          ) : hasResults ? (
            <div className="py-2">
              <div className="px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Companies
              </div>
              {results.slice(0, 5).map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded bg-background border flex items-center justify-center overflow-hidden">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{company.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {company.hq_city && company.hq_country ? `${company.hq_city}, ${company.hq_country}` : company.hq_country || "Global"}
                    </div>
                  </div>
                </Link>
              ))}
              
              {results.length > 5 && (
                <button
                  onClick={handleSearch}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-emerald-500 hover:bg-emerald-500/5 hover:text-emerald-600 transition-colors border-t border-border/50"
                >
                  View all {results.length} results
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : debouncedQuery.length > 1 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No results found for &quot;{debouncedQuery}&quot;</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

