import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing environment variables");
  process.exit(1);
}

const client = createClient({
  url,
  authToken,
});

async function main() {
  const migrationsDir = path.join(process.cwd(), "lib", "db", "migrations");
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Found ${files.length} migration files.`);

  for (const file of files) {
    console.log(`Applying ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    let statements: string[] = [];

    if (content.includes("--> statement-breakpoint")) {
      statements = content.split("--> statement-breakpoint");
    } else {
      // Basic splitting by semicolon for files without breakpoints
      // This is not perfect but works for standard Drizzle output
      statements = content
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    for (const stmt of statements) {
      if (!stmt.trim()) continue;
      try {
        await client.execute(stmt);
      } catch (e: any) {
        if (e.code === "SQL_MANY_STATEMENTS") {
            // Fallback: try splitting by semicolon if we haven't already
             const subStmts = stmt.split(";").map(s => s.trim()).filter(s => s.length > 0);
             for(const sub of subStmts) {
                 await client.execute(sub);
             }
        } else {
            // Ignore "already exists" errors to allow re-runs
            if (e.message?.includes("already exists") || e.message?.includes("duplicate column")) {
               console.log(`  - Skipped (already exists): ${stmt.substring(0, 50)}...`);
            } else {
               console.error(`  - Failed to execute: ${stmt.substring(0, 50)}...`);
               console.error(e);
               process.exit(1);
            }
        }
      }
    }
    console.log(`  - Applied.`);
  }

  console.log("All migrations applied successfully.");
}

main();
