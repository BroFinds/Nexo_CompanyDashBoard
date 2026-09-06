    # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## System Overview

This workspace contains four interconnected projects that form the complete Nexo/DeliWheels platform:

| Directory | Role | Stack |
|---|---|---|
| `Nexo_backend/` | REST API server | Spring Boot 4 (Java 21), PostgreSQL, JWT |
| `BroFindsNexo_GC/` | Global Control Panel (GC) — super-admin UI | React 18, TypeScript, Tailwind, shadcn/ui, Supabase |
| `Nexo_CompanyDashBoard/` | Company admin dashboard | React 19, JavaScript, Vite, CSS custom properties |
| `Deliwheels_mobile/` | Driver mobile web app | React 19, TypeScript, Tailwind, Zustand, Wouter |

---

## Nexo_backend (Spring Boot API)

### Commands
```bash
cd Nexo_backend
./mvnw spring-boot:run          # start dev server
./mvnw test                     # run all tests
./mvnw test -Dtest=ClassName    # run single test class
./mvnw clean package            # build JAR
```

### Environment variables (`.env` or shell)
```
DB_URL=jdbc:postgresql://...
DB_USER=...
DB_PASS=...
TOKEN_SECRET=...
```

### Architecture
- **Package root**: `com.brofinds.nexo`
- **Layer structure**: `controllers → services → repositories → models`
- Two login flows live in `AuthController`:
  - `POST /auth/login` — company admin login → returns `companyId`, `userId`, access + refresh tokens
  - `POST /auth/deliwheelslogin` — vehicle/driver login → returns `vehicleUid`, `companyId`, tokens
- JWT access token (≈3 hours), refresh tokens stored in DB (`RefreshToken` table). Auto-refresh is handled client-side.
- **Sync system** (`/api/v1/deliwheels/sync`): bidirectional sync for the mobile app. `POST /syncup` receives shop/sales/stock data from the driver; `POST /syncdown` pushes master data (routes, products, vehicles) to the device. The `@SyncEntity` annotation marks JPA entities that participate in sync.
- Controller namespaces:
  - `controllers/auth/` — login, refresh, logout
  - `controllers/companycontrollers/` — employees, products, measurements
  - `controllers/deliwheelscontrollers/` — vehicles, routes, stock, sales, sync
  - `controllers/PingController` — `GET /api/v1/ping/{serviceName}` health check used by dashboard ReportsPage
- `SecurityConfig` wires `JwtAuthFilter`. `LoginRateLimiter` guards `/auth/login` and `/auth/deliwheelslogin` against brute force.
- All paginated endpoints return Spring Boot `Page<T>` shape (`content[]`, `last`, `totalElements`, `totalPages`, `number`).

---

## BroFindsNexo_GC (Global Control Panel)

### Commands
```bash
cd BroFindsNexo_GC
npm run dev       # start dev server
npm run build     # production build
npm run lint      # ESLint
```

### Environment variables (`.env`)
```
VITE_REACT_APP_SUPABASE_URL=...
VITE_REACT_APP_SUPABASE_ANON_KEY=...
```

### Architecture
- **Purpose**: Super-admin tool for BroFinds/Nexo GC staff. Creates and manages companies, allocates apps, manages global settings. Not accessible to company admins.
- **Auth**: Supabase RPC `gc_login(p_username)` — passwords are bcrypt-hashed client-side before verification. Session stored as a bare UID string in `localStorage.user_session`.
- **Data layer**: All DB calls go through Supabase RPC functions (no direct table queries from the frontend):
  - `gc_login`, `get_company_function_gc`, `create_company_func`, `update_company_gc`, `toggle_company_active_status`
  - `get_apps_gc`, `add_app_gc`, `delete_app_gc`
- **Hook/service pattern**: `useCompanies` (hook) → `useCompanyService` (service hook) → `appService.ts` / `supabaseClient.ts`
- **UI**: shadcn/ui components (`src/components/ui/`), TanStack Query (`QueryClientProvider` in `App.tsx`), React Hook Form + Zod for forms.
- Routes: `/` (Login), `/dashboard`, `/my-apps`, `/companies`, `/global-settings` — all except `/` guarded by `ProtectedRoute`.

---

## Nexo_CompanyDashBoard (Company Admin Dashboard)

