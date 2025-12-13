"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useUpdateCompany } from "@/hooks/useCompanies";
import { AgentStep, CompanyResponse, CreateCompanyInput, EnrichmentEvent, EnrichmentResponse } from "@/lib/types";
import { getEmployeeRangeLabel } from "@/lib/employees";
import { Check, Loader2, RefreshCcw, Sparkles } from "lucide-react";

type EnrichmentStatus = "idle" | "loading" | "ready" | "error";

interface CompanyEnrichmentDialogProps {
  company: CompanyResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EnrichmentSuggestion = NonNullable<EnrichmentResponse["suggestions"]>;

const baseAgentSteps = (): AgentStep[] => [
  { id: "fetch", label: "Fetching website content", status: "pending" },
  { id: "extract", label: "Extracting signals", status: "pending" },
  { id: "infer", label: "Inferring company fields", status: "pending" },
  { id: "structure", label: "Structuring suggestions", status: "pending" },
];

export function CompanyEnrichmentDialog({ company, open, onOpenChange }: CompanyEnrichmentDialogProps) {
  const [nameInput, setNameInput] = useState(company.name);
  const [websiteInput, setWebsiteInput] = useState(company.website || "");
  const [suggestions, setSuggestions] = useState<EnrichmentSuggestion | null>(null);
  const [status, setStatus] = useState<EnrichmentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>(baseAgentSteps());
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const runIdRef = useRef<string | null>(null);

  const updateCompany = useUpdateCompany();

  useEffect(() => {
    if (open) {
      setNameInput(company.name);
      setWebsiteInput(company.website || "");
      setSuggestions(null);
      setStatus("idle");
      setError(null);
      setAgentSteps(baseAgentSteps());
      setSelected({});
      runIdRef.current = null;
    }
  }, [company, open]);

  const diffEntries = useMemo(() => {
    if (!suggestions) return [];

    const entries: { key: keyof EnrichmentSuggestion; label: string; current: string | string[] | null; proposed: string | string[] }[] = [];

    const compareField = (
      key: keyof EnrichmentSuggestion,
      label: string,
      current: string | string[] | null | undefined,
      proposed: string | string[] | null | undefined
    ) => {
      if (!proposed) return;
      const formatValue = (value: string | string[] | null | undefined) => {
        if (key === "employees" && typeof value === "string") {
          return getEmployeeRangeLabel(value) || value;
        }
        return value;
      };

      const displayCurrent = formatValue(current);
      const displayProposed = formatValue(proposed);

      const normalizedCurrent = Array.isArray(displayCurrent)
        ? displayCurrent.join(", ")
        : displayCurrent || "";
      const normalizedProposed = Array.isArray(displayProposed)
        ? displayProposed.join(", ")
        : displayProposed || "";
      if (normalizedCurrent === normalizedProposed) return;
      entries.push({
        key,
        label,
        current: (Array.isArray(displayCurrent) ? displayCurrent : displayCurrent) ?? null,
        proposed: displayProposed as any,
      });
    };

    compareField("name", "Name", company.name, suggestions.name);
    compareField("website", "Website", company.website, suggestions.website);
    compareField("linkedin_url", "LinkedIn", company.linkedin_url, suggestions.linkedin_url);
    compareField("logo_url", "Logo URL", company.logo_url, suggestions.logo_url);
    compareField("hq_country", "HQ Country", company.hq_country, suggestions.hq_country);
    compareField("hq_city", "HQ City", company.hq_city, suggestions.hq_city);
    compareField("employees", "Employees", company.employees, suggestions.employees);
    compareField("summary", "Summary", company.summary, suggestions.summary);
    compareField("categories", "Categories", company.categories, suggestions.categories);
    compareField("regions", "Regions", company.regions, suggestions.regions);

    return entries;
  }, [company, suggestions]);

  const toggleField = (field: string, value: boolean) => {
    setSelected((prev) => ({ ...prev, [field]: value }));
  };

  const selectAll = () => {
    if (!suggestions) return;
    const next: Record<string, boolean> = {};
    Object.keys(suggestions).forEach((key) => {
      const val = (suggestions as any)[key];
      if (val !== undefined) next[key] = true;
    });
    setSelected(next);
  };

  const runEnrichment = async () => {
    const runId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}`;
    runIdRef.current = runId;

    setStatus("loading");
    setError(null);
    setSuggestions(null);
    setAgentSteps(baseAgentSteps());
    setSelected({});

    try {
      const response = await fetch(`/api/companies/${company.id}/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          website: websiteInput,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to run enrichment");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let gotSuggestions = false;

      const handleEvent = (event: EnrichmentEvent) => {
        if (runIdRef.current !== runId) return;
        switch (event.type) {
          case "step-start":
            setAgentSteps((steps) =>
              steps.map((s) =>
                s.id === event.stepId
                  ? { ...s, status: "active", label: event.label ?? s.label }
                  : s
              )
            );
            break;
          case "step-complete":
            setAgentSteps((steps) =>
              steps.map((s) =>
                s.id === event.stepId
                  ? { ...s, status: "done" }
                  : s
              )
            );
            break;
          case "partial-suggestion":
            setSuggestions((prev) => {
              const next = { ...(prev || {}), ...(event.data || {}) };
              setSelected((prevSel) => {
                const nextSel = { ...prevSel };
                Object.keys(event.data || {}).forEach((key) => {
                  if ((event.data as any)[key] !== undefined) {
                    nextSel[key] = true;
                  }
                });
                return nextSel;
              });
              return next;
            });
            break;
          case "suggestions":
            gotSuggestions = true;
            setSuggestions(event.data || null);
            setAgentSteps(event.steps && event.steps.length ? event.steps : baseAgentSteps());
            setSelected((prevSel) => {
              const nextSel = { ...prevSel };
              Object.keys(event.data || {}).forEach((key) => {
                if ((event.data as any)[key] !== undefined) {
                  nextSel[key] = true;
                }
              });
              return nextSel;
            });
            setStatus("ready");
            break;
          case "error":
            setError(event.message || "Agentic enrichment failed. Please try again.");
            setStatus("error");
            setAgentSteps(baseAgentSteps());
            break;
          default:
            break;
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const dataLine = rawEvent
            .split("\n")
            .find((line) => line.startsWith("data:"));
          if (!dataLine) continue;
          const json = dataLine.replace(/^data:\s*/, "");
          try {
            const parsed = JSON.parse(json) as EnrichmentEvent;
            handleEvent(parsed);
          } catch (e) {
            console.error("Failed to parse event", e, json);
          }
        }
      }

      if (!gotSuggestions) {
        setError("Agentic enrichment did not return suggestions.");
        setStatus("error");
      }
    } catch (err) {
      if (runIdRef.current !== runId) return;
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Agentic enrichment failed. Please try again."
      );
      setStatus("error");
      setAgentSteps(baseAgentSteps());
    }
  };

  const handleAccept = async () => {
    if (!suggestions) return;

    const payload: CreateCompanyInput = {
      name: selected["name"] ? suggestions.name || company.name : company.name,
    };

    const assignIf = (field: keyof CreateCompanyInput, value: any) => {
      if (value === undefined) return;
      if (!selected[field]) return;
      (payload as any)[field] = value;
    };

    assignIf("name", suggestions.name || company.name);
    assignIf("website", suggestions.website);
    assignIf("linkedin_url", suggestions.linkedin_url);
    assignIf("logo_url", suggestions.logo_url);
    assignIf("hq_country", suggestions.hq_country);
    assignIf("hq_city", suggestions.hq_city);
    assignIf("employees", suggestions.employees);
    assignIf("summary", suggestions.summary);
    assignIf("categories", suggestions.categories);
    assignIf("regions", suggestions.regions);

    try {
      await updateCompany.mutateAsync({ id: company.id, data: payload });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to apply suggestions", err);
      setError("Failed to apply suggestions. Please try again.");
    }
  };

  const showSuggestions = status === "ready" && !!suggestions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Enrich company data</DialogTitle>
          <DialogDescription>
            Provide a name and website. The agent will fetch signals, propose updates, and you can choose to apply them.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="enrich-name">Company name</Label>
            <Input
              id="enrich-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Acme Marine"
              disabled={status === "loading" || updateCompany.isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="enrich-website">Website</Label>
            <Input
              id="enrich-website"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              placeholder="https://example.com"
              disabled={status === "loading" || updateCompany.isPending}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={runEnrichment}
              disabled={!nameInput.trim() || status === "loading" || updateCompany.isPending}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running agent…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enrich
                </>
              )}
            </Button>
            {showSuggestions && (
              <Button
                type="button"
                variant="outline"
                onClick={runEnrichment}
                disabled={updateCompany.isPending}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Rerun
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {["loading", "ready"].includes(status) && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              <div className="text-sm font-medium mb-2">Agent actions</div>
              <div className="space-y-2">
                {agentSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2">
                    {step.status === "done" ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : step.status === "active" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    )}
                    <span
                      className={
                        step.status === "active"
                          ? "text-sm font-medium text-foreground"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showSuggestions ? (
            <div className="rounded-md border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium">Suggested changes</p>
                <div className="ml-auto">
                  <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                    Select all
                  </Button>
                </div>
              </div>
              {diffEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No differences found. You can still apply to refresh data.</p>
              ) : (
                <div className="grid gap-3">
                  {diffEntries.map((entry) => (
                    <div key={entry.label} className="rounded border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{entry.label}</p>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selected[entry.key as string] ?? true}
                            onChange={(e) => toggleField(entry.key as string, e.target.checked)}
                          />
                          Accept
                        </label>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Current: {Array.isArray(entry.current) ? (
                          <span className="inline-flex flex-wrap gap-1">
                            {entry.current.map((item) => (
                              <Badge key={item} variant="secondary" className="text-[10px]">
                                {item}
                              </Badge>
                            ))}
                          </span>
                        ) : (
                          entry.current || "—"
                        )}
                      </div>
                      <div className="mt-1 text-xs">
                        Proposed: {Array.isArray(entry.proposed) ? (
                          <span className="inline-flex flex-wrap gap-1">
                            {entry.proposed.map((item) => (
                              <Badge key={item} variant="outline" className="text-[10px]">
                                {item}
                              </Badge>
                            ))}
                          </span>
                        ) : (
                          entry.proposed
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : status === "idle" ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              Suggestions will appear here after you run enrichment.
            </div>
          ) : null}
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
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!showSuggestions || updateCompany.isPending}
          >
            {updateCompany.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Accept changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

