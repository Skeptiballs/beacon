import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { normalizeEmployeeRange } from "@/lib/employees";
import { CategoryCode, CompanyResponse, RegionCode } from "@/lib/types";

function toCompanyResponse(
  company: typeof schema.companies.$inferSelect,
  regions: string[],
  categories: string[]
): CompanyResponse {
  return {
    id: company.id,
    name: company.name,
    website: company.website,
    linkedin_url: company.linkedin_url,
    logo_url: company.logo_url,
    hq_country: company.hq_country,
    hq_city: company.hq_city,
    categories: categories as CategoryCode[],
    summary: company.summary,
    employees: normalizeEmployeeRange(company.employees) || null,
    regions: regions as RegionCode[],
    starred: !!company.starred,
    created_at: company.created_at,
    updated_at: company.updated_at,
  };
}

// PATCH /api/companies/[id]/star - Toggle a company's starred flag
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid company ID" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));

    if (typeof body.starred !== "boolean") {
      return NextResponse.json(
        { error: "Request body must include starred: boolean" },
        { status: 400 }
      );
    }

    const existingCompany = db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, id))
      .get();

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const updatedCompany = db
      .update(schema.companies)
      .set({
        starred: body.starred,
        updated_at: new Date().toISOString(),
      })
      .where(eq(schema.companies.id, id))
      .returning()
      .get();

    const regions = db
      .select()
      .from(schema.companyRegions)
      .where(eq(schema.companyRegions.company_id, id))
      .all()
      .map((r) => r.region);

    const categories = db
      .select()
      .from(schema.companyCategories)
      .where(eq(schema.companyCategories.company_id, id))
      .all()
      .map((c) => c.category);

    return NextResponse.json(
      toCompanyResponse(updatedCompany, regions, categories)
    );
  } catch (error) {
    console.error("Error toggling company starred state:", error);
    return NextResponse.json(
      { error: "Failed to update company star" },
      { status: 500 }
    );
  }
}




