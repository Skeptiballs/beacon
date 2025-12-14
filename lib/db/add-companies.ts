import { db, schema } from "./index";
import { eq } from "drizzle-orm";
import { fetchLogoUrl } from "./fetch-logos";

async function addCompanies() {
  console.log("Adding sea.ai and captain.ai to the database...\n");

  const companiesToAdd = [
    {
      name: "sea.ai",
      website: "https://sea.ai",
      linkedin_url: "https://linkedin.com/company/sea-ai",
      summary: "AI-powered maritime technology solutions",
    },
    {
      name: "captain.ai",
      website: "https://captainai.com",
      linkedin_url: "https://linkedin.com/company/captain-ai",
      summary: "AI-driven maritime operations and navigation solutions",
    },
  ];

  for (const companyData of companiesToAdd) {
    // Check if company already exists
    const existing = db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.name, companyData.name))
      .all();

    if (existing.length > 0) {
      console.log(`⚠ ${companyData.name} already exists in database (ID: ${existing[0].id})`);
      continue;
    }

    // Fetch logo
    console.log(`Fetching logo for ${companyData.name}...`);
    const logoUrl = await fetchLogoUrl(companyData.website, companyData.name);

    // Insert company
    const newCompany = db
      .insert(schema.companies)
      .values({
        name: companyData.name,
        website: companyData.website,
        linkedin_url: companyData.linkedin_url,
        logo_url: logoUrl,
        summary: companyData.summary,
      })
      .returning()
      .get();

    console.log(`✓ Added ${companyData.name} (ID: ${newCompany.id})`);
    if (logoUrl) {
      console.log(`  Logo: ${logoUrl}`);
    }

    // Small delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\nDone!");
}

// Run the script
if (require.main === module) {
  addCompanies()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { addCompanies };

