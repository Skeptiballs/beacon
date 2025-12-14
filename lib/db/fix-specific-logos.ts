import { db, schema } from "./index";
import { eq, like } from "drizzle-orm";

/**
 * Try to fetch a better logo by scraping common logo locations on the website
 */
async function findLogoOnWebsite(website: string): Promise<string | null> {
  if (!website) return null;

  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Portstack-Agent/1.0",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    // Common logo patterns in HTML - prioritize logo-specific images
    const logoPatterns = [
      // Logo in img with class/id containing "logo" (most specific)
      /<img[^>]*(?:class|id|alt)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
      // SVG logos (usually better quality)
      /<img[^>]*src=["']([^"']*\.svg[^"']*)["']/i,
      // Apple touch icon (usually square logo)
      /<link\s+rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
      // Standard favicon
      /<link\s+rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
      // Open Graph image (but filter out banners)
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      // Twitter card image
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
    ];

    const foundLogos: Array<{ url: string; priority: number }> = [];

    for (let i = 0; i < logoPatterns.length; i++) {
      const pattern = logoPatterns[i];
      const matches = html.matchAll(new RegExp(pattern, 'gi'));
      
      for (const match of matches) {
        if (match[1]) {
          let logoUrl = match[1];
          
          // Convert relative URLs to absolute
          if (logoUrl.startsWith("//")) {
            logoUrl = `https:${logoUrl}`;
          } else if (logoUrl.startsWith("/")) {
            const baseUrl = new URL(url);
            logoUrl = `${baseUrl.origin}${logoUrl}`;
          } else if (!logoUrl.startsWith("http")) {
            const baseUrl = new URL(url);
            logoUrl = `${baseUrl.origin}/${logoUrl}`;
          }

          // Filter out banner images (check for dimensions in URL)
          if (logoUrl.match(/[wW]_?\d{4,}|[hH]_?\d{4,}|width[=:]\d{4,}|height[=:]\d{4,}/)) {
            continue; // Skip banner images
          }

          // Validate it's an image URL
          if (logoUrl.match(/\.(png|jpg|jpeg|svg|webp|gif)/i) || logoUrl.includes("logo") || logoUrl.includes("icon")) {
            // Priority: earlier patterns are better (logo-specific > generic)
            foundLogos.push({ url: logoUrl, priority: i });
          }
        }
      }
    }

    // Return the highest priority logo found
    if (foundLogos.length > 0) {
      foundLogos.sort((a, b) => a.priority - b.priority);
      return foundLogos[0].url;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fix logos for specific companies
 */
async function fixSpecificCompanyLogos() {
  console.log("Fixing logos for specific companies...\n");

  // Find companies by name
  const actualIT = db
    .select()
    .from(schema.companies)
    .where(like(schema.companies.name, "%Actual IT%"))
    .all();

  const awakeAI = db
    .select()
    .from(schema.companies)
    .where(like(schema.companies.name, "%Awake%"))
    .all();

  const companiesToFix = [...actualIT, ...awakeAI];

  if (companiesToFix.length === 0) {
    console.log("No companies found to fix.");
    return;
  }

  console.log(`Found ${companiesToFix.length} companies to fix:\n`);

  for (const company of companiesToFix) {
    console.log(`Processing: ${company.name}`);
    console.log(`  Current logo: ${company.logo_url || "None"}`);
    console.log(`  Website: ${company.website || "None"}`);

    if (!company.website) {
      console.log(`  ✗ No website, skipping\n`);
      continue;
    }

    // Try to find logo on website
    const websiteLogo = await findLogoOnWebsite(company.website);
    
    if (websiteLogo) {
      db.update(schema.companies)
        .set({
          logo_url: websiteLogo,
          updated_at: new Date().toISOString(),
        })
        .where(eq(schema.companies.id, company.id))
        .run();
      
      console.log(`  ✓ Found logo on website: ${websiteLogo}\n`);
    } else {
      // Try Clearbit with better detection
      try {
        const domain = new URL(
          company.website.startsWith("http") 
            ? company.website 
            : `https://${company.website}`
        ).hostname.replace(/^www\./, "");
        
        const clearbitUrl = `https://logo.clearbit.com/${domain}`;
        const response = await fetch(clearbitUrl, {
          headers: { "User-Agent": "Portstack-Agent/1.0" },
        });
        
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          if (buffer.length > 500) { // More lenient check
            db.update(schema.companies)
              .set({
                logo_url: clearbitUrl,
                updated_at: new Date().toISOString(),
              })
              .where(eq(schema.companies.id, company.id))
              .run();
            
            console.log(`  ✓ Using Clearbit: ${clearbitUrl}\n`);
            continue;
          }
        }
      } catch (error) {
        // Continue to favicon fallback
      }

      // Fallback: Use Google favicon but with better size
      const domain = new URL(
        company.website.startsWith("http") 
          ? company.website 
          : `https://${company.website}`
      ).hostname;
      
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
      
      db.update(schema.companies)
        .set({
          logo_url: faviconUrl,
          updated_at: new Date().toISOString(),
        })
        .where(eq(schema.companies.id, company.id))
        .run();
      
      console.log(`  ✓ Updated to larger favicon: ${faviconUrl}\n`);
    }

    // Small delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("Done!");
}

// Run the script
if (require.main === module) {
  fixSpecificCompanyLogos()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { fixSpecificCompanyLogos };

