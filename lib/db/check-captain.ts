import { db, schema } from "./index";

async function checkCaptain() {
  const allCompanies = db
    .select()
    .from(schema.companies)
    .all();

  const captainCompanies = allCompanies.filter(c => 
    c.name.toLowerCase().includes("captain")
  );

  console.log("Companies with 'captain' in name:");
  captainCompanies.forEach(c => {
    console.log(`- ID: ${c.id}, Name: "${c.name}", Website: ${c.website}`);
  });
}

if (require.main === module) {
  checkCaptain()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

