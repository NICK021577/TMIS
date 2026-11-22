# TMIS (UniFyle)

Training and Extension Management Information System. A React web console (`client/`) and a Node/Express API (`server/`) on MySQL. Pilot agency: PRRI.

> **Group members: read this before you pull.** The project now has a real database and a real login, so a plain `git pull` and `npm run dev` is no longer enough. Follow "First-time setup" below once, then "Every day".

---

## What changed in this update

- **Database.** The app now uses MySQL (`tmis_db`), 53 tables generated from our data model.
- **Real sign-in.** Passwords are hashed, the server issues a session token, and a new user must replace their temporary password at first sign-in.
- **Agency users and roles are saved in the database.** Settings → Users (add, change role, suspend, per-person menus) and Settings → Roles (default menus) work for real.
- **Menus come from the server.** What a person sees in the sidebar is decided by their role and their own menu changes, and is refreshed on every page load.
- **New in Settings:** Partner agencies and Funding sources (still sample data, see the status table).
- **UI:** header search is now a dropdown (no blurred page), the account menu has only About agency and Help, and the "View as" role switcher is gone. Sign out is at the bottom of the left menu.

---

## Requirements

- **Node.js 20 or newer** (we tested on 24) and npm
- **XAMPP** (or any MySQL/MariaDB). XAMPP's MariaDB works fine.
- Git

---

## First-time setup

Do these once, in order.

**1. Pull this branch**

```
git fetch
git checkout db-login-and-agency-users
```

**2. Start MySQL.** Open XAMPP and start **MySQL**. Then create an empty database called `tmis_db`: open phpMyAdmin (http://localhost/phpmyadmin) → **New** → name it `tmis_db`, collation `utf8mb4_unicode_ci` → **Create**.

**3. Server settings.** In `server/`, copy `.env.example` to `.env` and fill it in:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tmis_db
JWT_SECRET=<any long random string>
```

The XAMPP defaults (user `root`, empty password) need no change. To make a `JWT_SECRET`:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`.env` is private to your computer and is never committed. Do not share your `JWT_SECRET`.

**4. Install, create the tables and the starter accounts**

```
cd server
npm install
npm run db:setup
cd ../client
npm install
```

`db:setup` creates the 53 tables and adds the starter accounts and the sample agency (PRRI). It is safe to run again; anything that already exists is left alone.

---

## Every day

Open two terminals.

```
cd server && npm run dev       # API at http://localhost:5000 (restarts when you save)
cd client && npm run dev       # console at http://localhost:5173
```

The console forwards `/api` to the server, so you only open the console address. If the page says it cannot reach the server, the API terminal is not running.

**After every pull**, if the log shows changes in `package.json`, `server/db/` or `docs/data-model/`:

```
cd server && npm install && npm run db:schema      # adds any new tables
cd ../client && npm install
```

If someone added a file in `server/db/migrations/`, run it too (see "The database" below).

---

## Accounts (development only)

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@gmail.com` | in `server/db/seed.js` |
| Agency Administrator (PRRI) | `alexis.ramos@prri.gov.ph` | in `server/db/seed.js` |
| Committee Member (PRRI) | `m.flores@prri.gov.ph` | in `server/db/seed.js` |

Passwords are stored hashed (bcrypt). **Change or delete these accounts before the system is used for real**, and never reuse a real password here.

To add more people, sign in as the Agency Administrator → **Agency settings → Users → Add user**. They get a temporary password (shown once, so copy it then) and choose their own at first sign-in.

---

## What is real and what is sample data

| Area | Status |
|---|---|
| Sign-in, change password, session | Database |
| Agency users, roles, default menus, per-person menus | Database |
| Everything else (dashboard, calendar, activities, budget, participants, partners, funding sources, categories, branding, messaging, reports) | **In memory sample data.** It resets when the page reloads. Being connected to the database one module at a time |
| AI report | Template text only. No AI service connected yet |

So if something you add "disappears" after a refresh, that is expected for the in-memory areas, not a bug.

---

## Project layout

```
client/                    React 19 + Vite + Tailwind v4
  src/components/pages/    Admin (agency console), Super_Admin, Public, Guest (login)
  src/components/settings/ Agency settings tabs (Users and Roles use the API)
  src/context/             AuthContext (session), StoreProvider (in-memory sample data)
  src/lib/api.js           the one function that calls the server
  src/lib/menus.js         the menu list

server/                    Node + Express 5 + MySQL
  server.js                app entry
  routes/auth.js           sign-in, /me, change password
  routes/agency.js         users and roles (Agency Administrators only)
  middleware/auth.js       token check, administrator check
  db/schema.sql            GENERATED, do not edit by hand
  db/seed.js               starter data and sample accounts
  db/migrations/           one-off upgrades for databases made before a change
  components/models/       OLD MongoDB models, not used. Ignore them for now

docs/data-model/           the data model: diagram, Word document, change notes, generator scripts
```

---

## The database

- The **data model** lives in `docs/data-model/build_data_model.py`. It is the single source of truth.
- `server/db/schema.sql` is **generated** from it. Do not edit `schema.sql` by hand. To change the database:
  1. edit `build_data_model.py`,
  2. regenerate: `python docs/data-model/build_schema_sql.py` (and `build_data_model.py` / `build_data_model_doc.py` for the diagram and Word document),
  3. apply: `cd server && npm run db:schema` (creates new tables only; it does not alter existing ones),
  4. for a change to an **existing** table, add a script in `server/db/migrations/` that alters it, so teammates can upgrade their copy.
- A teammate who set up the database **before** the partner tables were added needs to run, once: `cd server && node db/migrations/001_partner_agency.js`. A brand-new database does not need it.
- The database is on your own computer. Each person has their own `tmis_db`, so what you add while testing does not show up for others.

---

## Working with git

- Do **not** commit directly to `main`. Make a branch for your work and open a pull request.
- **Never commit `server/.env`.** It is already ignored. Do not paste it into chat or screenshots.
- Git on Windows may warn "LF will be replaced by CRLF". That is harmless.
- Large changes to `docs/data-model/` (the `.docx`, `.png`, `.svg`) are generated files. Regenerate them with the scripts instead of editing them.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot reach the server" on the login page | The API is not running. Run `npm run dev` in `server/` |
| API says `JWT_SECRET is missing` | Create `server/.env` from `.env.example` and set `JWT_SECRET` |
| API says `Database is not reachable` / `ECONNREFUSED` | Start **MySQL** in XAMPP, and check `DB_*` in `.env` |
| `Unknown database 'tmis_db'` | Create the empty `tmis_db` first (setup step 2) |
| `Access denied for user` | Your MySQL user or password is not the XAMPP default. Fix `DB_USER` and `DB_PASSWORD` in `.env` |
| `EADDRINUSE` on port 5000 or 5173 | Something is already running there (often your own earlier terminal). Close it, or change `PORT` in `.env`. Vite moves to the next free port by itself |
| Login says the email or password is wrong | Check the accounts table above. After 5 wrong tries sign-in pauses for 15 minutes |
| A page looks old after a pull | Hard refresh with Ctrl+F5, and sign in again. Sessions are cleared when you close the tab |
| A new tab in Settings is missing | Hard refresh (Ctrl+F5). The page was open while the code changed |

---

## More documents

- `docs/data-model/TMIS_Logical_Data_Model_v3.docx` — the full data model with every table explained
- `docs/data-model/CHANGES_v2_to_v3.md` — what changed in each revision of the model
- `docs/SUPERADMIN_PLAN.md` — the Super Admin plan
