"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, Clock3, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TimeFilter = "all" | "week" | "trending" | "saved";

type NewsArticle = {
  id: string;
  title: string;
  source: string;
  publishedDaysAgo: number;
  excerpt: string;
  tags: string[];
  category: string;
  href: string;
  featured?: boolean;
  trending?: boolean;
  saved?: boolean;
};

const newsArticles: NewsArticle[] = [
  {
    id: "maersk-digital-platform",
    title: "Maersk Announces New Digital Platform for Port Operations",
    source: "Maritime Executive",
    publishedDaysAgo: 2,
    excerpt:
      "The shipping giant reveals its latest initiative to streamline port logistics through advanced AI integration and real-time data sharing protocols.",
    tags: ["Maersk", "Digital Transformation"],
    category: "Companies",
    href: "https://example.com/maersk-digital-platform",
    featured: true,
    trending: true,
  },
  {
    id: "rotterdam-vts",
    title: "AI-Powered Vessel Traffic Management Goes Live in Rotterdam",
    source: "Port Technology",
    publishedDaysAgo: 3,
    excerpt:
      "The Port of Rotterdam successfully implements its new autonomous traffic management system, promising 20% efficiency gains.",
    tags: ["Rotterdam", "VTS"],
    category: "Operations",
    href: "https://example.com/rotterdam-vts",
    trending: true,
  },
  {
    id: "imo-pmis-standards",
    title: "New PMIS Standards Released by IMO",
    source: "Lloyd's List",
    publishedDaysAgo: 5,
    excerpt:
      "International Maritime Organization sets new global benchmarks for Port Management Information Systems to ensure interoperability.",
    tags: ["IMO", "Standards"],
    category: "Regulation",
    href: "https://example.com/imo-pmis-standards",
  },
  {
    id: "singapore-smart-infra",
    title: "Singapore Port Authority Invests in Smart Infrastructure",
    source: "Splash 247",
    publishedDaysAgo: 7,
    excerpt:
      "Multi-billion dollar investment plan unveiled to upgrade terminal automation and 5G connectivity across all major berths.",
    tags: ["Singapore", "Infrastructure"],
    category: "Investment",
    href: "https://example.com/singapore-smart-infra",
  },
  {
    id: "green-corridors",
    title: "Green Corridor Initiative Expands Across Asia",
    source: "TradeWinds",
    publishedDaysAgo: 9,
    excerpt:
      "Coalition of carriers and ports launches new routes focused on low-emission fuels and standardized reporting for sustainability.",
    tags: ["Sustainability", "Shipping"],
    category: "Sustainability",
    href: "https://example.com/green-corridors",
    saved: true,
  },
  {
    id: "digital-twin-ports",
    title: "Digital Twin Pilots Accelerate for Major Ports",
    source: "Seatrade Maritime",
    publishedDaysAgo: 1,
    excerpt:
      "Port operators adopt digital twin simulations to stress-test capacity expansions and reduce downtime.",
    tags: ["Digital Twin", "Ports"],
    category: "Technology",
    href: "https://example.com/digital-twin-ports",
    trending: true,
  },
  {
    id: "port-cybersecurity",
    title: "Port Cybersecurity Guidance Updated for 2025",
    source: "Harbor Security",
    publishedDaysAgo: 12,
    excerpt:
      "New advisories focus on OT segmentation, crew training, and vendor risk management for maritime infrastructure.",
    tags: ["Cybersecurity", "Ports"],
    category: "Security",
    href: "https://example.com/port-cybersecurity",
  },
];

const timeFilters: { label: string; value: TimeFilter }[] = [
  { label: "This Week", value: "week" },
  { label: "Trending", value: "trending" },
  { label: "Saved", value: "saved" },
];

function formatPublished(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export default function NewsPage() {
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const sources = useMemo(
    () => Array.from(new Set(newsArticles.map((article) => article.source))),
    []
  );

  const categories = useMemo(
    () => Array.from(new Set(newsArticles.map((article) => article.category))),
    []
  );

  const filteredArticles = useMemo(() => {
    return newsArticles.filter((article) => {
      const matchesSource =
        sourceFilter === "all" ? true : article.source === sourceFilter;
      const matchesCategory =
        categoryFilter === "all" ? true : article.category === categoryFilter;

      const matchesTime =
        timeFilter === "all"
          ? true
          : timeFilter === "week"
            ? article.publishedDaysAgo <= 7
            : timeFilter === "trending"
              ? !!article.trending
              : !!article.saved;

      return matchesSource && matchesCategory && matchesTime;
    });
  }, [categoryFilter, sourceFilter, timeFilter]);

  const featuredArticle =
    filteredArticles.find((article) => article.featured) ||
    filteredArticles[0];

  const regularArticles = featuredArticle
    ? filteredArticles.filter((article) => article.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <main className="flex-1">
      <div className="container max-w-screen-xl py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-2">
          <p className="text-sm font-medium text-emerald-400">Industry News</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Latest updates, trends, and insights from the maritime world.
          </h1>
        </header>

        {featuredArticle ? (
          <FeaturedStoryCard article={featuredArticle} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              No stories match these filters yet. Try adjusting your filters.
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Filter by:</span>
            </div>

            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sourceFilter}
              onValueChange={(value) => setSourceFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 ml-auto">
              {timeFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={timeFilter === filter.value ? "secondary" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTimeFilter(
                      timeFilter === filter.value ? "all" : filter.value
                    )
                  }
                  className={cn(
                    "h-9",
                    timeFilter === filter.value && "border-primary/60"
                  )}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {regularArticles.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {regularArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                No additional stories match these filters.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}

function FeaturedStoryCard({ article }: { article: NewsArticle }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-emerald-950/50 via-background to-background">
      <div className="grid lg:grid-cols-[1.1fr,1.2fr]">
        <div className="relative h-full min-h-[260px] bg-muted/30">
          <div className="absolute inset-0 flex items-center justify-center text-sm uppercase tracking-[0.2em] text-muted-foreground/60">
            Featured Image (16:9)
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent" />
        </div>

        <div className="p-6 lg:p-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            >
              {article.source}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              {formatPublished(article.publishedDaysAgo)}
            </span>
            {article.trending && (
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="h-4 w-4" />
                Trending
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              {article.title}
            </h2>
            <p className="text-muted-foreground">{article.excerpt}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-100 border-emerald-500/30"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-auto">
            <Button asChild size="sm" className="gap-2">
              <Link href={article.href} target="_blank" rel="noreferrer">
                Read Full Story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {article.saved && (
              <Badge variant="outline" className="gap-1">
                <Bookmark className="h-3 w-3" />
                Saved
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Card className="h-full border-border/60 bg-card/60 hover:border-primary/50 transition-colors">
      <div className="relative aspect-[16/9] bg-muted/30 overflow-hidden rounded-t-lg">
        <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
          Image Placeholder
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-foreground/5 via-transparent to-transparent" />
      </div>

      <CardContent className="pt-6 space-y-4 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary"
            >
              {article.source}
            </Badge>
            <span>{formatPublished(article.publishedDaysAgo)}</span>
          </div>
          <div className="flex items-center gap-3">
            {article.trending && (
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="h-3 w-3" />
                Trending
              </span>
            )}
            {article.saved && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Bookmark className="h-3 w-3" />
                Saved
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight">{article.title}</h3>
          <p className="text-sm text-muted-foreground">{article.excerpt}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-muted text-foreground">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="text-xs text-muted-foreground">{article.category}</span>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={article.href} target="_blank" rel="noreferrer">
              Read
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

