# Beacon

Customer intelligence, starting with your key accounts.

## Overview

Beacon is a minimal but scalable MVP for a customer intelligence app. It helps you track and understand your key customers.

### Features (MVP)

- **Companies Page**: Browse, search, and filter your customer database
- **Add Companies**: Quickly add new companies with relevant metadata
- **Filtering**: Filter by region (EU, NA, AP, LA) and category (VTS, HW)
- **Search**: Search companies by name or summary

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Data Layer**: TanStack Query + TanStack Table
- **Backend**: Next.js API Routes
- **Database**: SQLite + Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run database migrations:

```bash
npm run db:migrate
```

3. Seed the database with sample data:

```bash
npm run db:seed
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
beacon/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── companies/     # Companies CRUD endpoints
│   ├── companies/         # Companies list page
│   ├── products/          # Products placeholder page
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── companies/         # Company-specific components
│   ├── layout/            # Layout components (header, shell)
│   └── ui/                # shadcn/ui components
├── config/
│   └── app.ts             # App configuration constants
├── hooks/
│   ├── useCompanies.ts    # Company data hooks
│   └── useQueryProvider.tsx # React Query provider
├── lib/
│   ├── db/                # Database setup
│   │   ├── index.ts       # Drizzle + SQLite connection
│   │   ├── schema.ts      # Drizzle schema
│   │   ├── migrate.ts     # Migration script
│   │   ├── seed.ts        # Seed data script
│   │   └── migrations/    # SQL migrations
│   ├── api-client.ts      # Typed API client
│   ├── categories.ts      # Category code mappings
│   ├── regions.ts         # Region code mappings
│   ├── types.ts           # Shared TypeScript types
│   └── utils.ts           # Utility functions
└── data/                  # SQLite database file (gitignored)
```

## API Endpoints

### Companies

- `GET /api/companies` - List all companies
  - Query params: `search`, `region`, `category`
- `POST /api/companies` - Create a new company
- `GET /api/companies/[id]` - Get a single company

## Data Model

### Company

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| name | string | Company name (required) |
| website | string | Company website URL |
| linkedin_url | string | LinkedIn company page |
| hq_country | string | HQ country code (e.g., "NLD") |
| hq_city | string | HQ city name |
| category | string | Category code (VTS, HW) |
| summary | string | Brief company description |
| employees | string | Employee count range |
| regions | string[] | Geographic presence (EU, NA, AP, LA) |

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run db:generate # Generate Drizzle migrations
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database with sample data
npm run db:studio   # Open Drizzle Studio
```

## License

MIT






