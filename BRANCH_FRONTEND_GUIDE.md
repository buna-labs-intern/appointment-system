# Branch System — Frontend Guide

Welcome! NexaCare now runs on branches. Think of a branch as a building. One clinic, many buildings. This doc tells you exactly what changed and what to build.

---

## What you need to know in one minute

- A branch is a physical location: Main Branch, Berbera Branch, etc.
- A user can be assigned to *zero* (means all branches), one, or many branches.
- Doctors, services, appointments and shifts are always tied to one branch.
- Patients are shared across branches (one person, many visits).
- Appointments must always carry a branch. If you are pinned to one branch, we fill it for you. If you can see many/all, you must pick it.
- Old data has no branch (we did not backfill). It stays visible but won't show in branch-filtered lists until tagged. That's intentional.

---

## 1. Login and session — what you get

**POST /api/auth/login {email, password}**

Response:

```json
{
  "token": "eyJ...",
  "user": {
    "id": "...",
    "email": "fadumo@nexa.com",
    "fullName": "Fadumo Abdi",
    "role": "RECEPTIONIST",
    "branchIds": ["cmtu78d3n..."],
    "branchAll": false,
    "branches": [
      {"id":"cmtu78d3n...","name":"Berbera Branch","slug":"berbera-branch","isActive":true}
    ]
  }
}
```

- `branchIds: []` and `branchAll: true` means all branches.
- `branchIds: ["id"]` and `branchAll:false` means pinned to one.
- `branchIds: ["id1","id2"]` means a few.

Same shape comes from **GET /api/auth/me** (use it to refresh after an admin moves someone).

The token also carries `branchIds` and `branchAll` for backend checks. You do not need to decode it — use the body.

Store both `token` and `user` in localStorage (`nexacare_auth`) like before. Show the branch name(s) in the header.

**Optional Google login**

If `VITE_GOOGLE_CLIENT_ID` is set and backend has `GOOGLE_CLIENT_ID` in `.env`, show a Google button that gets an `idToken` via `google.accounts.id` and calls:

```
POST /api/auth/google {idToken}
```

Same response shape. If the env is empty, hide the button — the endpoint is disabled.

---

## 2. Branches — the new resource

Base path: `/api/branches` (authenticated)

| Method | Path | Who | What |
|--------|------|-----|------|
| POST | /api/branches | ADMIN | Create. Body {name, slug?, address?, phone?}. Slug auto from name if omitted. |
| GET | /api/branches | any auth | List with pagination. Query ?search=&isActive=&page=&limit= |
| GET | /api/branches/select | any auth | Minimal list for dropdowns. Returns [{id,name,slug,isActive,address}] where isActive=true |
| GET | /api/branches/:id | any auth | Detail |
| PUT | /api/branches/:id | ADMIN | Update name/address/phone/slug |
| PATCH | /api/branches/:id/block | ADMIN | Archive. Body {reason?}. Sets isActive=false. Blocks logins/creates for that branch. |
| PATCH | /api/branches/:id/unblock | ADMIN | Restore |
| DELETE | /api/branches/:id | ADMIN | Only if no appointments/doctors linked. Otherwise archive. |

Seed creates Main Branch (slug main-branch). Create more from the UI and allow renaming Main Branch via PUT.

Branch object:

```json
{"id":"...","name":"Berbera Branch","slug":"berbera-branch","address":"Berbera","isActive":true,"blockedAt":null,"blockedReason":null}
```

---

## 3. Users — now multi-branch

**POST /api/users**

Body:

```json
{
  "fullName":"Amina Ali",
  "email":"amina@test.com",
  "password":"Test@123",
  "role":"RECEPTIONIST",
  "branchIds": ["id1","id2"]
}
```

- `branchIds` optional. `[]` or omitted or `null` = all branches.
- Also accepts `branchId: "id"` for backward compat (single).
- Empty means all — show placeholder "Leave empty for all branches" in the form.

**PUT /api/users/:id** same. To move someone temporarily, just change branchIds. They need a refresh: call GET /api/auth/me and re-store, or force re-login.

**GET /api/users?branchId=...** filter by branch. Listing shapes now include branch info:

```json
{"id":"...","fullName":"...","email":"...","role":"...","branchIds":["..."],"branchAll":false,"branches":[...]}
```

---

## 4. How to make the work smooth

### Who sees the branch picker

- Single-branch user (branchIds length 1, branchAll false): *hide* picker, show static badge "Berbera Branch". Appointments automatically get that branch.
- Multi-branch (length >1) or all (branchAll true): *show* a select. Populate via GET /api/branches/select. Store selectedBranchId in localStorage (e.g. nexacare_selected_branch) and in your state. Include it everywhere.

### Appointments — always branch-scoped

**POST /api/appointments**

```json
{
  "doctorId":"...",
  "patientId":"...",
  "serviceId":"...",
  "date":"2026-09-10",
  "startTime":"09:00",
  "endTime":"09:30",
  "branchId":"cmtu78d3n..."
}
```

- Single-branch user: branchId is ignored and forced to your one. You can omit it.
- Multi/all: branchId is *required*. Send the selectedBranchId or you get 400 "branchId is required. Pick a branch from the selector." and 403 if not assigned to that branch.
- Doctor/service must belong to that branch or 400.
- Archived branch id is rejected.

**GET /api/appointments?branchId=...**

- Single: server ignores your query and forces your branch. Don't send one if you like.
- Multi: send ?branchId=selectedBranchId or ?branchId=all. If you send nothing as multi/all, you get aggregated across allowed branches.
- Add branchId to React Query keys: ['appointments', selectedBranchId, filters] or switching branches shows stale data.
- Update is branch-immutable — don't send a new branchId on PUT /appointments/:id. Move, if needed, is separate.

### Doctors and services — same pattern

**POST /api/doctors** body includes {fullName,specialty,phone, branchId}. Single-branch auto-filled, multi/all requires branchId. Same for **POST /api/services** (name uniqueness is per branch).

**GET /api/doctors?branchId=...** and **GET /api/services?branchId=...** — filter dropdowns via ?branchId=selectedBranchId.

### Dashboard and notifications — also filtered

**GET /api/dashboard?branchId=...** — pass selected Branch or "all". Without it, single returns its branch, all returns aggregated.

**GET /api/notifications?branchId=...** — same. Creating a notification automatically tags branchId if you pass it.

### If someone gets moved while logged in

Call **GET /api/auth/me** after any user-branch change and update localStorage/token. Or show toast "You've been moved — please log in again" — backend will also reject their next call with 403 if they kept an old token for an archived single branch.

---

## 5. Tiny contract to keep you sane

- New rows get branchId at create. Old rows have null — they will not appear in branch-filtered lists. No need to handle null unless you build a migration button.
- Index on branchId is nullable — not a break. Regular queries use it; null rows just don't match equality.
- Global email stays unique — same email cannot be in two branches.
- Leave everything else shape-compatible. All existing pages keep same props except they now send branchId.

---

## 6. What to build

Check these off:

- Branch select in the header/layout — hide for single, show for multi/all
- Branches page for ADMIN — list, create, edit, archive/unblock, delete (only empty)
- User form — multi-select for branches, empty = all
- Appointment form — require branch select when needed, filter doctor/service options by selected branch
- API helpers — add branchId param to appointments/doctors/services/dashboard/notifications calls, include it in query keys
- Handle archived — toast on 400/403, hide archived branches from selects, show red ARCHIVED badge in admin list

That's it — the rest of the app stays as is. Keep the select visible, send the branch, and the backend does the rest.
