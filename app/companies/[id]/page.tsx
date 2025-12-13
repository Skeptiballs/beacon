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
import { getCategoryLabel } from "@/lib/categories";
import { getRegionLabel } from "@/lib/regions";
import { getEmployeeRangeLabel } from "@/lib/employees";
import { CategoryCode, RegionCode } from "@/lib/types";
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
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
      {/* Header with back button and company name */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <nav className="text-sm text-muted-foreground">
          <Link href="/companies" className="hover:text-foreground">
            Companies
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{company.name}</span>
        </nav>
      </div>

      {/* Company header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 overflow-hidden">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <Building2 className={`w-8 h-8 text-primary ${company.logo_url ? "hidden" : ""}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-muted-foreground">
              {company.hq_country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
              {company.hq_city && `${company.hq_city}, `}
              {company.hq_country}
            </span>
          )}
          {company.categories && company.categories.length > 0 && (
            <div className="flex items-center gap-1">
              {company.categories.map((category) => (
                <Badge key={category} variant="outline" className="font-mono text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </Button>
            </a>
          )}
          {company.linkedin_url && (
            <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {company.website && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Website</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                      >
                        {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {company.linkedin_url && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">LinkedIn</span>
                      <a
                        href={company.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                      >
                        View Profile
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {company.hq_country && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Headquarters</span>
                      <span className="text-sm">
                        {company.hq_city && `${company.hq_city}, `}
                        {company.hq_country}
                      </span>
                    </div>
                  )}
                  {company.categories && company.categories.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Categories</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {company.categories.map((category) => (
                          <Badge key={category} variant="outline" className="font-mono text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.employees && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Employees</span>
                      <span className="text-sm flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {getEmployeeRangeLabel(company.employees) || company.employees}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {company.summary ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {company.summary}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No summary available for this company.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Globe className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{company.regions.length}</p>
                    <p className="text-xs text-muted-foreground">Regions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{noteCount}</p>
                    <p className="text-xs text-muted-foreground">Notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Interactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {new Date(company.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground">Added</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Geographic Presence</CardTitle>
              <CardDescription>
                Regions where {company.name} operates or has presence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {company.regions.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {company.regions.map((region) => (
                    <div
                      key={region}
                      className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{region}</p>
                        <p className="text-sm text-muted-foreground">
                          {getRegionLabel(region as RegionCode)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No regions specified for this company.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab (Placeholder) */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription>
                Keep track of important information about {company.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-3 mb-6">
                <label className="text-sm font-medium text-foreground" htmlFor="note-content">
                  Add a note
                </label>
                <textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write a quick note about this company..."
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={createNote.isPending}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!noteContent.trim() || createNote.isPending}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {createNote.isPending ? "Saving..." : "Add Note"}
                  </Button>
                </div>
              </form>

              {notesLoading ? (
                <div className="space-y-3">
                  <div className="h-20 rounded-md bg-muted animate-pulse" />
                  <div className="h-20 rounded-md bg-muted animate-pulse" />
                </div>
              ) : notesError ? (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  Failed to load notes. Please try again.
                </div>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => {
                    const isEditing = editingNoteId === note.id;
                    return (
                      <div
                        key={note.id}
                        className="rounded-lg border border-border/60 bg-card/60 p-4 space-y-3"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              disabled={updateNote.isPending}
                            />
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={updateNote.isPending}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleSaveEdit(note.id)}
                                disabled={!editingContent.trim() || updateNote.isPending}
                                className="gap-2"
                              >
                                {updateNote.isPending ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {note.content}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {new Date(note.created_at).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                          {!isEditing && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleStartEdit(note.id, note.content)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={deleteNote.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm">No notes yet. Add your first note above.</p>
                </div>
              )}

              <AlertDialog open={deleteNoteId !== null} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The note will be permanently removed.
                      {deletingNote && (
                        <div className="mt-3 rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground whitespace-pre-line">
                          {deletingNote.content.length > 200
                            ? `${deletingNote.content.slice(0, 200)}…`
                            : deletingNote.content}
                        </div>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteNote.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDeleteNote}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteNote.isPending}
                    >
                      {deleteNote.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab (Placeholder) */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
              <CardDescription>
                Recent activity and interactions with {company.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 rounded-full bg-muted mb-4">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No activity recorded</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Activity tracking coming soon. You&apos;ll see a timeline of all interactions here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainShell>
  );
}

