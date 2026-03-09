# Vision Prep — Architecture Document

## Overview

Vision Prep follows a monorepo structure with clear separation between frontend, backend API, and shared packages.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │   Admin Portal   │        │  Builder Execution UI    │  │
│  │  (React + Vite)  │        │   (React + Vite / PWA)   │  │
│  └────────┬─────────┘        └────────────┬─────────────┘  │
└───────────┼──────────────────────────────┼─────────────────┘
            │  REST + WebSocket            │
┌───────────▼──────────────────────────────▼─────────────────┐
│                    API Server (Node.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Auth    │  │  Steps   │  │  Builds  │  │ Dashboard │  │
│  │ (JWT)    │  │  Router  │  │  Router  │  │  Router   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│                    Prisma ORM                               │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────▼───────────┐   ┌────────────────────────────┐
│       PostgreSQL           │   │    File Storage (S3/Minio)  │
│   (primary data store)     │   │   (images, annotations)     │
└───────────────────────────┘   └────────────────────────────┘
```

## Frontend Architecture

### Pages / Views

**Admin Portal (`/admin`)**
- `/admin/library` — Instruction library browser (folder tree + step list)
- `/admin/library/folders/:id` — Folder detail & step management
- `/admin/library/steps/:id` — Step editor (images, annotations, parts)
- `/admin/builds` — Build/job list
- `/admin/builds/new` — Build composer (drag steps from library)
- `/admin/builds/:id` — Build detail & management
- `/admin/parts` — Parts/tools catalog
- `/admin/dashboard` — Live reporting dashboard
- `/admin/users` — User management

**Builder UI (`/build`)**
- `/build` — My assigned builds
- `/build/:buildId` — Build overview & section navigator
- `/build/:buildId/steps/:stepId` — Step execution view
- `/build/:buildId/complete` — Build completion summary

### State Management

Recommended: **TanStack Query** for server state + **Zustand** for local UI state

```
useBuildsQuery()          → list all builds
useBuildQuery(id)         → single build with steps
useStepQuery(id)          → single step with images/parts
useCompleteStep()         → mutation: mark step complete
useReportIssue()          → mutation: file issue report
useDashboardLive()        → websocket subscription
```

## Backend Architecture

### API Routes

```
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/folders
POST   /api/folders
GET    /api/folders/:id
PATCH  /api/folders/:id
DELETE /api/folders/:id

GET    /api/steps
POST   /api/steps
GET    /api/steps/:id
PATCH  /api/steps/:id
DELETE /api/steps/:id
POST   /api/steps/:id/images
DELETE /api/steps/:id/images/:imageId
PATCH  /api/steps/:id/images/:imageId/annotations

GET    /api/parts
POST   /api/parts
GET    /api/parts/:id
PATCH  /api/parts/:id

GET    /api/builds
POST   /api/builds
GET    /api/builds/:id
PATCH  /api/builds/:id
POST   /api/builds/:id/steps
DELETE /api/builds/:id/steps/:buildStepId
PATCH  /api/builds/:id/steps/reorder

POST   /api/builds/:id/steps/:buildStepId/complete
DELETE /api/builds/:id/steps/:buildStepId/complete

POST   /api/builds/:id/steps/:buildStepId/issues
GET    /api/builds/:id/steps/:buildStepId/issues
PATCH  /api/issues/:id

GET    /api/dashboard/summary
GET    /api/dashboard/builds/:id
WS     /api/dashboard/live
```

## Image Annotation Format

Annotations are stored as JSON arrays on `StepImage.annotations`:

```typescript
type Annotation = {
  id: string;
  type: "arrow" | "circle" | "rectangle" | "highlight" | "text";
  x: number;       // % from left (0–100)
  y: number;       // % from top (0–100)
  width?: number;  // % of image width
  height?: number; // % of image height
  angle?: number;  // degrees (for arrows)
  color: string;   // hex
  label?: string;  // for text annotations
  strokeWidth?: number;
};
```

Recommended library: **Konva.js** (React-friendly canvas, supports all shapes)

## Role & Permission Matrix

| Action | BUILDER | SUPERVISOR | ADMIN |
|--------|---------|------------|-------|
| View assigned builds | ✅ | ✅ | ✅ |
| Complete steps | ✅ | ✅ | ✅ |
| Report issues | ✅ | ✅ | ✅ |
| View all builds | ❌ | ✅ | ✅ |
| View dashboard | ❌ | ✅ | ✅ |
| Resolve issues | ❌ | ✅ | ✅ |
| Create/edit steps | ❌ | ❌ | ✅ |
| Create/edit builds | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

## Real-time Strategy

Use **Socket.io** rooms per build:
- `build:{id}` — step completions, issue reports
- `dashboard` — aggregate progress updates

## File Storage

- Images uploaded via multipart to API
- API streams to S3/MinIO
- Thumbnails generated server-side (sharp)
- Signed URLs for secure client access

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/visionprep
JWT_SECRET=...
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=vision-prep
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
PORT=3001
```
