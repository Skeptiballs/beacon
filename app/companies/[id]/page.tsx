"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useCompany,
  useCompanyNotes,
  useCreateCompanyNote,
  useUpdateCompanyNote,
  useDeleteCompanyNote,
} from "@/hooks/useCompanies";
import { MainShell } from "@/components/layout/MainShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { RelatedCompaniesCarousel } from "@/components/companies/RelatedCompaniesCarousel";
import { getRegionLabel } from "@/lib/regions";
import { RegionCode } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Globe,
  Linkedin,
  MapPin,
  Users,
  FileText,
  Clock,
  Share2,
  Star,
  MoreHorizontal,
  LayoutGrid,
  List,
  MessageSquareText
} from "lucide-react";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = Number(params.id);
  
  const { data: company, isLoading, error } = useCompany(companyId);
  const { data: notes, isLoading: notesLoading, error: notesError } = useCompanyNotes(companyId);
  const createNote = useCreateCompanyNote(companyId);
  const updateNote = useUpdateCompanyNote(companyId);
  const deleteNote = useDeleteCompanyNote(companyId);
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null);

  const noteCount = notes?.length ?? 0;

  const handleAddNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = noteContent.trim();
    if (!content) return;
    createNote.mutate(
      { content },
      {
        onSuccess: () => setNoteContent(""),
      }
    );
  };

  const handleStartEdit = (id: number, content: string) => {
    setEditingNoteId(id);
    setEditingContent(content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const handleSaveEdit = (noteId: number) => {
    const content = editingContent.trim();
    if (!content) return;
    updateNote.mutate(
      { noteId, content },
      {
        onSuccess: () => {
          handleCancelEdit();
        },
      }
    );
  };

  const handleDeleteNote = (noteId: number) => {
    setDeleteNoteId(noteId);
  };

  const confirmDeleteNote = () => {
    if (!deleteNoteId) return;
    deleteNote.mutate(
      { noteId: deleteNoteId },
      {
        onSettled: () => setDeleteNoteId(null),
      }
    );
  };

  if (isLoading) {
    return (
      <MainShell>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
          <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </MainShell>
    );
  }

  if (error || !company) {
    return (
      <MainShell>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Company not found</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            The company you&apos;re looking for doesn&apos;t exist or has been deleted.
            <div className="mt-4">
              <Link href="/companies">
                <Button>Back to Companies</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </MainShell>
    );
  }

  return (
    <MainShell className="bg-muted/10 min-h-[calc(100vh-3.5rem)]">
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/80" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <nav className="text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/companies" className="hover:text-foreground transition-colors">
            Companies
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{company.name}</span>
        </nav>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: Company Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 sticky top-24">
          <Card className="overflow-hidden border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <div className="h-28 bg-gradient-to-br from-emerald-500/10 via-background to-blue-500/10 border-b border-border/40 relative">
               {/* Quick Actions overlay on header */}
               <div className="absolute top-3 right-3 flex gap-1">
                 <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-yellow-500 backdrop-blur-sm">
                   <Star className={`h-4 w-4 ${company.starred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 hover:bg-background/80 text-muted-foreground backdrop-blur-sm">
                   <MoreHorizontal className="h-4 w-4" />
                 </Button>
               </div>
            </div>
            
            <CardContent className="px-6 pb-6 relative">
              {/* Logo */}
              <div className="absolute -top-14 left-6">
                <div className="flex items-center justify-center w-28 h-28 rounded-2xl bg-background border border-border/60 shadow-sm overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-muted-foreground/40" />
                  )}
                </div>
              </div>

              {/* Spacing for logo overlap */}
              <div className="pt-16 space-y-5">
                
                {/* Header Info */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{company.name}</h1>
                  {company.hq_country && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {company.hq_city && `${company.hq_city}, `}
                        {company.hq_country}
                      </span>
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                   {company.categories?.map((cat) => (
                      <Badge key={cat} variant="secondary" className="font-normal bg-secondary/50 hover:bg-secondary">
                        {cat}
                      </Badge>
                    ))}
                </div>

                <Separator className="bg-border/60" />

                {/* External Links */}
                <div className="space-y-3">
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-500 transition-colors group p-2 -mx-2 rounded-md hover:bg-emerald-500/5"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50 group-hover:bg-emerald-500/10 transition-colors">
                        <Globe className="h-4 w-4" />
                      </div>
                      <span className="flex-1 truncate font-medium">Website</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {company.linkedin_url && (
                    <a 
                      href={company.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-blue-500 transition-colors group p-2 -mx-2 rounded-md hover:bg-blue-500/5"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50 group-hover:bg-blue-500/10 transition-colors">
                        <Linkedin className="h-4 w-4" />
                      </div>
                      <span className="flex-1 truncate font-medium">LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>

                <Separator className="bg-border/60" />

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Employees</span>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {company.employees || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Added</span>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {new Date(company.created_at).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Content Tabs */}
        <div className="lg:col-span-8 xl:col-span-9">
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="border-b border-border/60">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0 space-x-8">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 rounded-none px-0 pb-3 gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="regions" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 rounded-none px-0 pb-3 gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Regions
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 rounded-none px-0 pb-3 gap-2"
                >
                  <MessageSquareText className="h-4 w-4" />
                  Notes 
                  {noteCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                      {noteCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
              {/* About Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground/90">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <h2>About</h2>
                </div>
                <Card className="border-border/60 bg-card/50">
                  <CardContent className="pt-6">
                    {company.summary ? (
                      <p className="leading-relaxed text-muted-foreground/90 text-sm md:text-base">
                        {company.summary}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
                        <FileText className="h-8 w-8 opacity-20" />
                        <p className="italic">No summary available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* Related Companies Carousel */}
              <section className="space-y-4">
                <RelatedCompaniesCarousel 
                  companyId={company.id} 
                  category={company.categories?.[0]} 
                />
              </section>
            </TabsContent>

            {/* Regions Tab */}
            <TabsContent value="regions" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {company.regions.length > 0 ? (
                  company.regions.map((region) => (
                    <Card key={region} className="group border-border/60 hover:border-emerald-500/50 transition-all hover:shadow-md bg-card/50">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{region}</p>
                          <p className="text-sm text-muted-foreground">
                            {getRegionLabel(region as RegionCode)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                   <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                      <Globe className="h-10 w-10 mb-4 opacity-20" />
                      <p>No regions specified.</p>
                   </div>
                )}
               </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
              <div className="grid gap-6">
                {/* Note Input */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                     <CardTitle className="text-base font-medium flex items-center gap-2">
                        <MessageSquareText className="h-4 w-4 text-emerald-500" />
                        New Note
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <form onSubmit={handleAddNote} className="space-y-3">
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Write a private note for your team..."
                        className="w-full min-h-[100px] rounded-lg border border-input bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 resize-y placeholder:text-muted-foreground/50 transition-shadow"
                        disabled={createNote.isPending}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={!noteContent.trim() || createNote.isPending}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                          size="sm"
                        >
                           {createNote.isPending ? "Saving..." : "Save Note"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Notes Feed */}
                <div className="space-y-4">
                   <h3 className="text-sm font-medium text-muted-foreground pl-1">Recent Activity</h3>
                   
                   {notesLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : notes && notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note) => {
                         const isEditing = editingNoteId === note.id;
                         return (
                           <div key={note.id} className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-emerald-500/20">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="w-full min-h-[80px] rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  />
                                  <div className="flex justify-end gap-2">
                                     <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                                     <Button size="sm" onClick={() => handleSaveEdit(note.id)}>Save</Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                     <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-[10px] font-bold">
                                           You
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                           <span>added a note</span>
                                           <span className="w-1 h-1 rounded-full bg-border" />
                                           <span>
                                             {new Date(note.created_at).toLocaleString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit"
                                             })}
                                           </span>
                                        </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStartEdit(note.id, note.content)}>
                                         <FileText className="h-3.5 w-3.5" />
                                       </Button>
                                       <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                                         <Share2 className="h-3.5 w-3.5 rotate-180" />
                                       </Button>
                                     </div>
                                  </div>
                                  
                                  <div className="pl-8">
                                     <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                       {note.content}
                                     </p>
                                  </div>
                                </>
                              )}
                           </div>
                         );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                      <MessageSquareText className="h-10 w-10 mb-3 opacity-20" />
                      <p>No notes yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteNoteId !== null} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNote} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </MainShell>
  );
}
