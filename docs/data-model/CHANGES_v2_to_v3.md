# Data model v2 → v3

Diagram: `TMIS_Logical_Data_Model_v3.svg` / `.png` (regenerate with `python build_data_model.py`).
Sources: current web consoles (agency + Super Admin), the Figma mobile screens (participant app), `docs/SUPERADMIN_PLAN.md`.

31 entities → **46**. Tables grouped as before, plus a new **Platform (Super Admin)** group.

## New tables

| Table | Why (where it shows up) |
|---|---|
| `agency_application`, `application_document` | Super Admin Applications queue: review, request info, approve/reject, verification documents |
| `platform_default_item`, `platform_setting` | Global settings: starting activity/document/budget lists, certificate defaults, registration rules, emails, security |
| `audit_log` | Super Admin audit log |
| `participant_profile` | Mobile account setup (affiliation, sex, location), one per account |
| `agency_role` | Agency Settings › Roles (named roles with a data-access level) |
| `participant_category`, `category_question`, `membership_answer` | Agency Settings › Categories and the questions participants answer when joining |
| `agency_subscription` | Subscribe on the public agency page |
| `notification` | Bell menu (web) and notifications (mobile) |
| `activity_objective`, `activity_outcome` | Objectives and expected outcomes lists (were two text columns) |
| `material` | Mobile Materials tab (slides, PDFs, handouts, links per session) |
| `feedback_question`, `feedback_answer` | Feedback form builder and per-question answers |
| `output_submission` | Participant output uploads (photo, file, video) |

## Changed tables

| Table | Change |
|---|---|
| `agency` | + short_name, type, region, status, mission/vision/mandate/values, contact, cover, `welcomed_at` (first-time welcome) |
| `user` | name → first/middle/last, + status, `must_reset_password`, `last_sign_in_at`; `affiliation` moved to `participant_profile` |
| `agency_membership` | role text → `role_id`; + `category_id`, `affiliation`; status now invited / pending / active / suspended. A participant has **one membership per workspace**, each with its own category |
| `invitation` | role → `role_id` (staff invite) or `category_id` (participant invite) |
| `activity` | + description, audience, `is_public`; objectives / expected_outcome text and `funding_type` removed |
| `activity_partner` | `partner_agency_id` is now optional; + `partner_name` (partners like “Rubber Growers Association” are not platform agencies) |
| `staffing` | + `duty_date`, `staff_role`, `duty` (per-day staffing) |
| `session` | now carries what the web and mobile show: type (session/workshop/practicum/closing), start/end time, room, resource person, description, `feedback_opens_at` |
| `attendance` | + `direction` (in/out, four check points a day), `method`, `recorded_by` |
| `feedback` | + `is_anonymous`; per-question answers in `feedback_answer` |
| `reentry_plan` | content split into summary, timeline, details, expected result, support needed, file, status |
| `budget_item` | `estimated_amount` → `qty` × `unit_cost` |
| `certificate_rule` | + `require_output` |
| `message_group` | `scope` now dm / activity / agency; `group_member` gets `muted` and `last_read_at` (unread counts) |

## Removed

`program_flow` (merged into `session`; the program is now an uploaded document), `output` and `output_photo` (replaced by `output_submission`), outcome tracking (results are read from outputs).

## Later revision (audit, plans, invitations)

| Change | Detail |
|---|---|
| `audit_log` | `actor_id` and `at` replaced by `created_by` and `created_at`; + `updated_at`, `updated_by` (stay empty, the log is append-only); + `detail` (what changed) |
| Audit columns on 26 tables | `created_at`, `created_by`, `updated_at`, `updated_by` added to: agency, agency_role, agency_membership, participant_category, invitation, subscription_plan, agency_subscription, platform_default_item, platform_setting, activity_type, funding_source, budget_category, document_type, annual_budget, calendar_entry, **activity**, activity_objective, activity_outcome, activity_partner, staffing, certificate_rule, session, feedback_question, budget_item, resource, message_group. Not added to one-shot records (attendance, feedback, feedback_answer, registration, message, group_member, notification, reentry_plan, output_submission, material, document, actual_cost, certificate), which already hold their own actor and timestamp |
| New `subscription_plan` | Catalogue of plans (code, name, price, billing period, participant and storage limits, features). Managed by the Super Admin |
| `agency_subscription` | Now the **billing** table: agency, plan, status (trial / active / past_due / cancelled / expired), start and end, auto-renew. The old meaning (a user following an agency page) is renamed `agency_follower` |
| Removed `category_question`, `membership_answer` | Participants no longer choose a category or answer questions when joining |
| `invitation` | + `affiliation`. A participant code fixes category and affiliation; they are copied to `agency_membership` when the code is redeemed |
| `participant_profile` | `affiliation` removed (it now comes from the invitation) |

