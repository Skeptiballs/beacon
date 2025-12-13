import { MainShell } from "@/components/layout/MainShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock } from "lucide-react";

export default function ProductsPage() {
  return (
    <MainShell>
      <PageHeader
        title="Products"
        description="Product intelligence for understanding competitive offerings."
      />

      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Product intelligence is on the roadmap
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Product intelligence is coming soon to Beacon. Track competitive 
            products, analyze market positioning, and understand how your 
            offerings compare.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expected in a future release</span>
          </div>
        </CardContent>
      </Card>
    </MainShell>
  );
}






