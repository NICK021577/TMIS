"""
Builds TMIS_Logical_Data_Model_v3.docx from the schema in build_data_model.py.
    python build_data_model_doc.py
"""
import os, re
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))

# load only the schema part of the diagram script (no layout / routing)
src = open(os.path.join(HERE, 'build_data_model.py'), encoding='utf-8').read()
src = src[:src.index('# ───────────────────────── layout')]
ns = {'__file__': os.path.join(HERE, 'build_data_model.py')}
exec(compile(src, 'schema', 'exec'), ns)
TABLES, GROUPS = ns['TABLES'], ns['GROUPS']
by_name = {t['name']: t for t in TABLES}
DRAW_USER = {('participant_profile', 'user_id'), ('agency_membership', 'user_id'),
             ('registration', 'user_id'), ('staffing', 'user_id')}

PURPOSE = {
 'agency_application': 'A public request to onboard an agency. Reviewed by the Super Admin; approval creates the agency.',
 'application_document': 'Verification files attached to an application (authorization letter, MOA, valid ID).',
 'audit_log': 'Read-only record of sensitive actions: who did it (created_by), to what, when, and a detail of what changed.',
 'subscription_plan': 'Catalogue of plans the Super Admin offers (free, standard...) with price, billing period and limits.',
 'platform_default_item': 'Starting lists every new agency receives: activity types, document types, budget categories.',
 'platform_setting': 'Global settings stored as key/value: certificate defaults, registration rules, email templates, security.',
 'agency': 'A tenant workspace (for example PRRI). Holds profile, branding and the public page content.',
 'user': 'One account per person across the whole platform. Super Admin is a flag here; agency roles are on the membership.',
 'participant_profile': 'Personal details a participant sets up once in the mobile app (affiliation comes from the invitation, not here).',
 'agency_role': 'A named role inside one agency with a data-access level. Used as a base role (membership) and as an activity role (staffing).',
 'role_menu': 'The default menus of a role. The Agency Admin ticks them per role in Settings.',
 'membership_menu': 'Per-person changes to a role\'s default menus (an extra menu, or a hidden one). No row means follow the role.',
 'activity_report': 'AI-drafted after-activity report, versioned, reviewed and finalized by a person.',
 'activity_report_section': 'One section of a report version (summary, objectives, feedback, budget...) with the text and whether a person edited it.',
 'session_feedback_summary': 'Ready-made feedback results for one session: counts, average, rating spread and criteria. Rebuilt when feedback is submitted.',
 'activity_feedback_summary': 'Ready-made overall satisfaction for an activity, from its session summaries.',
 'agency_membership': 'A user inside one agency (workspace): role, status, and the category and affiliation set by the invitation code. One row per workspace joined.',
 'participant_category': 'Participant types an agency defines (Farmer, LGU staff, Student...).',
 'invitation': 'A join code created by an agency: staff codes carry a role, participant codes carry a category and affiliation.',
 'invitation_redemption': 'Records who used an invitation code.',
 'agency_follower': 'A user following an agency\'s public page.',
 'agency_subscription': 'An agency\'s plan for a billing term (trial, active, expired...). Kept as history.',
 'notification': 'In-app notification for a user (web bell menu and mobile).',
 'activity_type': 'Agency list: Skills Training, Seminar, Workshop...',
 'partner_agency': 'An organization the agency works with (DA Region IX, an LGU, an association): a name and a type, no account needed.',
 'funding_source': 'Agency list: GAA, Agency Fund, Partner Grant... Optionally names the partner that pays.',
 'budget_category': 'Agency list: Venue, Meals, Materials...',
 'document_type': 'Agency list of document kinds, with whether each is required when an activity is created.',
 'annual_budget': 'Yearly allocation per funding source and activity type.',
 'calendar_entry': 'A planned activity on the agency calendar before it exists as an activity.',
 'activity': 'The central record: a training, seminar or extension activity.',
 'activity_objective': 'Ordered list of an activity\'s objectives.',
 'activity_outcome': 'Ordered list of an activity\'s planned outcomes.',
 'activity_partner': 'A partner agency and its role in one activity (implementing, funding, collaborating, participating). A partner can hold a different role in each activity.',
 'staffing': 'A person assigned to an activity with an activity role (an agency_role) and duty, optionally per day.',
 'registration': 'A participant registered for an activity.',
 'certificate_rule': 'Conditions to earn a certificate for one activity (attendance %, feedback, reentry plan, output).',
 'certificate': 'A certificate issued to a participant for an activity.',
 'session': 'One scheduled block of an activity (a day and AM/PM period): topic, resource person, room, QR check-in.',
 'attendance': 'A check-in or check-out scan. Created offline on the device and synced later.',
 'material': 'Learning materials for participants (slides, PDFs, handouts, links), by session or general.',
 'document': 'Agency-side documents for an activity (memo, MOA, signed sheets, receipts).',
 'feedback_question': 'Questions on an activity\'s feedback form.',
 'feedback': 'One participant\'s evaluation of one session.',
 'feedback_answer': 'The answer to each feedback question.',
 'budget_item': 'A planned cost line of an activity (quantity x unit cost).',
 'actual_cost': 'Money actually spent against a budget item, with optional receipt.',
 'resource': 'Resources an activity needs (people, venue, tools, inputs) and how much is allocated.',
 'reentry_plan': 'A participant\'s plan for applying what they learned.',
 'output_submission': 'Photos, files or videos participants upload as activity outputs.',
 'message_group': 'A conversation: direct message, activity group or agency-wide group.',
 'group_member': 'Who is in a conversation, with mute and last-read time.',
 'message': 'A message in a conversation, which can be removed by a moderator.',
}
assert set(PURPOSE) == set(by_name), set(by_name) ^ set(PURPOSE)

