import { db, schema } from "./index";
import { eq, like } from "drizzle-orm";
import { fetchLogoUrl } from "./fetch-logos";

async function fixCaptainWebsite() {
  console.log("Fixing captain.ai website URL...\n");

  // Get all companies and find captain.ai
  const allCompanies = db.select().from(schema.companies).all();
  const captain = allCompanies.filter(c => 
    c.name.toLowerCase().includes("captain") || 
    (c.website && c.website.toLowerCase().includes("captain"))
  );

  if (captain.length === 0) {
    console.log("Captain.ai not found in database.");
    console.log("Available companies (last 5):");
    allCompanies.slice(-5).forEach(c => {
      console.log(`  - ${c.name} (${c.website || "no website"})`);
    });
    return;
  }

  const company = captain[0];
  console.log(`Found: ${company.name} (ID: ${company.id})`);
  console.log(`Current website: ${company.website}`);

  const newWebsite = "https://captainai.com";
  
  // Fetch new logo with correct website
  console.log(`Fetching logo for ${newWebsite}...`);
  const logoUrl = await fetchLogoUrl(newWebsite, company.name);

  // Update company
  db.update(schema.companies)
    .set({
      website: newWebsite,
      logo_url: logoUrl || company.logo_url,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.companies.id, company.id))
    .run();

  console.log(`✓ Updated website to: ${newWebsite}`);
  if (logoUrl) {
    console.log(`✓ Updated logo to: ${logoUrl}`);
  }

  console.log("\nDone!");
}

// Run the script
if (require.main === module) {
  fixCaptainWebsite()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { fixCaptainWebsite };

