import { db } from "./index";
import { companies, companyRegions, companyCategories } from "./schema";

// Sample company data for the MVP
const sampleCompanies = [
  {
    name: "Tidalis",
    website: "https://tidalis.com",
    linkedin_url: "https://linkedin.com/company/tidalis",
    hq_country: "NLD",
    hq_city: "Rotterdam",
    categories: ["VTS"],
    summary:
      "Tidalis provides vessel traffic services and maritime traffic management solutions for ports and coastal authorities worldwide.",
    employees: "51-200",
    regions: ["EU", "AP", "NA"],
  },
  {
    name: "HENSOLDT",
    website: "https://hensoldt.net",
    linkedin_url: "https://linkedin.com/company/hensoldt",
    hq_country: "GBR",
    hq_city: "London",
    categories: ["HW"],
    summary:
      "HENSOLDT develops sensor solutions for defense and security applications, including radar and electronic warfare systems.",
    employees: "5001-10000",
    regions: ["EU", "AP"],
  },
  {
    name: "Kongsberg",
    website: "https://kongsberg.com",
    linkedin_url: "https://linkedin.com/company/kongsberg",
    hq_country: "NOR",
    hq_city: "Kongsberg",
    categories: ["VTS"],
    summary:
      "Kongsberg is a leading maritime technology company providing vessel traffic management, autonomous systems, and digital solutions.",
    employees: "1001-5000",
    regions: ["EU", "NA", "AP"],
  },
  {
    name: "Indra",
    website: "https://indracompany.com",
    linkedin_url: "https://linkedin.com/company/indra",
    hq_country: "ESP",
    hq_city: "Madrid",
    categories: ["VTS"],
    summary:
      "Indra delivers air traffic management, vessel traffic services, and defense electronics for governments and enterprises.",
    employees: "5001-10000",
    regions: ["EU", "LA", "AP"],
  },
  {
    name: "Navielektro",
    website: "https://navielektro.fi",
    linkedin_url: "https://linkedin.com/company/navielektro",
    hq_country: "FIN",
    hq_city: "Helsinki",
    categories: ["VTS"],
    summary:
      "Navielektro specializes in vessel traffic service solutions for the Baltic region and Scandinavian waters.",
    employees: "11-50",
    regions: ["EU"],
  },
  {
    name: "Leonardo",
    website: "https://leonardo.com",
    linkedin_url: "https://linkedin.com/company/leonardo",
    hq_country: "ITA",
    hq_city: "Rome",
    categories: ["HW"],
    summary:
      "Leonardo is a global aerospace and defense company providing radar, electronics, and security systems.",
    employees: "5001-10000",
    regions: ["EU", "NA", "AP"],
  },
  {
    name: "Thales",
    website: "https://thalesgroup.com",
    linkedin_url: "https://linkedin.com/company/thales",
    hq_country: "FRA",
    hq_city: "Paris",
    categories: ["VTS"],
    summary:
      "Thales provides mission-critical digital solutions for aerospace, defense, and transportation sectors.",
    employees: "5001-10000",
    regions: ["EU", "NA", "LA", "AP"],
  },
  {
    name: "Saab",
    website: "https://saab.com",
    linkedin_url: "https://linkedin.com/company/saab",
    hq_country: "SWE",
    hq_city: "Stockholm",
    categories: ["VTS"],
    summary:
      "Saab develops defense and security solutions, including surveillance systems and vessel traffic services.",
    employees: "1001-5000",
    regions: ["EU", "NA", "AP"],
  },
  {
    name: "Signalis",
    website: "https://signalis.com",
    linkedin_url: "https://linkedin.com/company/signalis",
    hq_country: "DEU",
    hq_city: "Hamburg",
    categories: ["VTS"],
    summary:
      "Signalis provides integrated vessel traffic and port management systems for maritime authorities.",
    employees: "51-200",
    regions: ["EU", "AP"],
  },
  {
    name: "Wärtsilä",
    website: "https://wartsila.com",
    linkedin_url: "https://linkedin.com/company/wartsila",
    hq_country: "FIN",
    hq_city: "Helsinki",
    categories: ["VTS"],
    summary:
      "Wärtsilä offers smart marine and energy solutions, including vessel traffic management and fleet optimization.",
    employees: "5001-10000",
    regions: ["EU", "NA", "AP"],
  },
];

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(companyCategories).run();
  await db.delete(companyRegions).run();
  await db.delete(companies).run();

  for (const companyData of sampleCompanies) {
    const { regions, categories, ...company } = companyData;

    // Insert company
    const result = await db.insert(companies).values(company).returning().get();

    // Insert regions
    if (regions && regions.length > 0) {
      for (const region of regions) {
        await db.insert(companyRegions)
          .values({
            company_id: result.id,
            region,
          })
          .run();
      }
    }

    // Insert categories
    if (categories && categories.length > 0) {
      for (const category of categories) {
        await db.insert(companyCategories)
          .values({
            company_id: result.id,
            category,
          })
          .run();
      }
    }

    console.log(`  Created: ${company.name}`);
  }

  console.log(`\nSeeded ${sampleCompanies.length} companies.`);
}

seed()
  .catch(console.error);
