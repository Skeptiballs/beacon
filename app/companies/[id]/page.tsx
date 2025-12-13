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
import { Separator } from "@/components/ui/separator"; // Assuming Separator exists, if not I'll handle without
import { RelatedCompaniesCarousel } from "@/components/companies/RelatedCompaniesCarousel";
import { getRegionLabel } from "@/lib/regions";
import { getEmployeeRangeLabel } from "@/lib/employees";
import { RegionCode } from "@/lib/types";
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
  MessageSquare,
  Share2,
  Star,
  MoreHorizontal
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
  const deletingNote = deleteNoteId ? notes?.find((n) => n.id === deleteNoteId) : undefined;

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
    <MainShell>
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
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
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <div className="h-24 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-b border-border/40" />
            <CardContent className="px-6 pb-6 relative">
              {/* Logo */}
              <div className="absolute -top-12 left-6">
                <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-background border border-border shadow-sm overflow-hidden">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-muted-foreground/40" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-yellow-500">
                  <Star className={`h-4 w-4 ${company.starred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Basic Info */}
              <div className="mt-4 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
                  {company.hq_country && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>
                        {company.hq_city && `${company.hq_city}, `}
                        {company.hq_country}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                   {company.categories?.map((cat) => (
                      <Badge key={cat} variant="secondary" className="font-normal">
                        {cat}
                      </Badge>
                    ))}
                </div>

                <div className="pt-4 border-t border-border/50 space-y-3">
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-500 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-muted/50 group-hover:bg-emerald-500/10 transition-colors">
                        <Globe className="h-4 w-4" />
                      </div>
                      <span className="flex-1 truncate">Website</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {company.linkedin_url && (
                    <a 
                      href={company.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-blue-500 transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-muted/50 group-hover:bg-blue-500/10 transition-colors">
                        <Linkedin className="h-4 w-4" />
                      </div>
                      <span className="flex-1 truncate">LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-medium">Employees</span>
                    <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {company.employees || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-medium">Added</span>
                    <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
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
            <TabsList className="w-full justify-start h-12 bg-transparent p-0 border-b rounded-none space-x-6">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none px-0 pb-3"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="regions" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none px-0 pb-3"
              >
                Regions
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none px-0 pb-3"
              >
                Notes <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{noteCount}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* About Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  About
                </h3>
                <Card className="border-border/60">
                  <CardContent className="pt-6">
                    {company.summary ? (
                      <p className="leading-relaxed text-muted-foreground">
                        {company.summary}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">No summary available.</p>
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
            <TabsContent value="regions" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="grid gap-4 sm:grid-cols-2">
                {company.regions.length > 0 ? (
                  company.regions.map((region) => (
                    <Card key={region} className="border-border/60 hover:border-emerald-500/50 transition-colors">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
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
                   <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                      No regions specified.
                   </div>
                )}
               </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="border-border/60">
                <CardHeader>
                   <CardTitle>Internal Notes</CardTitle>
                   <CardDescription>Only visible to your team members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Note Input */}
                   <form onSubmit={handleAddNote} className="space-y-3">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write a note..."
                      className="w-full min-h-[100px] rounded-lg border border-input bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 resize-y"
                      disabled={createNote.isPending}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!noteContent.trim() || createNote.isPending}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                         {createNote.isPending ? "Saving..." : "Add Note"}
                      </Button>
                    </div>
                  </form>

                  <Separator />

                  {/* Notes List */}
                   {notesLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : notes && notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note) => {
                         const isEditing = editingNoteId === note.id;
                         return (
                           <div key={note.id} className="group relative rounded-lg border bg-card p-4 transition-all hover:shadow-sm hover:border-emerald-500/20">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  />
                                  <div className="flex justify-end gap-2">
                                     <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                                     <Button size="sm" onClick={() => handleSaveEdit(note.id)}>Save</Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="mb-2 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                    {note.content}
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3" />
                                      {new Date(note.created_at).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      })}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleStartEdit(note.id, note.content)}>
                                        <FileText className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                                        <Share2 className="h-3 w-3 rotate-180" /> {/* Using as delete icon placeholder or actual trash icon if imported */}
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                           </div>
                         );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      No notes yet. Start the conversation!
                    </div>
                  )}
                </CardContent>
              </Card>
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
