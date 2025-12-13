import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

const MAX_NOTE_LENGTH = 2000;

function parseIds(params: { id: string; noteId: string }) {
  const companyId = Number(params.id);
  const noteId = Number(params.noteId);
  if (Number.isNaN(companyId) || Number.isNaN(noteId)) {
    return null;
  }
  return { companyId, noteId };
}

// PATCH /api/companies/[id]/notes/[noteId] - update note content
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  const ids = parseIds(params);
  if (!ids) {
    return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
  }

  const { companyId, noteId } = ids;

  const body = await request.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "Note content is required" }, { status: 400 });
  }

  if (content.length > MAX_NOTE_LENGTH) {
    return NextResponse.json(
      { error: `Note content must be ${MAX_NOTE_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  // Ensure note exists and belongs to company
  const existing = db
    .select()
    .from(schema.companyNotes)
    .where(eq(schema.companyNotes.id, noteId))
    .get();

  if (!existing || existing.company_id !== companyId) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const updated = db
    .update(schema.companyNotes)
    .set({
      content,
      created_at: existing.created_at, // keep original timestamp
    })
    .where(eq(schema.companyNotes.id, noteId))
    .returning()
    .get();

  return NextResponse.json(updated);
}

// DELETE /api/companies/[id]/notes/[noteId] - delete a note
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  const ids = parseIds(params);
  if (!ids) {
    return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
  }

  const { companyId, noteId } = ids;

  // Ensure note exists and belongs to company
  const existing = db
    .select()
    .from(schema.companyNotes)
    .where(eq(schema.companyNotes.id, noteId))
    .get();

  if (!existing || existing.company_id !== companyId) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  db.delete(schema.companyNotes).where(eq(schema.companyNotes.id, noteId)).run();

  return NextResponse.json({ success: true, id: noteId });
}


