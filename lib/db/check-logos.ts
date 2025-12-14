import { db, schema } from "./index";

/**
 * Check which companies have logos and categorize them by source
 */
async function checkLogos() {
  console.log("Analyzing company logos...\n");

  // Get all companies with logos
  const allCompanies = db
    .select()
    .from(schema.companies)
    .all();

  const companiesWithLogos = allCompanies.filter((c) => c.logo_url);
  const companiesWithoutLogos = allCompanies.filter((c) => !c.logo_url && c.website);
  const companiesWithoutWebsite = allCompanies.filter((c) => !c.website);

  console.log(`Total companies: ${allCompanies.length}`);
  console.log(`Companies with logos: ${companiesWithLogos.length}`);
  console.log(`Companies without logos (but have website): ${companiesWithoutLogos.length}`);
  console.log(`Companies without website: ${companiesWithoutWebsite.length}\n`);

  // Categorize logo sources
  const clearbitLogos: Array<{ id: number; name: string; logo_url: string }> = [];
  const googleFaviconLogos: Array<{ id: number; name: string; logo_url: string; website: string | null }> = [];
  const otherLogos: Array<{ id: number; name: string; logo_url: string }> = [];

  for (const company of companiesWithLogos) {
    const logoUrl = company.logo_url!;
    
    if (logoUrl.includes("logo.clearbit.com")) {
      clearbitLogos.push({
        id: company.id,
        name: company.name,
        logo_url: logoUrl,
      });
    } else if (logoUrl.includes("google.com/s2/favicons")) {
      googleFaviconLogos.push({
        id: company.id,
        name: company.name,
        logo_url: logoUrl,
        website: company.website,
      });
    } else {
      otherLogos.push({
        id: company.id,
        name: company.name,
        logo_url: logoUrl,
      });
    }
  }

  console.log("=== Logo Source Breakdown ===");
  console.log(`Clearbit logos (high quality): ${clearbitLogos.length}`);
  console.log(`Google favicon logos (fallback): ${googleFaviconLogos.length}`);
  console.log(`Other sources: ${otherLogos.length}\n`);

  if (googleFaviconLogos.length > 0) {
    console.log("=== Companies Using Google Favicon (May Need Better Logos) ===\n");
    googleFaviconLogos.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   Website: ${company.website || "N/A"}`);
      console.log(`   Current logo: ${company.logo_url}`);
      console.log("");
    });
  }

  if (clearbitLogos.length > 0) {
    console.log(`\n=== Companies with Clearbit Logos (${clearbitLogos.length}) ===`);
    console.log("These have high-quality logos from Clearbit.\n");
  }

  if (otherLogos.length > 0) {
    console.log(`\n=== Companies with Other Logo Sources (${otherLogos.length}) ===`);
    otherLogos.forEach((company) => {
      console.log(`- ${company.name}: ${company.logo_url}`);
    });
  }

  if (companiesWithoutLogos.length > 0) {
    console.log(`\n=== Companies Without Logos (Have Website) ===`);
    companiesWithoutLogos.slice(0, 10).forEach((company) => {
      console.log(`- ${company.name}: ${company.website}`);
    });
    if (companiesWithoutLogos.length > 10) {
      console.log(`... and ${companiesWithoutLogos.length - 10} more`);
    }
  }

  return {
    total: allCompanies.length,
    withLogos: companiesWithLogos.length,
    withoutLogos: companiesWithoutLogos.length,
    clearbit: clearbitLogos.length,
    googleFavicon: googleFaviconLogos.length,
    other: otherLogos.length,
    googleFaviconList: googleFaviconLogos,
  };
}

// Run the script
if (require.main === module) {
  checkLogos()
    .then(() => {
      console.log("\nDone!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { checkLogos };

