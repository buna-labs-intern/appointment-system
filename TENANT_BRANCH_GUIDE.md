# NexaCare — Multi-Tenancy & Branch Guide

Supersedes `BRANCH_FRONTEND_GUIDE.md`. Covers the platform multi-tenancy layer, the
super-admin dashboard (`admin-frontend/`), and what the clinic frontend team needs to do.

## 1. Mental model

```
Tenant (clinic)            e.g. "NexaCare", "Hargeisa Medical Center"
 └── Branch[] (buildings)  e.g. "Main Branch" — one auto-created per tenant
      └── Doctors / Services / Appointments / Shifts / Notifications
 └── Patients (tenant-scoped directly)
 └── Users (tenantId on the user; branch access via UserBranch join)
```

- `SUPER_ADMIN` (platform) — `tenantId: null`, uses `admin-frontend/`, manages clinics.
- `ADMIN` (clinic owner) — `tenantId` set, uses the existing clinic frontend.
- `RECEPTIONIST` — `tenantId` set, same frontend.
- Branches remain an **opt-in** feature: the API supports them, the existing frontend ignores them.

## 2. Auth

### Login — `POST /api/auth/login`

```json
{
  "success": true,
  "data": {
    "token": "<jwt with id, email, role, branchIds, branchAll, tenantId, tenantSlug>",
    "user": {
      "id": "...", "fullName": "...", "email": "...", "role": "ADMIN",
      "isActive": true, "mustChangePassword": false,
      "tenantId": "<tenant id or null>",
      "branchIds": [], "branchAll": true, "branches": []
    },
    "tenant": { "id": "...", "name": "NexaCare", "slug": "nexacare" }
  }
}
```

- `tenant` is `null` for SUPER_ADMIN.
- `GET /api/auth/me` returns the same shape inside `data`.
- A banned clinic (Tenant.isActive=false) gets `403 "Clinic is banned..."` at login **and** on
  every authenticated request (middleware re-checks the DB), so bans take effect immediately.
- An archived single pinned branch is blocked the same way as before.

### Forced password change

`mustChangePassword: true` is set on:
- clinic owners created via `POST /api/tenants`,
- any worker created via `POST /api/users` (they receive a temporary password),
- any user whose password is reset by an admin via `PUT /api/users/:id`.

It is a **soft check**: login still succeeds and other APIs are not blocked while the
flag is true; `user.mustChangePassword` is present on login/me responses.
`POST /api/auth/change-password` clears it.

The clinic frontend should redirect to the profile/password page when
`user.mustChangePassword === true` — see §6.

### Google login — `POST /api/auth/google`

Same token + response shape as password login (only active when `GOOGLE_CLIENT_ID` is set).

## 3. Tenant endpoints (SUPER_ADMIN only, used by `admin-frontend/`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/tenants` | Create clinic + Main Branch + owner in one transaction |
| GET | `/api/tenants?search=&isActive=&page=&limit=` | Paginated list with `_count` |
| GET | `/api/tenants/:id` | Detail with counts + default branch |
| GET | `/api/tenants/:id/branches` | Branch list with per-branch counts |
| PUT | `/api/tenants/:id` | Update name/slug/address/phone/defaultBranchId |
| PATCH | `/api/tenants/:id/block` | Ban clinic (`{reason?}`) |
| PATCH | `/api/tenants/:id/unblock` | Lift ban |
| DELETE | `/api/tenants/:id` | Only when clinic has no branches/users/patients |

Create body:

```json
{
  "name": "Hargeisa Medical Center",
  "slug": "hargeisa-medical",
  "address": "Main street",
  "phone": "+252 61 000 0000",
  "owner": {
    "fullName": "Dr. Khadija Ali",
    "email": "owner@clinic.com",
    "phone": "+252 63 000 0000",
    "password": "tempPass123"
  }
}
```

Owner is created as `ADMIN` with `mustChangePassword: true`, linked to the new Main Branch,
which becomes the tenant's `defaultBranchId`.

SUPER_ADMIN tokens are rejected with 403 on all clinic-data routes
(users, doctors, patients, services, appointments, dashboard, notifications, schedule, branches).

## 4. Branch behavior on the clinic API (opt-in, no changes required)

- **Creates** (`POST /api/doctors|services|appointments`, `POST /api/schedule`):
  - Omitted `branchId` → lands in the tenant's **default branch** automatically.
    The old frontend never needs to send a branch.
  - Explicit `branchId` → validated against assignment, active state and tenant.
- **Reads**: `?branchId=` filter supported everywhere; without it, results are scoped
  to the user's tenant (and their branches when pinned).
