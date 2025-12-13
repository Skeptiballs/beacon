import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// Companies table - core entity for customer intelligence
export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  website: text("website"),
  linkedin_url: text("linkedin_url"),
  logo_url: text("logo_url"),
  hq_country: text("hq_country"),
  hq_city: text("hq_city"),
  summary: text("summary"),
  employees: text("employees"),
  starred: integer("starred", { mode: "boolean" }).notNull().default(false),
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Company notes - simple note entries tied to a company
export const companyNotes = sqliteTable("company_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company_id: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Company regions - many-to-many relationship for geographic presence
export const companyRegions = sqliteTable("company_regions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company_id: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  region: text("region").notNull(),
});

// Company categories - many-to-many relationship for category classification
export const companyCategories = sqliteTable("company_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company_id: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
});

// Waitlist - email addresses for early access
export const waitlist = sqliteTable("waitlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Relations for type-safe joins
export const companiesRelations = relations(companies, ({ many }) => ({
  regions: many(companyRegions),
  categories: many(companyCategories),
  notes: many(companyNotes),
}));

export const companyRegionsRelations = relations(companyRegions, ({ one }) => ({
  company: one(companies, {
    fields: [companyRegions.company_id],
    references: [companies.id],
  }),
}));

export const companyCategoriesRelations = relations(companyCategories, ({ one }) => ({
  company: one(companies, {
    fields: [companyCategories.company_id],
    references: [companies.id],
  }),
}));

export const companyNotesRelations = relations(companyNotes, ({ one }) => ({
  company: one(companies, {
    fields: [companyNotes.company_id],
    references: [companies.id],
  }),
}));

// Types inferred from schema
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type CompanyRegion = typeof companyRegions.$inferSelect;
export type NewCompanyRegion = typeof companyRegions.$inferInsert;
export type CompanyCategory = typeof companyCategories.$inferSelect;
export type NewCompanyCategory = typeof companyCategories.$inferInsert;
export type CompanyNote = typeof companyNotes.$inferSelect;
export type NewCompanyNote = typeof companyNotes.$inferInsert;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type NewWaitlistEntry = typeof waitlist.$inferInsert;

