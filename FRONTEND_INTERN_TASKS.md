# Frontend Intern Tasks — Multitenancy Integration

Backend work is **done and smoke-tested**. These are the remaining tasks in the existing
`frontend/` app. Read `TENANT_BRANCH_GUIDE.md` first — it has the full API contract.

## Test accounts (after `cd Backend && npm run seed:demo`)

| Email | Password | Role | Notes |
|---|---|---|---|
| `admin@hospital.com` | `Admin@12345` | ADMIN | NexaCare clinic owner |
| `receptionist@hospital.com` | `Reception@12345` | RECEPTIONIST | has demo shifts |
| `owner@hmc.com` | `Owner@12345` | ADMIN | second clinic, **mustChangePassword: true** |
| `super@nexacare.com` | `Super@12345` | SUPER_ADMIN | platform only — do NOT use in clinic frontend |

---

## Task 1 — Force password change on first login (required, ~10 lines)

**File:** `frontend/src/pages/LoginPage.tsx`

The login response now includes `user.mustChangePassword` and `tenant` (the existing
`loginRequest` in `features/auth/authAPI.ts` already forwards them — check `AuthUser`
in `authSlice.ts` includes `mustChangePassword`).

The flag applies to **every user**, not just clinic owners:
- clinic owners created from the admin dashboard,
- receptionists/workers created by an admin via Users page (they receive a temp password),
- any user whose password was reset by an admin (flag is set again until they change it).

This is a **soft check** — the backend does not block API calls while the flag is true;
the redirect below *is* the enforcement.

After a successful login:

```ts
const needsPasswordChange = data.user.mustChangePassword === true
navigate(needsPasswordChange ? '/profile' : redirectTo, { replace: true })
```

Acceptance:
- Log in as `owner@hmc.com` / `Owner@12345` → lands on `/profile`, not dashboard.
- Create a receptionist in the Users page → their first login also lands on `/profile`.
- Change password via the existing form → next login goes to dashboard.
- All users without the flag are unaffected.

## Task 2 — Show the clinic name (mostly free, verify only)

Already wired: login response `tenant` → `useAuth.login()` → `authSlice.setCredentials`
(persists it to localStorage) → `TenantContext` → `Sidebar` + `ProfilePage` display
`tenantName`.

To verify: log in as the NexaCare admin — sidebar header must show **NexaCare**; log in
as the HMC owner (after password change) — it must show **Hargeisa Medical Center**.
If `tenant` is missing from the stored auth after your Task 1 change, make sure
`login(data.user, data.token, data.tenant)` is passing the third argument.

## Task 3 — Handle "Clinic is banned" gracefully (small UX task)

When a clinic is banned, every API call returns `403` with message
`"Clinic is banned. Contact platform administrator."` — including `/auth/me`.

- In `services/axios.ts` response interceptor: on 403 with that message, clear
  `AUTH_STORAGE_KEY` and redirect to `/login`.
- On the login page the message will surface automatically through the existing
  error handling — verify it.

To test: ask whoever runs the admin dashboard to ban/unban `Hargeisa Medical Center`,
or `PATCH /api/tenants/:id/block` with the super admin token via Postman.

## Task 4 — Verify nothing else broke (regression pass)

The backend never requires `branchId`. Run through the normal flows as
`admin@hospital.com` and `receptionist@hospital.com`:

- [ ] Dashboard counts (there is demo data: 8 appointments, shifts, notifications)
- [ ] Create doctor / service / patient / appointment (no branch field — it lands in Main Branch automatically)
- [ ] Lists, search, pagination
- [ ] Notifications page (demo notifications exist)
- [ ] Receptionist "My Schedule" (demo shifts exist today + tomorrow)
- [ ] Google login still works if `GOOGLE_CLIENT_ID` is set

## Task 5 — Branch opt-in (optional, later, zero backend changes)

Only when the team decides to show branch pickers. Recipe in `TENANT_BRANCH_GUIDE.md` §6.3:
fetch `GET /api/branches/select`, render picker for multi-branch users, include
`branchId` in create payloads, add it to React Query keys.

## Notes

- Never call tenant endpoints from the clinic frontend — they are SUPER_ADMIN-only and
  the backend rejects other roles with 403.
- `X-Tenant-Id` header the axios interceptor sends is informational; the backend authorizes
  from the token. No change needed.
- Multi-tenancy is invisible by design for a single-clinic user — do not add a clinic
  picker to this app.
