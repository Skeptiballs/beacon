import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONFIG } from "@/config/app";
import { Radar, Building2, Package, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex-1">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-background to-background" />
        
        <div className="container relative max-w-screen-xl py-24 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Radar className="w-10 h-10 text-emerald-500" />
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                {APP_CONFIG.name}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                {APP_CONFIG.tagline}
              </p>
            </div>

            {/* Description */}
            <p className="max-w-xl text-muted-foreground">
              This is an early MVP of Beacon — a customer intelligence platform 
              designed to help you track companies, understand market dynamics, 
              and make better decisions about your key accounts.
            </p>

            {/* CTA */}
            <div className="flex gap-4">
              <Link href="/companies">
                <Button size="lg" className="gap-2">
                  View Companies
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features preview */}
      <section className="container max-w-screen-xl py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                </div>
                <CardTitle className="text-lg">Companies</CardTitle>
              </div>
              <CardDescription>
                Track and organize information about your key customers and prospects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/companies">
                <Button variant="outline" className="gap-2">
                  Explore Companies
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Products</CardTitle>
              </div>
              <CardDescription>
                Coming soon: Product intelligence to understand competitive offerings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/products">
                <Button variant="outline" className="gap-2" disabled>
                  Coming Soon
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container max-w-screen-xl py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4" />
              <span>{APP_CONFIG.name}</span>
            </div>
            <span>MVP v{APP_CONFIG.version}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

