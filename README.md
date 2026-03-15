# 👁 Vision Prep

> Open-source visual assembly instruction platform for streamlined, modular, step-by-step build workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status: Phase 2 Complete](https://img.shields.io/badge/Status-Phase%202%20Complete-blue.svg)]()

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

## ✅ Current Status — Phase 2 Complete

The platform is fully functional with authentication, role-based access control, and a complete build execution workflow.

### The core loop works end to end:

- **Admin** creates folders, adds steps, uploads photos, and annotates images in-browser
- **Admin** creates builds, links reusable steps from the library, activates builds, and assigns builders
- **Admin** invites users by email and manages roles from the user management page
- **Builder** opens assigned builds, follows each step with annotated images, marks steps complete or skips with a reason
- **Builder** flags issues — they appear instantly in the supervisor dashboard
- **Builder** receives in-app notifications when their issues are acknowledged or resolved
- **Supervisor** watches build progress update live on the dashboard without refreshing
- **Supervisor** acknowledges and resolves issues with resolution notes

---

## ✨ Features

### Admin / Library
- Organise steps into folders
- Create reusable steps with title, description, and photos
- In-browser image annotation — arrows, circles, and text labels
- Annotations saved as JSON and rendered read-only in the builder view
- Mark steps as **critical** — builders must confirm completion before advancing
- Steps are reusable building blocks — link the same step to multiple builds

### Build Management
- Create builds and link ordered steps from the library
- Activate, pause, and resume builds
- Assign specific builders to builds
- Dedicated assignments page per build

### Builder Execution View
- Landing page showing assigned builds with progress indicators
- Step-by-step guidance with annotated images and parts lists
- Sidebar showing all steps and completion status with progress bar
- Mark steps complete — auto-advances to the next step
- Critical step confirmation — checkbox required before completing high-risk steps
- Skip steps with a reason (Parts, Tooling, Instructions, Other) — logged as an issue automatically
- Flag issues with type selection and description
- My Issues page — view all reported issues and their current status per build
- In-app notifications when issues are acknowledged or resolved

### Live Supervisor Dashboard
- Real-time build progress across all active builds
- Step completion counts update live via Supabase Realtime
- Open issues panel with acknowledge and resolve actions
- Resolution notes saved against each issue
- Summary stats — active builds, steps completed, open issues, completed builds

### User Management (Admin)
- Invite users by email with role selection (Admin, Supervisor, Builder)
- Invited users receive an email to set their own password
- View and remove users from the platform
- Role-based navigation — each role sees only relevant pages

### Security
- Supabase Auth with email and password
- Row Level Security (RLS) on all database tables
- Role-based route protection via Next.js proxy
- Service role key used only for admin operations

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + CSS variables |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + SSR |
| Realtime | Supabase Realtime |
| Image Storage | Supabase Storage |
| Image Annotation | Fabric.js v6 |
| ORM | Prisma 5 (migrations only) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier is sufficient)
- A [Vercel](https://vercel.com) account (optional, for deployment)

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

Add your credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=your-supabase-transaction-pooler-url
DIRECT_URL=your-supabase-session-pooler-url
```

Push the database schema:

```bash
npx prisma db push
```

Create your first admin user in Supabase SQL Editor — first create the user in **Authentication → Users**, then run:

```sql
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES ('your-auth-user-id', 'admin@example.com', 'Admin', 'ADMIN', now(), now());
```

Enable Realtime on the `StepCompletion` and `IssueReport` tables in **Database → Publications → supabase_realtime**.

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

---

## 🧪 Try It — Live Demo

A live demo is available at [vision-prep.vercel.app](https://vision-prep.vercel.app).

Use the test accounts shown on the login page to explore each role:

| Role | Email | Password |
|---|---|---|
| Admin | testadmin@test.com | changeme123 |
| Supervisor | testsupervisor@test.com | changeme456 |
| Builder | testbuilder@test.com | changeme789 |

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

### ✅ Phase 2 — Complete
- Supabase Auth with email and password
- Role-based access (Admin, Supervisor, Builder)
- Row Level Security on all tables
- User invite system with email flow
- Build assignment — assign builders to specific builds
- Builder landing page with assigned build list
- Issue resolution workflow — acknowledge and resolve with notes
- In-app builder notifications for issue updates
- Critical step confirmation gates
- Step skip with reason — logged as an issue automatically

### Phase 3 — Next
- Mobile-optimised builder view / PWA
- Docker / self-hosted deployment
- Email notifications for issue updates
- Version control for work instructions
- Work order processing — link builds to job numbers
- Parts and tools catalogue with BOM management
- Analytics — cycle times, completion rates, bottlenecks
- ERP integration via CSV import

### Phase 4 — Future
- Offline mode with sync
- Multi-tenancy
- Operator training and sign-off workflows
- Full traceability — who built what and when
- Quality management — pass/fail checks at steps

---

## 🤝 Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Good areas to contribute right now:
- Mobile UI optimisation
- Docker / self-hosted deployment
- Email notifications (Resend or SendGrid integration)
- Parts catalogue UI
- Analytics dashboard

---

## 📄 Licence

MIT © Vision Prep Contributors