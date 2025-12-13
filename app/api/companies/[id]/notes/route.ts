import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

const MAX_NOTE_LENGTH = 2000;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  // Ensure company exists
  const company = db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.id, id))
    .get();

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const notes = db
    .select()
    .from(schema.companyNotes)
    .where(eq(schema.companyNotes.company_id, id))
    .orderBy(desc(schema.companyNotes.created_at))
    .all();

  return NextResponse.json(notes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

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

  // Ensure company exists
  const company = db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.id, id))
    .get();

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const note = db
    .insert(schema.companyNotes)
    .values({
      company_id: id,
      content,
    })
    .returning()
    .get();

  return NextResponse.json(note, { status: 201 });
}