doc = Document()
sec = doc.sections[0]
sec.left_margin = sec.right_margin = Inches(0.9)
sec.top_margin = sec.bottom_margin = Inches(0.9)
st = doc.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(10.5)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')
for n, sz in (('Heading 1', 18), ('Heading 2', 14), ('Heading 3', 11.5)):
    h = doc.styles[n]; h.font.name = 'Calibri'; h.font.size = Pt(sz); h.font.bold = True
    h.font.color.rgb = RGBColor(0x1f, 0x3a, 0x6e)
    h.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')

def shade(cell, hexcol):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), hexcol)
    tcPr.append(shd)

def para(text='', bold=False, italic=False, size=None, color=None, align=None, space_after=6):
    p = doc.add_paragraph()
    if '`' in text or '**' in text:
        rich(p, text, size)
    else:
        r = p.add_run(text); r.bold = bold; r.italic = italic
        if size: r.font.size = Pt(size)
        if color: r.font.color.rgb = RGBColor.from_string(color)
    if align: p.alignment = align
    p.paragraph_format.space_after = Pt(space_after)
    return p

def rich(p, text, size=None):
    for part in re.split(r'(`[^`]+`|\*\*[^*]+\*\*)', text):
        if not part: continue
        if part.startswith('`'):
            r = p.add_run(part.strip('`')); r.font.name = 'Consolas'; r.font.size = Pt(size or 9.5)
        elif part.startswith('**'):
            r = p.add_run(part.strip('*')); r.bold = True
            if size: r.font.size = Pt(size)
        else:
            r = p.add_run(part)
            if size: r.font.size = Pt(size)

def bullet(text):
    p = doc.add_paragraph(style='List Bullet')
    rich(p, text)
    p.paragraph_format.space_after = Pt(2)
    return p

def table(headers, rows, widths, header_fill='1F3A6E', font=9, mono_cols=()):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]; c.text = ''
        r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(font); r.font.color.rgb = RGBColor(255, 255, 255)
        shade(c, header_fill)
    for ri, row in enumerate(rows):
        cells = t.add_row().cells
        for i, v in enumerate(row):
            cells[i].text = ''
            p = cells[i].paragraphs[0]
            if i in mono_cols:
                r = p.add_run(str(v)); r.font.size = Pt(font); r.font.name = 'Consolas'
            else:
                rich(p, str(v), font)
            p.paragraph_format.space_after = Pt(0)
            if ri % 2 == 1: shade(cells[i], 'F1F5F9')
    for row in t.rows:
        for i, w in enumerate(widths):
            row.cells[i].width = Inches(w)
    # repeat header row
    trPr = t.rows[0]._tr.get_or_add_trPr(); th = OxmlElement('w:tblHeader'); th.set(qn('w:val'), 'true'); trPr.append(th)
    return t

# ── cover ──
para('UniFyle (TMIS)', bold=True, size=13, color='5B6B88', space_after=2)
para('Logical Data Model', bold=True, size=28, color='1F3A6E', space_after=2)
para('Training and Extension Management Information System · Schema v3 · MySQL', size=12, color='5B6B88', space_after=14)

