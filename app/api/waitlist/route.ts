import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/waitlist - Add email to waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = db
      .select()
      .from(schema.waitlist)
      .where(eq(schema.waitlist.email, email))
      .get();

    if (existing) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 409 }
      );
    }

    // Insert new waitlist entry
    const entry = db
      .insert(schema.waitlist)
      .values({
        email,
      })
      .returning()
      .get();

    return NextResponse.json(
      { success: true, email: entry.email, created_at: entry.created_at },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    return NextResponse.json(
      { error: "Failed to add email to waitlist" },
      { status: 500 }
    );
  }
}



