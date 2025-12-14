import { db, schema } from "./index";
import { eq, isNull } from "drizzle-orm";

/**
 * Fetch logo URL for a company using Clearbit Logo API
 * Falls back to Google Favicon service if Clearbit fails
 */
async function fetchLogoUrl(website?: string | null, companyName?: string): Promise<string | null> {
  if (!website) return null;

  try {
    // Try Clearbit first (most reliable for high-quality logos)
    const domain = new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, "");
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    
    // Fetch the image to check if it's a real logo (not a placeholder)
    const response = await fetch(clearbitUrl, { 
      headers: {
        "User-Agent": "Portstack-Agent/1.0",
      },
    });
    
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      const contentLength = response.headers.get("content-length");
      
      // Clearbit returns real logos with image content-type and reasonable size
      // Placeholders are usually very small or have different content-type
      if (contentType?.startsWith("image/") && contentLength && parseInt(contentLength) > 1000) {
        return clearbitUrl;
      }
    }
  } catch (error) {
    // Silently fall through to favicon
  }

  // Fallback: Try Google Favicon service (less reliable but works for most sites)
  try {
    const domain = new URL(website.startsWith("http") ? website : `https://${website}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    console.warn(`Favicon fallback failed for ${website}:`, error);
  }

  return null;
}

/**
 * Fetch and update logo URLs for companies that don't have them
 */
async function fetchLogosForCompanies(limit: number = 5) {
  console.log(`Fetching logos for ${limit} companies...\n`);

  // Get companies without logos that have websites
  const companiesWithoutLogos = db
    .select()
    .from(schema.companies)
    .where(
      isNull(schema.companies.logo_url)
    )
    .all()
    .filter((c) => c.website) // Only companies with websites
    .slice(0, limit);

  if (companiesWithoutLogos.length === 0) {
    console.log("No companies found without logos.");
    return;
  }

  console.log(`Found ${companiesWithoutLogos.length} companies to process:\n`);

  const results: Array<{
    id: number;
    name: string;
    website: string | null;
    logoUrl: string | null;
    success: boolean;
  }> = [];

  for (const company of companiesWithoutLogos) {
    console.log(`Processing: ${company.name} (${company.website})`);
    
    const logoUrl = await fetchLogoUrl(company.website, company.name);
    
    if (logoUrl) {
      // Update the company with the logo URL
      db.update(schema.companies)
        .set({ 
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .where(eq(schema.companies.id, company.id))
        .run();

      console.log(`  ✓ Found logo: ${logoUrl}`);
      results.push({
        id: company.id,
        name: company.name,
        website: company.website,
        logoUrl,
        success: true,
      });
    } else {
      console.log(`  ✗ No logo found`);
      results.push({
        id: company.id,
        name: company.name,
        website: company.website,
        logoUrl: null,
        success: false,
      });
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n=== Results ===");
  console.log(`Successfully fetched: ${results.filter((r) => r.success).length}`);
  console.log(`Failed: ${results.filter((r) => !r.success).length}\n`);

  console.log("Updated companies:");
  results.forEach((result) => {
    if (result.success) {
      console.log(`  ✓ ${result.name}: ${result.logoUrl}`);
    } else {
      console.log(`  ✗ ${result.name}: No logo available`);
    }
  });

  return results;
}

// Run the script
if (require.main === module) {
  const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 5;
  fetchLogosForCompanies(limit)
    .then(() => {
      console.log("\nDone!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { fetchLogosForCompanies, fetchLogoUrl };

