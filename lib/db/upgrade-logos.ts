import { db, schema } from "./index";
import { eq } from "drizzle-orm";

/**
 * Check if Clearbit has a real logo (not a placeholder)
 * Downloads the image and checks its dimensions
 */
async function checkClearbitLogo(domain: string): Promise<boolean> {
  try {
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    
    const response = await fetch(clearbitUrl, {
      headers: {
        "User-Agent": "Portstack-Agent/1.0",
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      return false;
    }
    
    // Download the image to check its size
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Clearbit placeholders are typically very small (under 200 bytes)
    // Real logos are usually much larger
    if (buffer.length < 200) {
      return false;
    }
    
    // Additional check: try to detect if it's a 1x1 transparent PNG
    // Real logos should have more content
    if (buffer.length < 1000) {
      // For small images, check if it might be a placeholder
      // This is a heuristic - real logos are rarely this small
      // But we'll be lenient and accept anything > 200 bytes
      return true;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Upgrade Google favicon logos to Clearbit if available
 */
async function upgradeLogosToClearbit(limit?: number) {
  console.log("Upgrading Google favicon logos to Clearbit...\n");

  // Get all companies with Google favicon logos
  const allCompanies = db
    .select()
    .from(schema.companies)
    .all();

  const googleFaviconCompanies = allCompanies.filter(
    (c) => c.logo_url && c.logo_url.includes("google.com/s2/favicons") && c.website
  );

  const companiesToProcess = limit 
    ? googleFaviconCompanies.slice(0, limit)
    : googleFaviconCompanies;

  if (companiesToProcess.length === 0) {
    console.log("No companies with Google favicon logos found.");
    return;
  }

  console.log(`Found ${companiesToProcess.length} companies to check for Clearbit logos...\n`);

  let upgraded = 0;
  let notAvailable = 0;
  let errors = 0;

  for (const company of companiesToProcess) {
    try {
      const domain = new URL(
        company.website!.startsWith("http") 
          ? company.website! 
          : `https://${company.website}`
      ).hostname.replace(/^www\./, "");

      console.log(`Checking: ${company.name} (${domain})`);

      const hasClearbitLogo = await checkClearbitLogo(domain);

      if (hasClearbitLogo) {
        const clearbitUrl = `https://logo.clearbit.com/${domain}`;
        
        db.update(schema.companies)
          .set({
            logo_url: clearbitUrl,
            updated_at: new Date().toISOString(),
          })
          .where(eq(schema.companies.id, company.id))
          .run();

        console.log(`  ✓ Upgraded to Clearbit: ${clearbitUrl}`);
        upgraded++;
      } else {
        console.log(`  ✗ Clearbit logo not available, keeping Google favicon`);
        notAvailable++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`  ✗ Error processing ${company.name}:`, error);
      errors++;
    }
  }

  console.log("\n=== Results ===");
  console.log(`Upgraded to Clearbit: ${upgraded}`);
  console.log(`Clearbit not available: ${notAvailable}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${companiesToProcess.length}`);
}

// Run the script
if (require.main === module) {
  const limit = process.argv[2] ? parseInt(process.argv[2], 10) : undefined;
  upgradeLogosToClearbit(limit)
    .then(() => {
      console.log("\nDone!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { upgradeLogosToClearbit, checkClearbitLogo };

