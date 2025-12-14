import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, like, or, and } from "drizzle-orm";
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

// GET /api/companies - List companies with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const region = searchParams.get("region") as RegionCode | null;
    const category = searchParams.get("category") as CategoryCode | null;
    const hq_country = searchParams.get("hq_country");
    const employees = searchParams.get("employees");
    const starredParam = searchParams.get("starred");
    const starred =
      starredParam === null
        ? null
        : starredParam === "true" || starredParam === "1"
        ? true
        : starredParam === "false" || starredParam === "0"
        ? false
        : null;

    // Build base query conditions
    const conditions = [];

    // Search filter (name or summary)
    if (search) {
      conditions.push(
        or(
          like(schema.companies.name, `%${search}%`),
          like(schema.companies.summary, `%${search}%`)
        )
      );
    }

    // HQ country filter (supports comma-separated countries - expects 3-letter ISO codes)
    if (hq_country) {
      const countries = hq_country.split(",").map(c => c.trim().toUpperCase());
      if (countries.length === 1) {
        conditions.push(eq(schema.companies.hq_country, countries[0]));
      } else {
        conditions.push(
          or(...countries.map(c => eq(schema.companies.hq_country, c)))
        );
      }
    }

    if (employees) {
      conditions.push(eq(schema.companies.employees, normalizeEmployeeRange(employees)));
    }

    if (starred !== null) {
      conditions.push(eq(schema.companies.starred, starred));
    }

    // Get companies with conditions
    let companiesQuery = db.select().from(schema.companies);
    
    if (conditions.length > 0) {
      companiesQuery = companiesQuery.where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      ) as typeof companiesQuery;
    }

    const companiesList = await companiesQuery.all();

    // Get all regions
    const allRegions = await db.select().from(schema.companyRegions).all();

    // Get all categories
    const allCategories = await db.select().from(schema.companyCategories).all();

    // Group regions by company
    const regionsByCompany = new Map<number, string[]>();
    for (const r of allRegions) {
      const existing = regionsByCompany.get(r.company_id) || [];
      existing.push(r.region);
      regionsByCompany.set(r.company_id, existing);
    }

    // Group categories by company
    const categoriesByCompany = new Map<number, string[]>();
    for (const c of allCategories) {
      const existing = categoriesByCompany.get(c.company_id) || [];
      existing.push(c.category);
      categoriesByCompany.set(c.company_id, existing);
    }

    // Transform to response format
    let result = companiesList.map((company) =>
      toCompanyResponse(
        company,
        regionsByCompany.get(company.id) || [],
        categoriesByCompany.get(company.id) || []
      )
    );

    // Apply region filter after joining (since it's a many-to-many)
    if (region) {
      result = result.filter((c) => c.regions.includes(region));
    }

    // Apply category filter after joining (since it's a many-to-many)
    if (category) {
      result = result.filter((c) => c.categories.includes(category));
    }

    return NextResponse.json({
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
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

    // Normalize employees into supported ranges
    const employees = normalizeEmployeeRange(
      typeof body.employees === "string" ? body.employees : undefined
    );

    const starredValue = typeof body.starred === "boolean" ? body.starred : false;

    // Insert company
    const newCompany = await db
      .insert(schema.companies)
      .values({
        name: body.name.trim(),
        website: body.website || null,
        linkedin_url: body.linkedin_url || null,
        logo_url: body.logo_url || null,
        hq_country: body.hq_country ? body.hq_country.toUpperCase() : null,
        hq_city: body.hq_city || null,
        summary: body.summary || null,
        employees: employees || null,
        starred: starredValue,
      })
      .returning()
      .get();

    // Insert regions if provided
    const regions: string[] = body.regions || [];
    for (const region of regions) {
      await db.insert(schema.companyRegions)
        .values({
          company_id: newCompany.id,
          region,
        })
        .run();
    }

    // Insert categories if provided
    const categories: string[] = body.categories || [];
    for (const category of categories) {
      await db.insert(schema.companyCategories)
        .values({
          company_id: newCompany.id,
          category,
        })
        .run();
    }

    return NextResponse.json(toCompanyResponse(newCompany, regions, categories), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}

