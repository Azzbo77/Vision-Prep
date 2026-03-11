# 👁 Vision Prep

> Open-source visual assembly instruction platform for streamlined, modular, step-by-step build workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status: POC Complete](https://img.shields.io/badge/Status-POC%20Complete-green.svg)]()

---

## What is Vision Prep?

Vision Prep is an open-source platform for creating, managing, and following **visual, step-by-step assembly and build instructions**. Admins build reusable, modular instruction libraries. Builders follow them step by step. Supervisors monitor progress in real time.

Suited for:
- Custom manufacturing & prototyping
- Small-batch production
- Electronics builds
- Furniture assembly
- Mechanical kits & product customisation
- Makerspaces & R&D labs

---

## ✅ Current Status — POC Complete

The proof of concept has been built and validated. The full core loop works end to end:

- **Admin** creates a folder, adds steps, uploads photos, and annotates images in-browser
- **Admin** creates a build, links reusable steps from the library, and activates it
- **Builder** opens the build, follows each step with annotated images, and marks steps complete
- **Supervisor** watches build progress update live on the dashboard without refreshing
- **Builder** flags an issue — it appears instantly in the supervisor dashboard

---

## ✨ Features (POC)

### Admin / Library
- Organise steps into folders
- Create reusable steps with title, description, and photos
- In-browser image annotation — arrows, circles, and text labels
- Annotations saved as JSON and rendered read-only in the builder view
- Steps are reusable building blocks — link the same step to multiple builds

### Build Management
- Create builds and link ordered steps from the library
- Activate builds to make them available to builders
- Remove steps or delete builds

### Builder Execution View
- Step-by-step guidance with annotated images
- Sidebar showing all steps and completion status
- Progress bar tracking completion
- Mark steps complete — auto-advances to the next step
- Flag issues with type selection and description

### Live Supervisor Dashboard
- Real-time build progress across all active builds
- Step completion counts update live via Supabase Realtime
- Open issues panel — new issues appear instantly
- Summary stats — active builds, steps completed, open issues

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime |
| Image Storage | Supabase Storage |
| Image Annotation | Fabric.js |
| ORM | Prisma 5 |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier)
- A [Vercel](https://vercel.com) account (free tier, optional)

### Local Setup
```bash
# Clone the repo
git clone https://github.com/Azzbo77/Vision-Prep.git
cd Vision-Prep

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
DATABASE_URL="your-supabase-transaction-pooler-url"
DIRECT_URL="your-supabase-session-pooler-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-supabase-anon-key"
```

Push the database schema:
```bash
npx prisma db push
```

Create the POC user in Supabase SQL Editor:
```sql
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES ('poc-user', 'builder@visionprep.dev', 'POC Builder', 'BUILDER', now(), now());
```

Start the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗺️ Roadmap

### ✅ POC — Complete
- Project scaffold + Supabase connection
- Nav bar + design system
- Folder and step CRUD
- Image upload to Supabase Storage
- In-browser image annotation with Fabric.js
- Annotation save/load round-trip
- Build creation and step linking
- Builder execution view
- Live supervisor dashboard
- Issue reporting

### Phase 2 — Next
- User authentication (Supabase Auth + role-based access)
- Mobile-optimised builder view / PWA
- Issue resolution workflow for supervisors
- Step completion by view time (automatic tracking)
- Parts and tools catalogue
- Email notifications for issues
- Build completion summary

### Phase 3 — Future
- Offline mode
- Docker / self-hosted deployment
- Analytics and process improvement insights
- Inventory system integration
- Multi-tenancy

---

## 🤝 Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Great areas to help with right now:
- Authentication (Supabase Auth + RLS policies)
- Mobile UI optimisation
- Issue resolution workflow
- Parts catalogue

---

## 📄 Licence

MIT © Vision Prep Contributors