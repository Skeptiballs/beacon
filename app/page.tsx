import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { RadarGraphic } from "@/components/landing/RadarGraphic";
import { PopularCategories } from "@/components/landing/PopularCategories";
import { WaitlistSection } from "@/components/landing/WaitlistSection";
import { APP_CONFIG } from "@/config/app";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero section */}
      <section className="flex-1 flex items-center justify-center relative overflow-hidden bg-background min-h-[calc(100vh-3.5rem)]">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Background gradient effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        
        <div className="container max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 lg:py-0 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-sm font-medium text-emerald-500 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  The Intelligent Maritime Database
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  Find the right <br/>
                  software <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">for your port</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                  Discover and compare maritime technology solutions from 
                  leading providers worldwide. The most comprehensive directory for modern ports.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative max-w-lg group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                {/* Glow effect on hover/focus */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-emerald-500/30 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500" />
                
                <form action="/companies" className="relative flex items-center p-1.5 bg-background/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
                  <div className="pl-4 text-muted-foreground">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input 
                    name="q"
                    placeholder="Search companies, products, categories..." 
                    className="h-14 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-base"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    className="h-12 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] hover:scale-[1.02]"
                  >
                    Search
                  </Button>
                </form>
              </div>
              
              {/* Links */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
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
            <div className="flex justify-center lg:justify-end relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
               {/* Behind Radar Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] rounded-full -z-10" />
               <RadarGraphic className="scale-75 sm:scale-90 lg:scale-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <PopularCategories />

      {/* Waitlist Section */}
      <WaitlistSection />

      {/* Simplified Footer */}
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
