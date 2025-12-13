"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Mail, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]" />
      
      <div className="container relative max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-3xl border border-white/10 bg-background/50 backdrop-blur-xl p-8 sm:p-16 overflow-hidden">
            {/* Card Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                <span className="font-medium">Early Access</span>
              </div>

              <div className="space-y-4 max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  Ready to modernize your <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">
                    maritime intelligence?
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Join hundreds of port operators and shipping companies getting early access 
                  to the next generation of market data.
                </p>
              </div>

              <div className="w-full max-w-md">
                {status === "success" ? (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-8">
                      <div className="p-3 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/50">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-emerald-500">You're on the list!</h3>
                        <p className="text-muted-foreground text-sm">
                          We'll notify {email ? email : "you"} when we open up spots.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setStatus("idle")}
                        className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                      >
                        Add another email
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <form onSubmit={handleSubmit} className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                      <div className="relative flex items-center bg-background rounded-xl p-1.5 ring-1 ring-border shadow-sm">
                        <Mail className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="Enter your work email..."
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent pl-11 h-12 text-base"
                        />
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className={cn(
                            "h-12 px-6 rounded-lg font-medium transition-all",
                            "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/25"
                          )}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              Join Now <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                    {status === "error" && (
                      <p className="text-sm text-red-500 animate-in slide-in-from-top-1">
                        {errorMessage}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      No spam. Unsubscribe anytime.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