n_cols = sum(len(t['cols']) for t in TABLES)
rel = [(t, c) for t in TABLES for c in t['cols'] if c['fk']]
para(f'{len(TABLES)} entities · {n_cols} attributes · {len(rel)} foreign keys · 8 groups', italic=True, color='5B6B88', space_after=12)

doc.add_heading('1. Purpose and scope', 1)
para('This document describes the logical data model of UniFyle: what information the system keeps, how it is grouped, '
     'and how the pieces relate. It is written for MySQL (InnoDB), the planned '
     'database, with the column types shown in the data dictionary. It replaces schema v2 and reflects the current web '
     'consoles (Super Admin and Agency Admin) and the participant mobile app.')
para('Three kinds of people use the system, and the model is built around them:')
bullet('**Super Administrator** manages the platform: onboards agencies, manages user access and global settings. Flagged on `user.is_super_admin`; not tied to any agency.')
bullet('**Agency staff** (Agency Administrator, Committee Member, Resource Person) run an agency\'s activities. Their role is stored on `agency_membership.role_id`.')
bullet('**Participants** use the mobile app: one account, many workspaces (one `agency_membership` per agency), each with the category and affiliation fixed by the invitation code they used.')

doc.add_heading('2. Key design decisions', 1)
bullet('**Multi-tenant.** Every agency-owned table carries `agency_id`, so each query is scoped to one agency. The Super Admin sees platform data, never an agency\'s private records.')
bullet('**One account, many workspaces.** Identity lives in `user`; a person\'s role, category and affiliation in each agency live in `agency_membership`.')
bullet('**Roles are per agency.** `agency_role` holds named roles and a data-access level, so the same person can be an administrator in one agency and a participant in another.')
bullet('**Offline-first check-in.** `attendance`, `feedback`, `reentry_plan` and `output_submission` carry a `client_id` created on the device, so syncing the same record twice never creates a duplicate.')
bullet('**Defaults, then copies.** The Super Admin\'s `platform_default_item` rows seed each new agency\'s own lookup tables, which the agency then edits freely.')
bullet('**Participant categories belong to an agency.** Participants never choose a category or affiliation: each invitation code is issued for one category (and affiliation), so joining with the code assigns them. This stops participants misreporting who they are.')

doc.add_heading('3. Notation', 1)
table(['Mark', 'Meaning'], [
    ['PK', 'Primary key'],
    ['FK', 'Foreign key; the relationship line is drawn in the diagram'],
    ['FK*', '`agency_id` tenant key pointing to `agency.id` (line omitted for readability)'],
    ['FKu', '`user_id` or `*_by` reference pointing to `user.id` (line omitted for readability, except where the link defines the table)'],
    ['UK', 'Unique'],
    ['Italic / "null"', 'Nullable (optional) column'],
    ['Crow\'s foot', 'The "many" end of a relationship (the table holding the FK)'],
    ['Double bar / circle + bar', 'Parent required / parent optional (nullable FK)'],
], [1.5, 5.1], font=9.5)
para('')
para('Table colours: ' + ', '.join(f'{v[0]}' for v in GROUPS.values()) + '.', italic=True, size=9.5, color='5B6B88')

# ── diagram ──
doc.add_page_break()
doc.add_heading('4. Entity-relationship diagram', 1)
para('Line colour is the colour of the parent table. The full-size diagram is in TMIS_Logical_Data_Model_v3.svg (zoomable); this page shows it scaled to fit.', size=9.5, italic=True, color='5B6B88')
png = os.path.join(HERE, 'TMIS_Logical_Data_Model_v3.png')
if os.path.exists(png):
    doc.add_picture(png, height=Inches(8.0))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER

# ── entity overview ──
doc.add_page_break()
doc.add_heading('5. Entities by group', 1)
for gk, (glabel, gcol) in GROUPS.items():
    ts = [t for t in TABLES if t['group'] == gk]
    if not ts: continue
    doc.add_heading(glabel, 2)
    table(['Entity', 'Purpose'], [[t['name'], PURPOSE[t['name']]] for t in ts], [1.9, 4.7], header_fill=gcol.lstrip('#'), font=9.5, mono_cols=(0,))
    para('', space_after=2)

