import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { normalizeEmployeeRange } from "@/lib/employees";
import { CompanyResponse, RegionCode, CategoryCode } from "@/lib/types";

// Transform database company + regions to API response shape
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

// GET /api/companies/[id] - Get single company by ID
export async function GET(
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

    // Get company
    const company = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, id))
      .get();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Get regions for this company
    const regionsData = await db
      .select()
      .from(schema.companyRegions)
      .where(eq(schema.companyRegions.company_id, id))
      .all();
    const regions = regionsData.map((r) => r.region);

    // Get categories for this company
    const categoriesData = await db
      .select()
      .from(schema.companyCategories)
      .where(eq(schema.companyCategories.company_id, id))
      .all();
    const categories = categoriesData.map((c) => c.category);

    return NextResponse.json(toCompanyResponse(company, regions, categories));
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Update a company by ID
export async function PUT(
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

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Validate hq_country: must be 3 uppercase letters if provided
    if (body.hq_country) {
      const countryCode = body.hq_country.trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(countryCode)) {
        return NextResponse.json(
          { error: "HQ Country must be a 3-letter code (e.g., USA, GBR, NLD)" },
          { status: 400 }
        );
      }
      body.hq_country = countryCode;
    }

    // Check if company exists
    const existingCompany = await db
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

    // Normalize employees into supported ranges
    const employees = normalizeEmployeeRange(
      typeof body.employees === "string" ? body.employees : undefined
    );

    // Update company
    const updatedCompany = await db
      .update(schema.companies)
      .set({
        name: body.name.trim(),
        website: body.website || null,
        linkedin_url: body.linkedin_url || null,
        logo_url: body.logo_url || null,
        hq_country: body.hq_country ? body.hq_country.toUpperCase() : null,
        hq_city: body.hq_city || null,
        summary: body.summary || null,
        employees: employees || null,
        starred:
          typeof body.starred === "boolean"
            ? body.starred
            : existingCompany.starred,
        updated_at: new Date().toISOString(),
      })
      .where(eq(schema.companies.id, id))
      .returning()
      .get();

    // Delete existing regions and categories
    await db.delete(schema.companyRegions)
      .where(eq(schema.companyRegions.company_id, id))
      .run();

    await db.delete(schema.companyCategories)
      .where(eq(schema.companyCategories.company_id, id))
      .run();

    // Insert new regions if provided
    const regions: string[] = body.regions || [];
    for (const region of regions) {
      await db.insert(schema.companyRegions)
        .values({
          company_id: id,
          region,
        })
        .run();
    }

    // Insert new categories if provided
    const categories: string[] = body.categories || [];
    for (const category of categories) {
      await db.insert(schema.companyCategories)
        .values({
          company_id: id,
          category,
        })
        .run();
    }

    return NextResponse.json(toCompanyResponse(updatedCompany, regions, categories));
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Delete a company by ID
export async function DELETE(
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

    // Check if company exists
    const company = db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, id))
      .get();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Delete regions first (cascade should handle this, but being explicit)
    db.delete(schema.companyRegions)
      .where(eq(schema.companyRegions.company_id, id))
      .run();

    // Delete categories
    db.delete(schema.companyCategories)
      .where(eq(schema.companyCategories.company_id, id))
      .run();

    // Delete company
    db.delete(schema.companies)
      .where(eq(schema.companies.id, id))
      .run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}

