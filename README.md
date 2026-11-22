# TMIS (UniFyle)

Training and Extension Management Information System. React console (`client/`) and a Node/Express API (`server/`) on MySQL.

## Run it

1. **Database.** Create an empty MySQL/MariaDB database named `tmis_db` (XAMPP works).
2. **Server settings.** In `server/`, copy `.env.example` to `.env` and fill in `JWT_SECRET` (any long random string) and your database user and password if they are not the XAMPP defaults.
3. **Tables and starter accounts.**
   ```
   cd server
   npm install
   npm run db:setup
   ```
   `db:schema` creates the 53 tables from `server/db/schema.sql`; `db:seed` adds the super admin, the sample agency (PRRI) and its administrator. Both are safe to run again.
4. **Start both.**
   ```
   cd server && npm run dev      # API on http://localhost:5000
   cd client && npm run dev      # console, forwards /api to the server
   ```

## Accounts (development only)

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@gmail.com` | set in `server/db/seed.js` |
| Agency Administrator (PRRI) | `alexis.ramos@prri.gov.ph` | set in `server/db/seed.js` |
| Committee Member (PRRI) | `m.flores@prri.gov.ph` | set in `server/db/seed.js` |

Passwords are stored hashed (bcrypt). Change or delete these accounts before real use.

More people are added by an Agency Administrator in **Agency settings → Users → Add user**. The new person gets a temporary password (shown once) and must choose their own at first sign-in. Users, roles, default menus and per-person menus are saved in the database.

## Data model

`docs/data-model/` holds the logical data model (diagram, Word document, change notes). `server/db/schema.sql` is generated from it:

```
python docs/data-model/build_schema_sql.py
```

## Status

Connected to the database: sign-in, password change, agency users, roles and menus. The rest of the console (activities, budget, partners, funding sources, and so on) still shows in-memory sample data and is connected module by module.