# ── data dictionary ──
doc.add_page_break()
doc.add_heading('6. Data dictionary', 1)
para('Every attribute of every entity. "Key" shows PK, FK (relationship drawn), FK* (agency tenant key), FKu (user reference) and UK. '
     '"Null" is Yes where the value is optional. Notes under a table are constraints and allowed values.', size=9.5)
for gk, (glabel, gcol) in GROUPS.items():
    ts = [t for t in TABLES if t['group'] == gk]
    if not ts: continue
    doc.add_heading(glabel, 2)
    for t in ts:
        doc.add_heading(t['name'], 3)
        para(PURPOSE[t['name']], italic=True, size=9.5, color='5B6B88', space_after=3)
        rows = []
        for c in t['cols']:
            keys = []
            if c['pk']: keys.append('PK')
            if c['fk']:
                if c['fk'] == 'user' and (t['name'], c['name']) not in DRAW_USER: keys.append('FKu')
                else: keys.append('FK')
            elif c['fkx']: keys.append('FK*')
            if c['uk']: keys.append('UK')
            ref = ''
            if c['fk']: ref = c['fk'] + '.id'
            elif c['fkx']: ref = 'agency.id'
            rows.append([c['name'], c['type'], ', '.join(keys), 'Yes' if c['null'] else '', ref])
        table(['Attribute', 'Type', 'Key', 'Null', 'References'], rows, [2.0, 1.45, 0.9, 0.5, 1.75], header_fill=gcol.lstrip('#'), font=8.5, mono_cols=(0, 1, 4))
        if t['note']:
            for line in t['note'].split('\n'):
                para(line, italic=True, size=8.5, color='5B6B88', space_after=0)
        para('', space_after=4)

# ── relationships ──
doc.add_page_break()
doc.add_heading('7. Relationships', 1)
para('Every foreign key, from the table that holds it (child) to the table it points at (parent). '
     'Cardinality is read from parent to child. Tenant keys (`agency_id`) are listed once, below.', size=9.5)
rows = []
for t, c in rel:
    card = '1 : 1' if (c['pk'] or c['uk']) else '1 : many'
    par = 'optional' if c['null'] else 'required'
    rows.append([c['fk'], f"{t['name']}.{c['name']}", card, par])
rows.sort(key=lambda r: (r[0], r[1]))
table(['Parent', 'Child.column', 'Cardinality', 'Parent is'], rows, [1.7, 2.8, 1.0, 1.1], font=8.5, mono_cols=(0, 1))
tenant = [t['name'] for t in TABLES if any(c['fkx'] for c in t['cols'])]
para('')
para(f'Tenant key: `agency_id` → agency.id is present on {len(tenant)} tables: ' + ', '.join(tenant) + '.', size=9)

# ── rules ──
doc.add_heading('8. Business rules and constraints', 1)
for line in [
    '**Agency onboarding.** An agency exists only after the Super Admin approves its application. Approval creates the agency and makes the contact person its first Agency Administrator.',
    '**Suspension.** A suspended agency (`agency.status`) or user (`user.status`) cannot sign in.',
    '**One membership per workspace.** `agency_membership` is unique on (agency, user).',
    '**Registration.** A participant registers once per activity (unique on activity, user).',
    '**Sessions.** Unique on (activity, date, AM/PM). Each session has its own QR token and check-in window; feedback opens at `feedback_opens_at`.',
    '**Attendance.** Each scan is stored once, identified by `client_id`, so repeated syncs never duplicate. Direction is in or out (four check points a day).',
    '**Feedback.** One evaluation per participant per session (unique on session, user), with one answer per question.',
    '**Certificates.** Released only when the participant meets the activity\'s `certificate_rule`: minimum attendance %, and feedback, reentry plan and output if required.',
    '**Budget.** A budget item\'s estimate is qty x unit cost; actual costs are recorded against the item and may reference a receipt document.',
    '**Audit.** `audit_log` is append-only and written by the server on every sensitive action; `created_by` is the actor and `detail` says what changed.',
    '**Who changed what.** Records that staff create and edit carry `created_at`, `created_by`, `updated_at`, `updated_by` (26 tables, listed in section 9). The server fills them; clients never send them.',
    '**Role-based menus.** Each `agency_role` has rows in `role_menu` listing the menus it can open by default. The Agency Admin ticks them per role, including custom roles. Agency Administrators always get every menu and everyone keeps the Dashboard.',
    '**Per-person menus.** `agency_membership` is the base role. `membership_menu` stores only the differences from that role\'s defaults (`is_enabled` true = extra menu, false = hidden). Changing someone\'s base role clears their differences; resetting deletes them.',
    '**Roles per activity.** A person\'s base role is `agency_membership.role_id`. `staffing.role_id` gives them a role in one activity. Inside that activity they get the menus of both roles combined; elsewhere only the base role (with their own menu changes) applies.',
    '**AI report.** `activity_report` is generated from aggregates only (no personal data), kept as versions, and counts only after a person reviews and finalizes it.',
    '**Subscriptions.** An agency has one active `agency_subscription` at a time, pointing to a `subscription_plan`; past terms are kept as history.',
    '**Integrity.** MySQL (InnoDB) enforces every foreign key. Deleting a record that others point to is restricted; only dependent rows (for example `feedback_answer` of a `feedback`, `role_menu` of a role) are removed with their parent.',
    '**Feedback summaries.** `session_feedback_summary` and `activity_feedback_summary` are caches of `feedback` and `feedback_answer`, rebuilt when feedback is submitted. A Resource person sees only the summaries of sessions they teach, and breakdowns are hidden below 5 responses.',
    '**Reports.** A report version is `generated`, then `reviewed`, then `final`. A final version is locked; changes start a new version. Section text lives in `activity_report_section`.',
]: bullet(line)

