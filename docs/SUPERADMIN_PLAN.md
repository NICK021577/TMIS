# UniFyle — Super Admin Plan

Source of truth: **TMIS Chapter 1 (revised)**, Table 1 and Features 1, 2 and 14, plus the Figma Make draft (`SUPERADMIN UI.zip`).

## 1. What the Super Administrator is for

Chapter 1, Table 1:

> **Super Administrator** — *Manages the overall platform.* Main functions: **onboard agencies; manage user access and global system settings.**

Feature 1 adds the rules that shape this console:

- The Super Admin onboards agencies; all other data is **scoped to the agency**.
- Agency Administrators manage their own agency's users, roles and permissions. The Super Admin does **not** run an agency's day-to-day work.
- One participant account works across every agency (Feature 14), so participant accounts live at platform level.

**Design rule:** the Super Admin sees *platform health and agency status*, never an agency's private records (activities, attendance, budgets). If a screen needs that, it belongs in the agency console.

## 2. Modules (what to build, in priority order)

| # | Module | Why it is needed (Chapter 1) | Priority | Status |
|---|--------|------------------------------|----------|--------|
| M1 | **Platform Dashboard** | Overview of agencies, pending applications, suspended agencies and recent sensitive actions | Must | Built (mock data) |
| M2 | **Applications queue** | "Onboard agencies": sign-up creates an application; no workspace exists until approved | Must | Built (mock data) |
| M3 | **Agencies** | Every workspace on the platform; create directly (pilot agency such as PRRI), suspend, reactivate | Must | Built (mock data) |
| M4 | **Users & access** | "Manage user access": platform admins, plus a read-and-act list of all accounts (agency staff, participants): suspend, force password reset | Must | Built (mock data) |
| M5 | **Global settings** | "Global system settings": defaults every new agency starts with (activity types, document types, budget categories, certificate defaults) | Must (keep small) | Built (mock data) |
| M6 | **Audit log** | Approve, reject, suspend and create are sensitive; a read-only log is cheap and protects the Super Admin | Should | Built (mock data) |
| M7 | **Register your agency** (public, 5-step form) | Feeds M2; already in the Figma draft | Must | Basic form exists; 5-step version is next |

### Are Global settings and Audit log necessary?

- **Global settings: yes, but keep it small.** Chapter 1 names it, and Feature 9 says each agency sets its own required document types. The Super Admin only supplies the **starting defaults**, so a new agency isn't empty. Do **not** add per-agency overrides here.
- **Audit log: keep, read-only.** It isn't named in Chapter 1, but multi-tenant platforms need a record of who approved, rejected or suspended an agency. The dashboard's "Recent activity" already needs the same data, so the cost is one table.

### Deliberately left out (not in Chapter 1)

| Idea | Decision |
|------|----------|
| Billing and subscriptions | Out of scope. |
| Editing an agency's activities, budgets or attendance | Never. Breaks tenant isolation. |
| Agency branding editor | Agencies do it themselves (Feature 2). |
| Platform-wide messaging or announcements | Later. Messaging is per agency and activity today. |
| Usage analytics across agencies (adoption, sync health, storage) | Later (M8). Good for the defense demo, not needed for the core. |

## 3. File codes (same convention as the admin side)

```
client/src/
├─ components/
│  ├─ layout/
│  │  ├─ SuperAdminLayout.jsx          shell + route guard (role must be "Super Admin")
│  │  ├─ SuperAdminSidebar.jsx         own sidebar (Platform console)
│  │  └─ SuperAdminTopbar.jsx          "Signed in as Super Administrator", Sign out
│  ├─ pages/Super_Admin/
│  │  ├─ PlatformDashboard.jsx         M1   route /platform
│  │  ├─ Applications.jsx              M2   route /platform/applications
│  │  ├─ Agencies.jsx                  M3   route /platform/agencies
│  │  ├─ PlatformUsers.jsx             M4   route /platform/users
│  │  ├─ GlobalSettings.jsx            M5   route /platform/settings
│  │  ├─ AuditLog.jsx                  M6   route /platform/audit
│  │  └─ RegisterAgency.jsx            M7   route /register-agency (public)
│  └─ ui/Drawer.jsx                    shared side panel (review / detail / create)
├─ context/
│  ├─ platformContext.js               createContext
│  └─ PlatformProvider.jsx             applications, agencies, audit log, decisions
├─ hooks/usePlatform.js
└─ data/platformData.js                mock data ported from the Figma draft
```

> Naming note: you suggested `superadmin_sidebar.jsx`. The rest of the project uses PascalCase component files (`Sidebar.jsx`, `Topbar.jsx`), so it is `SuperAdminSidebar.jsx`.

## 4. Sidebar

```
PLATFORM
  Dashboard          M1
  Applications  (3)  M2   badge = open applications
  Agencies           M3
MANAGEMENT
  Users & access     M4
  Global settings    M5
GOVERNANCE
  Audit log          M6
─────────
  Sign out
```

## 5. What each module shows

- **M1 Dashboard:** Active agencies · Pending applications · Suspended · Total accounts. "Needs your attention" (oldest open applications) and "Recent activity" (last audit entries).
- **M2 Applications:** table with status (Pending, Under review, Needs info, Approved, Rejected). Click a row → review drawer with contact, verification documents (authorization letter, MOA), **Approve / Request info / Reject**. Reject requires a reason. Approving creates the workspace and makes the contact person the first **Agency Administrator**.
- **M3 Agencies:** table + **Create agency directly** (for pilot agencies such as PRRI). Click a row → drawer with agency ID, Agency Administrator, usage summary, **Suspend / Reactivate** (users of a suspended agency cannot sign in).
- **M4 Users & access:** tab 1 *Platform admins* (Super Administrator accounts); tab 2 *All accounts* (name, role, agency, status) with suspend and password reset. Participants appear once, with the number of agencies they belong to.
- **M5 Global settings:** Activity types · Document types · Budget categories · Certificate defaults (minimum attendance, feedback and reentry plan required). Add and remove chips.
- **M6 Audit log:** When · Who · Action · Target, with search and an action filter.

## 6. Data and API sketch (for the MERN server)

| Module | Collection | Endpoints |
|--------|-----------|-----------|
| M2 | `applications` (agency, acronym, type, region, contact, email, docs[], status, reason, submittedAt) | `GET/PATCH /api/platform/applications/:id` |
| M3 | `agencies` (agencyId, name, type, region, status, adminUserId, createdAt) | `GET/POST /api/platform/agencies`, `PATCH /:id/status` |
| M4 | `users` (role, agencyIds[], status) | `GET /api/platform/users`, `PATCH /:id/status`, `POST /:id/reset-password` |
| M5 | `platformSettings` (single doc) | `GET/PUT /api/platform/settings` |
| M6 | `auditLog` (who, action, target, at) | `GET /api/platform/audit` (append-only; written by the server on every sensitive action) |

All `/api/platform/*` routes require `role === "Super Admin"`.

## 7. Temporary access

The sign-in page has a **temporary "Super Admin console" button** (dashed, marked TEMP). It signs in as a demo Super Administrator and opens `/platform`. **Remove it before release.** Real sign-in should route by the account's role.
