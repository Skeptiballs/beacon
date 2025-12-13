import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { RadarGraphic } from "@/components/landing/RadarGraphic";
import { PopularCategories } from "@/components/landing/PopularCategories";
import { WaitlistSection } from "@/components/landing/WaitlistSection";
import { APP_CONFIG } from "@/config/app";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero section */}
      <section className="flex-1 flex items-center justify-center relative overflow-hidden bg-background min-h-[calc(100vh-3.5rem)]">
        {/* Background gradient effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 lg:py-0 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                  Find the right <br/>
                  software <span className="text-emerald-500">for your port</span>
              </h1>
                <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-xl leading-relaxed">
                  Discover and compare maritime technology solutions from 
                  leading providers worldwide.
              </p>
            </div>

              {/* Search Box */}
              <div className="relative max-w-lg group">
                {/* Glow effect on hover/focus */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500" />
                
                <form action="/companies" className="relative flex items-center">
                  <Input 
                    name="q"
                    placeholder="Search companies, products, categories..." 
                    className="h-16 pl-6 pr-36 bg-background/80 border-white/10 text-base rounded-xl backdrop-blur-md focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 shadow-sm"
                  />
                  <div className="absolute right-2">
                    <Button 
                      type="submit" 
                      size="lg"
                      className="h-12 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] transition-all hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)]"
                    >
                      Search
                </Button>
                  </div>
                </form>
              </div>
              
              {/* Links */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 pt-4">
                <Link 
                  href="/companies" 
                  className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-emerald-500 transition-colors"
                >
                  View all companies 
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="/news" 
                  className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-emerald-500 transition-colors"
                >
                  Browse news 
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              </div>
            </div>

            {/* Right Content - Radar */}
            <div className="flex justify-center lg:justify-end relative">
               <RadarGraphic className="scale-75 sm:scale-90 lg:scale-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <PopularCategories />

      {/* Waitlist Section */}
      <WaitlistSection />

      {/* Simplified Footer (hidden or minimal to match screenshot focus) */}
      <footer className="border-t border-border/10 bg-background/50 backdrop-blur-sm">
        <div className="container max-w-screen-xl py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground/60">
             <p>&copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
             <p>MVP v{APP_CONFIG.version}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