- `GET /api/branches/select` returns `{id,name,slug}` list for any authenticated clinic user —
  the entry point when the frontend team opts in to a branch picker.
- Patient records are tenant-scoped; duplicates are checked per tenant.

## 5. admin-frontend/ (platform dashboard)

- Vite + React 19 + TypeScript (strict, zero `any`), React Router, Redux Toolkit + TanStack Query.
- `pnpm dev` runs on port **5174** (already CORS-allowed by the backend).
- Env: copy `.env.example` to `.env` (`VITE_API_URL=http://localhost:5000/api`).
- Pages: login (rejects non-SUPER_ADMIN), clinic list (search/filter/ban/unban/delete),
  create clinic (clinic + owner), clinic detail (edit, branches, ban controls).
- Seeded platform login: `super@nexacare.com` / `Super@12345` (see §7 for all seeded accounts).

## 6. Tasks for the existing frontend (interns)

Backend work is done — these are frontend-only:

1. **Required (5 lines):** in `LoginPage.tsx`, after `loginRequest` succeeds, if
   `data.user.mustChangePassword === true`, redirect to `/profile` instead of `/dashboard`.
   The profile page already has the change-password form; the API clears the flag on success.
2. **Already working, no code:** tenant name shows in the Sidebar/Profile via `TenantContext`
   now that login returns `tenant`.
3. **Optional branch opt-in (no backend changes needed, whenever ready):**
   - Fetch `GET /api/branches/select`, render a picker for `branchAll`/multi-branch users.
   - Include the chosen `branchId` in create payloads for doctors/services/appointments/schedule.
   - Add `branchId` to React Query keys for the corresponding lists.
   - Optionally show a branch badge next to the clinic name in the sidebar.

## 7. Seeders (local dev)

Two idempotent scripts — re-running never duplicates rows:

| Command | Script | What it does |
|---|---|---|
| `npm run prisma:seed` | `Backend/prisma/seed.ts` | Base data: initial clinic, platform super admin, clinic users, catalog |
| `npm run seed:demo` | `seed.ts` **+** `Backend/prisma/demo-data.ts` | Base data **plus** demo appointments, shifts, notifications and a second clinic |

Run from `Backend/`. `seed:demo` requires the base seed first (it runs it automatically).

### Base seed (`prisma/seed.ts`)

- **Tenant `NexaCare`** (slug `nexacare`) + **Branch `Main Branch`** (slug `main-branch`),
  wired as the tenant's `defaultBranchId` — this is what makes omitted-`branchId` creates
  land in Main Branch (the opt-out behavior).
- **Platform super admin** `super@nexacare.com` — `SUPER_ADMIN`, `tenantId: null`,
  `mustChangePassword: false`. Use it for `admin-frontend/`.
- **Clinic users** `admin@hospital.com` (ADMIN) and `receptionist@hospital.com`
  (RECEPTIONIST), linked to the NexaCare tenant, no branch pin (all branches).
- **Catalog, all linked to Main Branch:** 5 services (General Consultation $25,
  Follow-up $15, Pediatrics $30, Medical Certificate $10, Blood Pressure Check $5),
  3 doctors (Dr. Sara Ahmed, Dr. Mohamed Ali, Dr. Amina Yusuf — inactive, to test filtering),
  3 patients (tenant-scoped).

### Demo seed (`prisma/demo-data.ts`, base seed required first)

- **8 appointments** for NexaCare: 3 today (scheduled), 1 tomorrow, 3 completed
  in past days, 1 cancelled — so the dashboard has numbers.
- **2 staff shifts** for the receptionist (today morning + tomorrow afternoon).
- **3 notifications**.
- **Second clinic `Hargeisa Medical Center`** (slug `hargeisa-medical`) with its own
  Main Branch, doctor, service, and owner `owner@hmc.com` — seeded with
  `mustChangePassword: true` so the forced password-change flow can be tested locally.

### Test-tenant cleanup

Clinics created through the API during testing can be wiped with:

```bash
cd Backend && npx ts-node prisma/cleanup-test-tenants.ts
```

### Seeded accounts

| Account | Password | Role |
|---|---|---|
| `super@nexacare.com` | `Super@12345` | SUPER_ADMIN (platform) |
| `admin@hospital.com` | `Admin@12345` | ADMIN (NexaCare clinic) |
| `receptionist@hospital.com` | `Reception@12345` | RECEPTIONIST |
| `owner@hmc.com` | `Owner@12345` | ADMIN (Hargeisa Medical Center, must change password on first login) |