## Second revision (menus, activity roles, AI report)

| Change | Detail |
|---|---|
| New `role_menu` | Which menus a role can open (`menu_key`) with `view` / `edit` access. The Agency Admin picks them per role; unique on (role, menu) |
| `staffing` | `staff_role` text replaced by `role_id` → `agency_role`: the person's role in that activity. Effective menus in an activity = base role (membership) + activity role |
| New `activity_report` | Versioned AI-drafted report per activity (status draft / generated / reviewed / final, content, input snapshot, model, reviewer). Aggregates only go to the model |
| New `membership_menu` | Per-person menu changes: only the differences from the role defaults (`is_enabled` true = extra, false = hidden). Effective menus = `role_menu` of the base role, with these differences applied, plus the activity role inside an activity |
| `role_menu` | On/off only (a row = the role can open the menu); the earlier `access` view/edit column was dropped because edit rights are still decided by the role |
| Audit columns | Also on `role_menu`, `membership_menu` and `activity_report` (29 tables in total) |

## Third revision (feedback summaries, report sections, MySQL)

| Change | Detail |
|---|---|
| Database | MySQL (InnoDB, utf8mb4). `uuid` columns are now `char(36)` and `bool` columns `tinyint(1)`; the document has a new section 10 with MySQL notes (keys, delete rules, indexes) |
| New `session_feedback_summary` | One row per session: eligible and response counts, average, 5 to 1 star counts, averages for content, speaker and venue, recommend count, comment count. Rebuilt when feedback is submitted; hidden below 5 responses. Resource persons open the rows of their own sessions |
| New `activity_feedback_summary` | Overall satisfaction of an activity (average of session ratings weighted by responses), recommend %, best and lowest session |
| `feedback_question` | + `criterion` (overall, content, speaker, venue, recommend) so ratings roll up into the summaries |
| New `activity_report_section` | Report text moved out of `activity_report.content` into one row per section (key, title, body, `is_edited`) |
| `activity_report` | `content` removed; + `finalized_by`; status is generated, reviewed or final (final is locked) |

Entity count: 52 (49 + `session_feedback_summary`, `activity_feedback_summary`, `activity_report_section`).

Entity count: 49 (46 after the first revision, + `role_menu`, `membership_menu`, `activity_report`).

## Fourth revision (partner agencies and funding sources)

| Change | Detail |
|---|---|
| New `partner_agency` | The agency's directory of organizations it works with: `name`, `type` (the same four agency types as registration), `is_self` (the agency itself, so it can be picked as Implementing), `archived`. A partner needs no account. UQ (agency_id, name) so "DA Region IX" is never split in two |
| `activity_partner` | `partner_agency_id` and `partner_name` replaced by one required `partner_id` → `partner_agency`; UQ (activity_id, partner_id). The role stays here, so a partner can hold a different role in each activity |
| `funding_source` | + `partner_id` (optional: who pays; empty for the agency's own funds such as GAA), + `archived`, UQ (agency_id, name) |
| Audit columns | Also on `partner_agency` (30 tables in total) |
| Console | Agency settings has two new tabs: **Partner agencies** and **Funding sources**. Partners can also be added on the spot from the activity wizard, the activity's Plan & Agencies tab and the Funding sources tab |

Entity count: 53 (52 + `partner_agency`). To upgrade an existing database: `npm run db:schema`, then `node db/migrations/001_partner_agency.js`.

## Reading the diagram

- `FK*` = `agency_id` tenant key, `FKu` = `user_id` / `*_by` reference. Lines for both are omitted for readability. Lines to `user` are drawn only where the link defines the table: `participant_profile`, `agency_membership`, `registration`, `staffing`.
- Busy tables (`activity`) send lines out of their sides as well as the bottom, so relationships fan out instead of bundling.

## Assumptions to confirm

- **Categories belong to an agency**, not the platform. A participant sets up their account once (profile), then joins each workspace with an invitation code that fixes their category and affiliation.
- Offline copies of materials live on the device only, so they are not modelled.
- Public agency page content (mission, vision, mandate, values) is stored on `agency`.
