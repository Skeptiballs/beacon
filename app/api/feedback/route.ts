import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";
import { z } from "zod";

const feedbackSchema = z.object({
  type: z.enum(["missing_company", "feature_request", "bug", "other"]),
  content: z.string().min(1, "Content is required"),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    await db.insert(feedback).values({
      type: validatedData.type,
      content: validatedData.content,
      email: validatedData.email || null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

