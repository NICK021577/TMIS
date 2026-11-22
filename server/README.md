# UniFyle (TMIS) API

REST API for UniFyle (TMIS), built with Express 5 and a Supabase Postgres database.

## Contents

- [Getting started](#getting-started)
- [Basics](#basics)
- [Authentication](#authentication)
- [Errors](#errors)
- [Users](#users)
- [Standard resource endpoints](#standard-resource-endpoints)
- [Resource reference](#resource-reference)
- [Known limitations](#known-limitations)

## Getting started

Requires Node.js 18 or newer.

```bash
cd server
npm install
cp .env.example .env    # then fill in the values below
npm run dev             # starts the API with auto-reload (or: npm start)
```

### Environment variables (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Supabase connection string (Project > Connect). Special characters in the password (`@ : / # ? %`) must be percent-encoded. |
| `JWT_SECRET` | yes | Long random string used to sign login tokens. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `PORT` | no | Port to listen on. Default `8000`. |
| `NODE_ENV` | no | `development` (default) or `production`. In production, error responses hide stack traces and the login cookie is `Secure`. |
| `SALT` | no | bcrypt cost for password hashing. Default `10`. |
| `ALLOWED_ORIGINS` | no | Comma-separated frontend URLs. Read by the config, but not applied yet; see [Known limitations](#known-limitations). |

### Database

You do not need to create tables by hand. When the server starts, each model checks its table and creates it if it is missing (like Mongoose's `autoCreate`). Tables are created in dependency order, so a table always comes after the tables it references.

| Command | What it does |
|---|---|
| `npm run db:schema` | Creates any missing tables without starting the server. |
| `npm run db:seed` | Adds starter data. Safe to run again: existing records are left as they are. |
| `npm run db:setup` | Both of the above. |

The seed creates these **development-only** accounts. Change their passwords or delete them before real use.

| Account | Email | Password |
|---|---|---|
| Super Admin | `superadmin@gmail.com` | `12345678` |
| Agency Administrator (PRRI) | `alexis.ramos@prri.gov.ph` | `Prri-Admin-2026` |
| Committee Member (PRRI) | `m.flores@prri.gov.ph` | `Prri-Committee-2026` |

It also creates the PRRI agency, its four built-in roles (Agency Administrator, Committee Member, Resource Person, Participant) and each role's default menus.

Missing tables are created, but existing tables are **not** changed. If you change a field in a model, update the column in Supabase yourself (or drop the table so it is recreated).

## Basics

- **Base URL:** `http://localhost:8000/api` (the port is `PORT` from `.env`).
- **Format:** request and response bodies are JSON. Send `Content-Type: application/json`. Bodies larger than 1 MB are rejected.
- **Field names** are `snake_case`, exactly as in the [resource reference](#resource-reference).
- **IDs** are auto-increment integers assigned by the database. An `id` sent in a request body is ignored. Two resources use a different key: [`/api/participant-profiles`](#apiparticipant-profiles) uses `user_id` and [`/api/platform-settings`](#apiplatform-settings) uses `key`.
- **Dates:** date-time fields are ISO 8601 strings (`2026-11-22T12:29:27.000Z`). Date-only fields use `YYYY-MM-DD` and time fields use `HH:MM`.
- **JSON fields** (for example `agency.values` or `platform_setting.value`) take any JSON value: an object, array, string, number or boolean.
- **Health check:** `GET /api/health` returns `200 {"status":"OK"}`. It needs no login.

## Authentication

Every endpoint needs a logged-in user except `GET /api/health`, `POST /api/users/register` and `POST /api/users/login`.

### Logging in

`POST /api/users/login` with an email (or contact number), the password, and the kind of client:

```json
{
  "email": "superadmin@gmail.com",
  "password": "12345678",
  "client": "mobile"
}
```

| Field | Required | Notes |
|---|---|---|
| `email` or `contact` | one of them | If both are sent, `email` is used. |
| `password` | yes | |
| `client` | yes | `web` or `mobile`. Anything else returns `400 Invalid client type`. |

**`"client": "mobile"`:** the token comes back in the response body. It is valid for **1 hour**.

```json
{
  "message": "Login successful",
  "user": { "id": 1, "email": "superadmin@gmail.com", "first_name": "Elena", "last_name": "Cruz", "is_super_admin": true, "...": "..." },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Send it on every request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**`"client": "web"`:** the token is set as an `httpOnly` cookie named `token`, valid for **1 day**. The response body has `message` and `user` but no `token`. The browser sends the cookie automatically; use `credentials: 'include'` with `fetch` (or `withCredentials: true` with axios).

Login errors:

| Status | Message | When |
|---|---|---|
| 400 | `Email or contact is required` / `Password is required` / `Client is required` / `Invalid client type` | A field is missing or `client` is not `web` or `mobile`. |
| 401 | `Invalid credentials` | No account with that email or contact, or the password is wrong. |
| 403 | `Account is suspended` | The user's `status` is `suspended`. |

A successful login also updates the user's `last_sign_in_at`.

### Roles

The token carries a `role`:

| Role | Who |
|---|---|
| `Super Admin` | Users with `is_super_admin = true`. |
| `User` | Everyone else. |

Most resources are open to any logged-in user. A few are limited to the Super Admin; the [resource reference](#resource-reference) shows the access rule for each one.

No endpoint can make someone a Super Admin. Set `is_super_admin` to `true` for that user in the Supabase table editor, or use the seeded Super Admin account.

### Authentication errors

| Status | Body | When |
|---|---|---|
| 401 | `{"success": false, "message": "Authentication required"}` | No token was sent. |
| 401 | `{"success": false, "message": "Invalid or expired token."}` | The token is invalid or has expired. Log in again. |
| 403 | `{"message": "Access denied"}` | Logged in, but the endpoint needs the Super Admin role. |

## Errors

Errors use this shape:

```json
{
  "success": false,
  "message": "type must be one of: government, academic, private, non_profit",
  "details": { "type": "type must be one of: government, academic, private, non_profit" }
}
```

- `details` is only present when there is more to say. For validation errors it is an object with one message per field. For database errors it is the database's explanation, for example `"Key (email)=(ana@test.org) already exists."`.
- Outside production, responses also include a `stack` field for debugging.

| Status | Meaning |
|---|---|
| 400 | Invalid input: a required field is missing, a value is the wrong type or not in its allowed list, a string is too long, an id in the URL is not a number, or the JSON body cannot be parsed (`Invalid JSON payload`). |
| 401 | Not logged in, or the token is invalid or expired. |
| 403 | Logged in, but not allowed (wrong role or suspended account). |
| 404 | The record does not exist (`Agency not found`), or the route does not exist (`Route not found: GET /api/nope`). |
| 409 | Conflict: a unique field is already taken (`Record already exists`), a referenced record does not exist, or a record cannot be deleted because other records still use it (`A related record does not exist, or this record is still used by other records`). |
| 500 | Unexpected server error. |

## Users

Base path: `/api/users`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/api/users/register` | Public | Create an account. |
| `POST` | `/api/users/login` | Public | Log in. See [Logging in](#logging-in). |
| `GET` | `/api/users/:id` | Any logged-in user | Get one user. |
| `GET` | `/api/users` | Super Admin | List all users. |
| `DELETE` | `/api/users/:id` | Super Admin | Delete a user. Returns the deleted user. |

There is no endpoint for updating a user yet.

### `POST /api/users/register`

```json
{
  "email": "ana@example.org",
  "password": "at-least-8-chars",
  "first_name": "Ana",
  "last_name": "Reyes",
  "middle_name": "Santos",
  "contact": "09171234567"
}
```

| Field | Required | Notes |
|---|---|---|
| `email` | yes | Valid email, max 255 characters. Stored lowercase, so `Ana@Example.org` and `ana@example.org` are the same account. |
| `password` | yes | At least 8 characters. Stored as a bcrypt hash. |
| `first_name`, `last_name` | yes | Max 100 characters each. |
| `middle_name`, `contact` | no | Max 100 characters each. |

New accounts start with `status: "active"`, `is_super_admin: false` and `must_reset_password: false`.

Returns `201` with the created user. Returns `409 Email already exists` if the email is taken.

### User object

Every user endpoint returns users in this shape. The password is never included.

```json
{
  "id": 1,
  "email": "ana@example.org",
  "first_name": "Ana",
  "middle_name": "Santos",
  "last_name": "Reyes",
  "contact": "09171234567",
  "status": "active",
  "is_super_admin": false,
  "must_reset_password": false,
  "last_sign_in_at": "2026-11-22T12:30:00.000Z",
  "created_at": "2026-11-22T12:29:27.000Z"
}
```

`status` is `active` or `suspended`. Suspended users cannot log in.

## Standard resource endpoints

Every resource in the [resource reference](#resource-reference) has the same five endpoints. Replace `/api/agencies` with the resource's base path:

| Method | Path | Description | Success |
|---|---|---|---|
| `GET` | `/api/agencies` | List **all** records. | `200` with an array |
| `GET` | `/api/agencies/:id` | Get one record. | `200` with the record |
| `POST` | `/api/agencies` | Create a record. | `201` with the created record |
| `PUT` | `/api/agencies/:id` | Update a record. | `200` with the updated record |
| `DELETE` | `/api/agencies/:id` | Delete a record. | `200` with the deleted record |

`GET`, `PUT` and `DELETE` on an id that does not exist return `404` (for example `Agency not found`).

**Creating**

- Send the fields from the resource's table. Fields marked **yes** are required; fields with a default can be left out.
- Fields marked **auto** are filled in by the server. Anything sent for them is ignored or overwritten.
- `created_by` is always set to the logged-in user, whatever the request body says.
- Fields not listed for the resource are ignored.

```http
POST /api/agencies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Department of Agriculture Region 1",
  "short_name": "DA-R1",
  "type": "government",
  "region": "Ilocos",
  "brand_color": "#0a7f5a"
}
```

**Updating**

- `PUT` is a **partial** update: send only the fields you want to change. Fields you leave out keep their current values.
- `updated_by` is set to the logged-in user and `updated_at` to the current time.
- `id`, `created_by` and the record's primary key cannot be changed.
- To clear an optional field, send `null`.

```http
PUT /api/agencies/1
Authorization: Bearer <token>
Content-Type: application/json

{ "region": "Region I" }
```

**Deleting**

A record that other records still point to cannot be deleted; this returns `409`. Delete or reassign those records first. The exception is fields noted as *deleted together with its parent*: those child records are removed automatically when their parent is deleted.

## Resource reference

How to read the tables:

- **Required:** **yes** means it must be sent when creating. **auto** means the server fills it in. **no** means it has a default. Empty means optional (`null` when not sent).
- **id of a `table`** means the value must be the `id` of an existing record in that table (for example `agency_id: 3`). If it does not exist the request fails with `409`.

**Resources by area:**

- **Platform:** [`/api/agency-applications`](#apiagency-applications) [`/api/application-documents`](#apiapplication-documents) [`/api/audit-logs`](#apiaudit-logs) [`/api/platform-default-items`](#apiplatform-default-items) [`/api/subscription-plans`](#apisubscription-plans) [`/api/platform-settings`](#apiplatform-settings) 
- **Agencies, people & access:** [`/api/agencies`](#apiagencies) [`/api/participant-profiles`](#apiparticipant-profiles) [`/api/agency-roles`](#apiagency-roles) [`/api/participant-categories`](#apiparticipant-categories) [`/api/agency-memberships`](#apiagency-memberships) [`/api/role-menus`](#apirole-menus) [`/api/membership-menus`](#apimembership-menus) [`/api/invitations`](#apiinvitations) [`/api/invitation-redemptions`](#apiinvitation-redemptions) [`/api/agency-followers`](#apiagency-followers) [`/api/agency-subscriptions`](#apiagency-subscriptions) [`/api/notifications`](#apinotifications) 
- **Planning & agency setup:** [`/api/activity-types`](#apiactivity-types) [`/api/partner-agencies`](#apipartner-agencies) [`/api/funding-sources`](#apifunding-sources) [`/api/budget-categories`](#apibudget-categories) [`/api/document-types`](#apidocument-types) [`/api/annual-budgets`](#apiannual-budgets) [`/api/calendar-entries`](#apicalendar-entries) 
- **Activities & participants:** [`/api/activities`](#apiactivities) [`/api/activity-objectives`](#apiactivity-objectives) [`/api/activity-outcomes`](#apiactivity-outcomes) [`/api/activity-partners`](#apiactivity-partners) [`/api/staffing`](#apistaffing) [`/api/registrations`](#apiregistrations) [`/api/certificate-rules`](#apicertificate-rules) [`/api/certificates`](#apicertificates) 
- **Sessions, attendance & feedback:** [`/api/sessions`](#apisessions) [`/api/attendance`](#apiattendance) [`/api/materials`](#apimaterials) [`/api/documents`](#apidocuments) [`/api/feedback-questions`](#apifeedback-questions) [`/api/feedback`](#apifeedback) [`/api/feedback-answers`](#apifeedback-answers) [`/api/session-feedback-summaries`](#apisession-feedback-summaries) [`/api/activity-feedback-summaries`](#apiactivity-feedback-summaries) 
- **Budget & resources:** [`/api/budget-items`](#apibudget-items) [`/api/actual-costs`](#apiactual-costs) [`/api/resources`](#apiresources) 
- **Outputs & reports:** [`/api/reentry-plans`](#apireentry-plans) [`/api/output-submissions`](#apioutput-submissions) [`/api/activity-reports`](#apiactivity-reports) [`/api/activity-report-sections`](#apiactivity-report-sections) 
- **Messaging:** [`/api/message-groups`](#apimessage-groups) [`/api/group-members`](#apigroup-members) [`/api/messages`](#apimessages)

### Platform

#### `/api/agency-applications`

Agency application · table `agency_application` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer |  | id of a `agency` |
| `reviewed_by` | integer |  | id of a `user` |
| `agency_name` | string (max 255) | yes |  |
| `acronym` | string (max 32) | yes |  |
| `agency_type` | string (max 32) | yes |  |
| `region` | string (max 64) | yes |  |
| `contact_first_name` | string (max 100) | yes |  |
| `contact_middle_name` | string (max 100) |  |  |
| `contact_last_name` | string (max 100) | yes |  |
| `contact_email` | string (max 255) | yes | valid email, stored lowercase |
| `contact_phone` | string (max 32) | yes |  |
| `status` | string (max 32) | no | default `"pending"`; one of: `pending`, `under_review`, `needs_info`, `approved`, `rejected` |
| `reason` | string |  |  |
| `submitted_at` | date-time (ISO 8601) | yes |  |
| `reviewed_at` | date-time (ISO 8601) |  |  |

#### `/api/application-documents`

Application document · table `application_document` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `application_id` | integer | yes | id of a `agency_application`; deleted together with its parent |
| `doc_kind` | string (max 32) | yes | one of: `auth_letter`, `moa`, `valid_id` |
| `file_name` | string (max 255) | yes |  |
| `file_ref` | string (max 500) | yes |  |
| `size_bytes` | integer | yes |  |

#### `/api/audit-logs`

Audit log · table `audit_log` · Super Admin only

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer |  | id of a `agency` |
| `action` | string (max 64) | yes |  |
| `target_type` | string (max 32) | yes |  |
| `target_label` | string (max 255) | yes |  |
| `detail` | string |  |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/platform-default-items`

Platform default item · table `platform_default_item` · Read: any logged-in user · Create / update / delete: Super Admin

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `kind` | string (max 32) | yes | one of: `activity_type`, `document_type`, `budget_category` |
| `name` | string (max 255) | yes |  |
| `sort_order` | integer | no | default `0` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `kind` + `name` must be unique.

#### `/api/subscription-plans`

Subscription plan · table `subscription_plan` · Read: any logged-in user · Create / update / delete: Super Admin

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `code` | string (max 32) | yes | unique |
| `name` | string (max 100) | yes |  |
| `description` | string |  |  |
| `price` | decimal (12,2) | yes |  |
| `currency` | string (max 3) | yes |  |
| `billing_period` | string (max 16) | yes | one of: `free`, `monthly`, `yearly` |
| `max_participants` | integer |  |  |
| `max_storage_mb` | integer |  |  |
| `features` | JSON |  |  |
| `is_active` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/platform-settings`

Platform setting · table `platform_setting` · Read: any logged-in user · Create / update / delete: Super Admin · `:id` is the `key`

| Field | Type | Required | Notes |
|---|---|---|---|
| `key` | string (max 64) | yes | primary key (used as `:id` in the URL) |
| `value` | JSON | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

### Agencies, people & access

#### `/api/agencies`

Agency · table `agency` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `name` | string (max 255) | yes | unique |
| `short_name` | string (max 32) | yes | unique |
| `type` | string (max 32) | yes | one of: `government`, `academic`, `private`, `non_profit` |
| `region` | string (max 64) | yes |  |
| `status` | string (max 20) | no | default `"active"`; one of: `active`, `suspended` |
| `mission` | string |  |  |
| `vision` | string |  |  |
| `mandate` | string |  |  |
| `values` | JSON |  |  |
| `contact_email` | string (max 255) |  | valid email, stored lowercase |
| `logo_url` | string (max 500) |  |  |
| `cover_url` | string (max 500) |  |  |
| `brand_color` | string (max 20) | yes |  |
| `welcomed_at` | date-time (ISO 8601) |  |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/participant-profiles`

Participant profile · table `participant_profile` · Any logged-in user · `:id` is the `user_id`

| Field | Type | Required | Notes |
|---|---|---|---|
| `user_id` | integer | yes | primary key (used as `:id` in the URL); id of a `user`; deleted together with its parent |
| `sex` | string (max 16) |  |  |
| `birth_date` | date (`YYYY-MM-DD`) |  |  |
| `province` | string (max 100) |  |  |
| `municipality` | string (max 100) |  |  |
| `avatar_url` | string (max 500) |  |  |
| `onboarded_at` | date-time (ISO 8601) |  |  |

#### `/api/agency-roles`

Agency role · table `agency_role` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `name` | string (max 100) | yes |  |
| `data_access` | string (max 32) | yes | one of: `all_records`, `assigned_activities`, `assigned_sessions` |
| `is_system` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `agency_id` + `name` must be unique.

#### `/api/participant-categories`

Participant category · table `participant_category` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `name` | string (max 255) | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `agency_id` + `name` must be unique.

#### `/api/agency-memberships`

Agency membership · table `agency_membership` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `user_id` | integer | yes | id of a `user` |
| `role_id` | integer | yes | id of a `agency_role` |
| `category_id` | integer |  | id of a `participant_category` |
| `affiliation` | string (max 255) |  |  |
| `status` | string (max 20) | no | default `"invited"`; one of: `invited`, `pending`, `active`, `suspended` |
| `joined_at` | date-time (ISO 8601) | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `agency_id` + `user_id` must be unique.

#### `/api/role-menus`

Role menu · table `role_menu` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `role_id` | integer | yes | id of a `agency_role`; deleted together with its parent |
| `menu_key` | string (max 32) | yes | one of: `dashboard`, `calendar`, `activities`, `participants`, `budget`, `reports`, `messaging`, `about`, `settings` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `role_id` + `menu_key` must be unique.

#### `/api/membership-menus`

Membership menu · table `membership_menu` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `membership_id` | integer | yes | id of a `agency_membership`; deleted together with its parent |
| `menu_key` | string (max 32) | yes |  |
| `is_enabled` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `membership_id` + `menu_key` must be unique.

#### `/api/invitations`

Invitation · table `invitation` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `code` | string (max 64) | yes | unique |
| `role_id` | integer |  | id of a `agency_role` |
| `category_id` | integer |  | id of a `participant_category` |
| `affiliation` | string (max 255) |  |  |
| `expires_at` | date-time (ISO 8601) | yes |  |
| `max_uses` | integer | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/invitation-redemptions`

Invitation redemption · table `invitation_redemption` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `invitation_id` | integer | yes | id of a `invitation`; deleted together with its parent |
| `user_id` | integer | yes | id of a `user` |
| `redeemed_at` | date-time (ISO 8601) | yes |  |

The combination `invitation_id` + `user_id` must be unique.

#### `/api/agency-followers`

Agency follower · table `agency_follower` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `user_id` | integer | yes | id of a `user` |
| `followed_at` | date-time (ISO 8601) | yes |  |

The combination `agency_id` + `user_id` must be unique.

#### `/api/agency-subscriptions`

Agency subscription · table `agency_subscription` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `plan_id` | integer | yes | id of a `subscription_plan` |
| `status` | string (max 20) | no | default `"trial"`; one of: `trial`, `active`, `past_due`, `cancelled`, `expired` |
| `starts_on` | date (`YYYY-MM-DD`) | yes |  |
| `ends_on` | date (`YYYY-MM-DD`) |  |  |
| `auto_renew` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/notifications`

Notification · table `notification` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer |  | id of a `agency` |
| `user_id` | integer | yes | id of a `user` |
| `title` | string (max 255) | yes |  |
| `body` | string | yes |  |
| `link` | string (max 255) |  |  |
| `read_at` | date-time (ISO 8601) |  |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |

### Planning & agency setup

#### `/api/activity-types`

Activity type · table `activity_type` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `name` | string (max 255) | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/partner-agencies`

Partner agency · table `partner_agency` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `name` | string (max 255) | yes |  |
| `type` | string (max 100) | yes | one of: `government_agency`, `educational_institution`, `private_company`, `ngo_cooperative_association` |
| `is_self` | boolean | no | default `false` |
| `archived` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `agency_id` + `name` must be unique.

#### `/api/funding-sources`

Funding source · table `funding_source` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `partner_id` | integer |  | id of a `partner_agency` |
| `name` | string (max 255) | yes |  |
| `archived` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `agency_id` + `name` must be unique.

#### `/api/budget-categories`

Budget category · table `budget_category` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `name` | string (max 255) | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/document-types`

Document type · table `document_type` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `name` | string (max 255) | yes |  |
| `required_at_creation` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/annual-budgets`

Annual budget · table `annual_budget` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `funding_source_id` | integer | yes | id of a `funding_source` |
| `activity_type_id` | integer | yes | id of a `activity_type` |
| `year` | integer | yes |  |
| `amount` | decimal (14,2) | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/calendar-entries`

Calendar entry · table `calendar_entry` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_type_id` | integer | yes | id of a `activity_type` |
| `funding_source_id` | integer |  | id of a `funding_source` |
| `title` | string (max 255) | yes |  |
| `planned_start` | date (`YYYY-MM-DD`) | yes |  |
| `planned_end` | date (`YYYY-MM-DD`) | yes |  |
| `planned_venue` | string (max 255) |  |  |
| `status` | string (max 50) | yes |  |
| `published` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

### Activities & participants

#### `/api/activities`

Activity · table `activity` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `calendar_entry_id` | integer |  | id of a `calendar_entry`; unique |
| `activity_type_id` | integer | yes | id of a `activity_type` |
| `funding_source_id` | integer |  | id of a `funding_source` |
| `title` | string (max 255) | yes |  |
| `venue` | string (max 255) | yes |  |
| `start_date` | date (`YYYY-MM-DD`) | yes |  |
| `end_date` | date (`YYYY-MM-DD`) | yes |  |
| `topic` | string (max 255) |  |  |
| `description` | string |  |  |
| `audience` | string (max 255) |  |  |
| `max_participants` | integer |  |  |
| `is_public` | boolean | no | default `false` |
| `status` | string (max 50) | no | default `"draft"`; one of: `draft`, `upcoming`, `ongoing`, `completed`, `cancelled` |
| `join_code` | string (max 32) | yes | unique |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/activity-objectives`

Activity objective · table `activity_objective` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `text` | string (max 500) | yes |  |
| `sort_order` | integer | no | default `0` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/activity-outcomes`

Activity outcome · table `activity_outcome` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `text` | string (max 500) | yes |  |
| `sort_order` | integer | no | default `0` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/activity-partners`

Activity partner · table `activity_partner` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `partner_id` | integer | yes | id of a `partner_agency` |
| `role` | string (max 50) | yes | one of: `implementing`, `funding`, `collaborating`, `participating` |
| `notes` | string |  |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `activity_id` + `partner_id` must be unique.

#### `/api/staffing`

Staffing · table `staffing` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `user_id` | integer | yes | id of a `user` |
| `role_id` | integer | yes | id of a `agency_role` |
| `duty_date` | date (`YYYY-MM-DD`) |  |  |
| `duty` | string (max 255) |  |  |
| `status` | string (max 50) | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/registrations`

Registration · table `registration` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `user_id` | integer | yes | id of a `user` |
| `status` | string (max 50) | yes |  |
| `registered_at` | date-time (ISO 8601) | yes |  |

The combination `activity_id` + `user_id` must be unique.

#### `/api/certificate-rules`

Certificate rule · table `certificate_rule` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity`; unique |
| `min_attendance_pct` | decimal (5,2) | yes |  |
| `require_feedback` | boolean | no | default `false` |
| `require_reentry_plan` | boolean | no | default `false` |
| `require_output` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/certificates`

Certificate · table `certificate` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `user_id` | integer | yes | id of a `user` |
| `certificate_no` | string (max 64) | yes | unique |
| `file_ref` | string (max 500) |  |  |
| `status` | string (max 20) | no | default `"eligible"`; one of: `eligible`, `released`, `revoked` |
| `released_at` | date-time (ISO 8601) |  |  |

### Sessions, attendance & feedback

#### `/api/sessions`

Session · table `session` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `resource_person_id` | integer |  | id of a `user` |
| `title` | string (max 255) | yes |  |
| `session_type` | string (max 20) | yes | one of: `session`, `workshop`, `practicum`, `closing` |
| `session_date` | date (`YYYY-MM-DD`) | yes |  |
| `period` | string (max 10) | yes | one of: `AM`, `PM` |
| `start_time` | time (`HH:MM`) | yes |  |
| `end_time` | time (`HH:MM`) | yes |  |
| `room` | string (max 255) |  |  |
| `description` | string |  |  |
| `qr_token` | string (max 128) | yes | unique |
| `short_code` | string (max 16) | yes |  |
| `opens_at` | date-time (ISO 8601) | yes |  |
| `closes_at` | date-time (ISO 8601) | yes |  |
| `feedback_opens_at` | date-time (ISO 8601) |  |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `activity_id` + `session_date` + `period` must be unique.

#### `/api/attendance`

Attendance · table `attendance` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `session_id` | integer | yes | id of a `session` |
| `user_id` | integer | yes | id of a `user` |
| `recorded_by` | integer |  | id of a `user` |
| `client_id` | string (max 64) | yes | unique |
| `direction` | string (max 8) | yes | one of: `in`, `out` |
| `method` | string (max 30) | yes | one of: `qr`, `code`, `manual` |
| `device_created_at` | date-time (ISO 8601) | yes |  |
| `server_received_at` | date-time (ISO 8601) | yes |  |
| `sync_status` | string (max 30) | yes |  |

#### `/api/materials`

Material · table `material` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `session_id` | integer |  | id of a `session` |
| `uploaded_by` | integer | yes | id of a `user` |
| `title` | string (max 255) | yes |  |
| `kind` | string (max 20) | yes | one of: `ppt`, `pdf`, `word`, `image`, `handout`, `link` |
| `file_ref` | string (max 500) |  |  |
| `url` | string (max 500) |  |  |
| `size_bytes` | integer |  |  |
| `uploaded_at` | date-time (ISO 8601) | yes |  |

#### `/api/documents`

Document · table `document` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `session_id` | integer |  | id of a `session` |
| `doc_type_id` | integer | yes | id of a `document_type` |
| `uploaded_by` | integer | yes | id of a `user` |
| `file_name` | string (max 255) | yes |  |
| `file_ref` | string (max 500) | yes |  |
| `size_bytes` | integer | yes |  |
| `uploaded_at` | date-time (ISO 8601) | yes |  |

#### `/api/feedback-questions`

Feedback question · table `feedback_question` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `text` | string (max 500) | yes |  |
| `qtype` | string (max 20) | yes | one of: `rating`, `choice`, `text` |
| `criterion` | string (max 20) |  | one of: `overall`, `content`, `speaker`, `venue`, `recommend` |
| `options` | JSON |  |  |
| `required` | boolean | no | default `false` |
| `sort_order` | integer | no | default `0` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/feedback`

Feedback · table `feedback` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `session_id` | integer | yes | id of a `session` |
| `user_id` | integer | yes | id of a `user` |
| `client_id` | string (max 64) | yes | unique |
| `rating` | integer | yes |  |
| `comments` | string |  |  |
| `is_anonymous` | boolean | no | default `false` |
| `submitted_at` | date-time (ISO 8601) | yes |  |

The combination `session_id` + `user_id` must be unique.

#### `/api/feedback-answers`

Feedback answer · table `feedback_answer` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `feedback_id` | integer | yes | id of a `feedback`; deleted together with its parent |
| `question_id` | integer | yes | id of a `feedback_question` |
| `rating_value` | integer |  |  |
| `text_value` | string |  |  |

The combination `feedback_id` + `question_id` must be unique.

#### `/api/session-feedback-summaries`

Session feedback summary · table `session_feedback_summary` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `session_id` | integer | yes | id of a `session`; unique |
| `activity_id` | integer | yes | id of a `activity` |
| `resource_person_id` | integer |  | id of a `user` |
| `eligible_count` | integer | no | default `0` |
| `response_count` | integer | no | default `0` |
| `avg_rating` | decimal (3,2) |  |  |
| `rating_5` | integer | yes |  |
| `rating_4` | integer | yes |  |
| `rating_3` | integer | yes |  |
| `rating_2` | integer | yes |  |
| `rating_1` | integer | yes |  |
| `avg_content` | decimal (3,2) |  |  |
| `avg_speaker` | decimal (3,2) |  |  |
| `avg_venue` | decimal (3,2) |  |  |
| `recommend_yes` | integer | no | default `0` |
| `comment_count` | integer | no | default `0` |
| `refreshed_at` | date-time (ISO 8601) | yes |  |

#### `/api/activity-feedback-summaries`

Activity feedback summary · table `activity_feedback_summary` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity`; unique |
| `sessions_rated` | integer | no | default `0` |
| `eligible_count` | integer | no | default `0` |
| `response_count` | integer | no | default `0` |
| `avg_rating` | decimal (3,2) |  |  |
| `recommend_pct` | decimal (5,2) |  |  |
| `best_session_id` | integer |  | id of a `session` |
| `lowest_session_id` | integer |  | id of a `session` |
| `refreshed_at` | date-time (ISO 8601) | yes |  |

### Budget & resources

#### `/api/budget-items`

Budget item · table `budget_item` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `category_id` | integer | yes | id of a `budget_category` |
| `funding_source_id` | integer |  | id of a `funding_source` |
| `description` | string | yes |  |
| `qty` | decimal (12,2) | yes |  |
| `unit_cost` | decimal (14,2) | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/actual-costs`

Actual cost · table `actual_cost` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `budget_item_id` | integer | yes | id of a `budget_item` |
| `receipt_document_id` | integer |  | id of a `document` |
| `recorded_by` | integer | yes | id of a `user` |
| `amount` | decimal (14,2) | yes |  |
| `incurred_on` | date (`YYYY-MM-DD`) | yes |  |

#### `/api/resources`

Resource · table `resource` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `budget_item_id` | integer |  | id of a `budget_item` |
| `resource_type` | string (max 50) | yes | one of: `people`, `venue`, `tools`, `inputs` |
| `name` | string (max 255) | yes |  |
| `unit` | string (max 50) | yes |  |
| `qty_needed` | decimal (12,2) | yes |  |
| `qty_allocated` | decimal (12,2) | yes |  |
| `status` | string (max 30) | yes |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

### Outputs & reports

#### `/api/reentry-plans`

Reentry plan · table `reentry_plan` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `user_id` | integer | yes | id of a `user` |
| `client_id` | string (max 64) | yes | unique |
| `summary` | string (max 255) | yes |  |
| `timeline` | string (max 255) |  |  |
| `details` | string | yes |  |
| `expected_result` | string |  |  |
| `support_needed` | string |  |  |
| `file_ref` | string (max 500) |  |  |
| `status` | string (max 20) | no | default `"pending"`; one of: `pending`, `submitted` |
| `submitted_at` | date-time (ISO 8601) |  |  |

The combination `activity_id` + `user_id` must be unique.

#### `/api/output-submissions`

Output submission · table `output_submission` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `session_id` | integer |  | id of a `session` |
| `user_id` | integer | yes | id of a `user` |
| `client_id` | string (max 64) | yes | unique |
| `title` | string (max 255) | yes |  |
| `kind` | string (max 20) | yes | one of: `photo`, `file`, `video` |
| `file_ref` | string (max 500) | yes |  |
| `size_bytes` | integer | yes |  |
| `submitted_at` | date-time (ISO 8601) | yes |  |

#### `/api/activity-reports`

Activity report · table `activity_report` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer | yes | id of a `activity` |
| `version` | integer | yes |  |
| `status` | string (max 20) | no | default `"generated"`; one of: `generated`, `reviewed`, `final` |
| `title` | string (max 255) | yes |  |
| `input_snapshot` | JSON | yes |  |
| `model` | string (max 64) |  |  |
| `generated_at` | date-time (ISO 8601) |  |  |
| `reviewed_by` | integer |  | id of a `user` |
| `reviewed_at` | date-time (ISO 8601) |  |  |
| `finalized_by` | integer |  | id of a `user` |
| `finalized_at` | date-time (ISO 8601) |  |  |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `activity_id` + `version` must be unique.

#### `/api/activity-report-sections`

Activity report section · table `activity_report_section` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `report_id` | integer | yes | id of a `activity_report`; deleted together with its parent |
| `section_key` | string (max 32) | yes | one of: `summary`, `objectives`, `delivery`, `feedback`, `budget`, `outputs`, `recommendations` |
| `title` | string (max 255) | yes |  |
| `body` | string | yes |  |
| `is_edited` | boolean | no | default `false` |
| `sort_order` | integer | no | default `0` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

The combination `report_id` + `section_key` must be unique.

### Messaging

#### `/api/message-groups`

Message group · table `message_group` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `activity_id` | integer |  | id of a `activity` |
| `name` | string (max 255) | yes |  |
| `scope` | string (max 20) | yes | one of: `dm`, `activity`, `agency` |
| `archived` | boolean | no | default `false` |
| `created_at` | date-time (ISO 8601) | auto | defaults to now |
| `created_by` | integer | auto | set to the logged-in user |
| `updated_at` | date-time (ISO 8601) | auto | set automatically on update |
| `updated_by` | integer | auto | set to the logged-in user on update |

#### `/api/group-members`

Group member · table `group_member` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `group_id` | integer | yes | id of a `message_group`; deleted together with its parent |
| `user_id` | integer | yes | id of a `user` |
| `muted` | boolean | no | default `false` |
| `last_read_at` | date-time (ISO 8601) |  |  |
| `joined_at` | date-time (ISO 8601) | yes |  |

The combination `group_id` + `user_id` must be unique.

#### `/api/messages`

Message · table `message` · Any logged-in user

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer | auto | Assigned by the database. Ignored if sent. |
| `agency_id` | integer | yes | id of a `agency` |
| `group_id` | integer | yes | id of a `message_group` |
| `sender_id` | integer | yes | id of a `user` |
| `removed_by` | integer |  | id of a `user` |
| `body` | string | yes |  |
| `sent_at` | date-time (ISO 8601) | yes |  |
| `removed` | boolean | no | default `false` |

## Known limitations

These are current gaps in the API, not bugs in your client:

- **No filtering or paging on lists.** `GET` on a resource returns every row in the table. Filter on the client for now.
- **No per-agency access control.** Any logged-in user can read and change records of every agency. Membership and role checks (`agency_membership`, `agency_role`) are not enforced by the API yet.
- **Web login across domains.** The server uses `cors()` with default settings, so browsers will not send the login cookie from a different origin. Until CORS is configured with `credentials: true` and the `ALLOWED_ORIGINS` list, web clients must be served from the same origin as the API (or use a dev proxy), or use the mobile (Bearer token) flow.
- **No logout, password change or user update endpoints yet.** To log out on the web, clear the `token` cookie on the client side; on mobile, discard the token.
- **Mobile tokens expire after 1 hour.** There is no refresh endpoint; log in again.
