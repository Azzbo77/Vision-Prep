# 🔭 Vision Prep

> Open-source visual assembly instruction platform for streamlined, modular, step-by-step build workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status: Early Planning](https://img.shields.io/badge/Status-Early%20Planning-blue.svg)]()

---

## What is Vision Prep?

Vision Prep is an open-source platform designed to streamline the creation, management, and execution of **visual, step-by-step assembly and build instructions** — particularly suited for:

- Custom manufacturing & prototyping
- Small-batch production
- Electronics builds
- Furniture assembly
- Mechanical kits & product customization
- Makerspaces & R&D labs

Admins build **reusable, modular instruction libraries** in a hierarchical structure. Individual steps can be shared across multiple product variants or "jobs/builds," eliminating redundant rewriting and ensuring consistency at scale.

---

## ✨ Key Features

### Admin Portal
- Organize steps into modular, tree-like folder/group structures
- Each step contains: high-quality photos/images, textual descriptions, linked parts/tools/materials
- In-browser image annotation: arrows, circles, highlights, text overlays
- Steps are reusable building blocks — link the same step to multiple jobs/builds

### Build Execution UI (User-Facing)
- Clean, intuitive step-by-step guidance
- Large photos with annotations, descriptions, and part/tool lists
- Mark steps as complete, track personal progress
- Flag issues (wrong tooling, missing parts, unclear instructions) with optional photos/notes
- Flexible navigation: jump between available/pending sections

### Tracking & Accountability
- Record who completed each step and timestamps/duration
- Audit trail for quality control and process improvement

### Live Reporting Dashboard
- Real-time visibility for supervisors/back-office staff
- Monitor build progress across users/jobs
- Identify bottlenecks, completion rates, and performance metrics

---

## 🏗️ Suggested Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| UI Components | Tailwind CSS + shadcn/ui |
| Backend API | Node.js + Express or Fastify |
| Database | PostgreSQL (via Prisma ORM) |
| File Storage | S3-compatible (MinIO for self-hosted) |
| Image Annotation | Fabric.js or Konva.js |
| Auth | Auth.js (NextAuth) or Clerk |
| Real-time | Socket.io or Supabase Realtime |
| Deployment | Docker Compose (self-hosted) |

---

## 📁 Project Structure

```
vision-prep/
├── apps/
│   ├── web/                  # React frontend (admin + user portals)
│   └── api/                  # Node.js backend API
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Shared utilities
├── docs/                     # Architecture & contributing docs
├── docker-compose.yml        # Local dev environment
└── README.md
```

---

## 🗺️ Data Model (Conceptual)

```
InstructionLibrary
  └── Folder / Group (nestable)
        └── Step
              ├── title, description
              ├── images[] (with annotations)
              └── parts/tools[]

Build (Job)
  ├── customer/project metadata
  ├── BuildStep[] → references Step (reusable)
  │     ├── order, section
  │     └── overrides (if any)
  └── completions[] → User + timestamp + duration
```

---

## 🚀 Getting Started (Coming Soon)

```bash
# Clone the repo
git clone https://github.com/your-org/vision-prep.git
cd vision-prep

# Install dependencies
npm install

# Start development environment
docker-compose up -d
npm run dev
```

> Full setup documentation will be added as the project matures.

---

## 🗺️ Roadmap

### Phase 1 — Foundation
- [ ] Project scaffolding & monorepo setup
- [ ] Database schema & migrations
- [ ] Auth (admin vs. builder roles)
- [ ] Basic step CRUD with image upload
- [ ] Build/job creation from step library

### Phase 2 — Core Experience
- [ ] In-browser image annotation tool
- [ ] User-facing build execution UI
- [ ] Step completion tracking
- [ ] Issue reporting with photos

### Phase 3 — Visibility & Reporting
- [ ] Live dashboard for supervisors
- [ ] Completion metrics & audit trail
- [ ] Email/notification system

### Phase 4 — Advanced
- [ ] Mobile-optimized / PWA
- [ ] Offline mode
- [ ] Inventory system integration
- [ ] Analytics & process improvement insights

---

## 🤝 Contributing

Contributions are welcome! This project is in **early planning/conceptual stage** — great areas to help:

- Architecture & API design
- UI/UX mockups
- Tech stack decisions
- Feature prioritization
- Documentation

Please open an [issue](../../issues) or [discussion](../../discussions) to share ideas or use cases.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © Vision Prep Contributors