### Commands
```bash
cd Nexo_CompanyDashBoard
npm run dev       # start dev server (Vite HMR)
npm run build     # production build
npm run lint      # ESLint
```

### Environment variable (`.env.local`)
```
VITE_API_BASE_URL=http://localhost:8080   # points at Nexo_backend
```

### Architecture
- **Two sub-apps** share a single authenticated shell:
  - **Nexo** (`src/apps/nexo/`) — company management: employees, products, measurements
  - **DeliWheels** (`src/apps/deliwheels/`) — logistics: vehicles, routes, stock, sales
- **Entry point** (`src/main.jsx`): `AuthenticatedShell` wraps both apps with `AuthGuard` → `GlobalProvider` → `DeliwheelsProvider` → `WorkspaceInitGate`. Both providers are mounted above the route split so products + vehicles are fetched once and reused when switching between `/` and `/deliwheels/*`.
- **WorkspaceInitGate** blocks rendering until products (Nexo) and vehicles (DeliWheels) are fully paginated from the backend.
- **Data layer**: Context + custom hooks. Each `use*.js` hook owns paginated state (`items`, `isLoading`, `hasMore`, page ref) and exposes `fetch*`, `add*`, `update*`, `disable*` operations. `src/services/api.js` is the single Axios instance with Bearer token injection and auto token-refresh on 401.
- **Session shape** in `localStorage.nexo_session`: `{ accessToken, refreshToken, companyId, userId }`.
- **Path aliases** (vite.config.js): `@` → `src/`, `@shared` → `src/shared/`, `@nexo` → `src/apps/nexo/`, `@deliwheels` → `src/apps/deliwheels/`
- **App registry** (`src/apps/nexo/constants/apps.js`): `ALL_APPS` is the single source of truth for launchable apps and their ping service names.
- **Styling**: CSS custom properties only — no Tailwind. Shared design tokens in `src/shared/theme/tokens.css`; per-app brand overrides in `*-theme.css`. Shared layout/component styles in `src/shared/styles/`.

---

## Deliwheels_mobile (Driver Mobile App)

### Commands
```bash
cd Deliwheels_mobile
npm run dev       # start dev server
npm run build     # production build
```

### Architecture
- **Purpose**: Mobile-first PWA for delivery drivers. Login → view assigned deliveries → update delivery status → submit Proof of Delivery (POD) with photo + signature.
- **State**: Zustand store (`client/src/lib/store.ts`) holds `user`, `deliveries`, `isAuthenticated`. Currently uses mock data — no live backend calls wired yet. The `shared/schema.ts` (Drizzle + Zod) and `drizzle.config.ts` indicate a backend was scaffolded but not integrated.
- **Router**: Wouter (`Switch`/`Route`). Routes: `/` (Login), `/dashboard`, `/deliveries`, `/delivery/:id`, `/pod/:id`.
- **Auth**: Simple email-based mock login — any non-empty email + password passes. `isAuthenticated` flag gates all routes via inline `ProtectedRoute`.
- **Delivery lifecycle**: `PENDING → PICKED_UP → IN_TRANSIT → DELIVERED`. `submitPOD` advances status to `DELIVERED` and simulates an upload.
- **UI**: shadcn/ui components in `client/src/components/ui/`, custom `MobileLayout` wrapper with bottom nav. Framer Motion for page transitions.

---

## Cross-project data flow

```
BroFindsNexo_GC  ──(Supabase RPC)──▶  Supabase DB
                                          │
                                          │ (company/admin provisioning)
                                          ▼
Nexo_backend  ◀──(REST /api/v1/*)──  Nexo_CompanyDashBoard
     │
     │  POST /api/v1/deliwheels/sync/syncup   (mobile → server)
     │  POST /api/v1/deliwheels/sync/syncdown (server → mobile)
     ▼
Deliwheels_mobile
```

- **GC** provisions companies and their app allocations into Supabase.
- **Nexo_backend** reads company/admin data (presumably from the same or a connected PostgreSQL DB) and issues JWTs for company admins and vehicle drivers.
- **Nexo_CompanyDashBoard** is the day-to-day company admin interface — talks only to `Nexo_backend`.
- **Deliwheels_mobile** syncs route/stock/product data down from the backend at the start of a shift, and pushes completed sales + stock data back up via the sync endpoints.