doc.add_heading('9. Normalization notes', 1)
para('The model is designed to third normal form with a few deliberate exceptions:', space_after=3)
bullet('`agency_id` appears on child tables although it could be derived through `activity_id`. Kept on purpose as the tenant key so every query filters by agency.')
bullet('JSON columns (`agency.values`, `feedback_question.options`, `platform_setting.value`, `subscription_plan.features`, `activity_report.input_snapshot`) hold small structured values that are always read and written whole (MySQL JSON type).')
bullet('`session_feedback_summary` and `activity_feedback_summary` repeat figures that can be computed from `feedback`. They are caches kept for speed, so Resource persons can open their results at once.')
bullet('`affiliation` lives on `invitation` and is copied to `agency_membership`, because a participant may belong to a different organisation in each workspace. It is not on `participant_profile`.')
bullet('Audit columns (`created_at`, `created_by`, `updated_at`, `updated_by`) are on: ' + ', '.join(ns['AUDIT_TABLES']) + '. One-shot records (attendance, feedback, messages, registrations, uploads) already hold their own actor and timestamp.')
bullet('`feedback.rating` is the overall rating; per-question ratings live in `feedback_answer`.')

doc.add_heading('10. MySQL implementation notes', 1)
for line in [
    '**Engine and charset.** InnoDB tables, `utf8mb4` with `utf8mb4_unicode_ci` collation, so names with accents and emoji are stored correctly.',
    '**Types.** `uuid` is `CHAR(36)` (generated by the server); `bool` is `TINYINT(1)`; `json` is the MySQL JSON type; `datetime` is stored in UTC and shown in local time.',
    '**Keys.** Every `FK` is a real foreign key. Default delete rule is `RESTRICT`; use `CASCADE` only for owned child rows (`application_document`, `role_menu`, `membership_menu`, `activity_report_section`, `feedback_answer`, `group_member`).',
    '**Unique constraints.** Create each `UQ (…)` listed under a table as a composite unique index, and every `UK` column as a unique index.',
    '**Indexes.** Index every foreign key, and add `(agency_id, …)` composite indexes on the tables queried most (activity, session, registration, attendance, feedback) so every tenant query is fast.',
    '**Offline sync.** `client_id` unique indexes make a repeated upload fail safely, so the server can answer "already saved".',
    '**Tenant safety.** Every query on an agency table includes `agency_id`; the server adds it, never the client.',
]: bullet(line)

doc.add_heading('11. Assumptions to confirm', 1)
bullet('Participant categories are defined by each agency, not by the platform. Participants cannot change their category or affiliation; an administrator reissues a code if it must change.')
bullet('Offline copies of materials exist only on the device and are not modelled.')
bullet('The Participant role is either a role in `agency_role` or implied by having a category and no staff role. One of the two should be chosen.')
bullet('Per-activity sample content in the current prototype (sessions, staffing, documents) is shared across activities; in the real database each activity owns its own rows.')

out = os.path.join(HERE, 'TMIS_Logical_Data_Model_v3.docx')
doc.save(out)
print('saved', out)
