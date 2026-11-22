"""
UniFyle (TMIS) logical data model, schema v3, for MySQL (InnoDB, utf8mb4).

Regenerates TMIS_Logical_Data_Model_v3.svg / .png in this folder:
    python build_data_model.py

Edit the TABLES list below, then re-run. Tables sit on a fixed grid (BANDS),
relationships are auto-routed (orthogonal, with hops where lines cross).

Conventions (same as schema v2):
  PK primary key, FK foreign key (line drawn), FK* agency_id tenant key (line omitted),
  UK unique, italic = nullable, line colour = colour of the parent table (dot in its header).
"""
import heapq, os, sys, textwrap, html

HERE = os.path.dirname(os.path.abspath(__file__))

# ───────────────────────── groups ─────────────────────────
GROUPS = {
    'tenancy':  ('Tenancy & people',     '#475569'),
    'platform': ('Platform (Super Admin)', '#0e7490'),
    'planning': ('Planning & lookups',   '#134e4a'),
    'core':     ('Core activity',        '#15803d'),
    'delivery': ('Delivery',             '#c2410c'),
    'finance':  ('Finance & resources',  '#be123c'),
    'outputs':  ('Outputs & follow-up',  '#7e22ce'),
    'msg':      ('Messaging',            '#1d4ed8'),
}

# ───────────────────────── schema ─────────────────────────
# column: "name type flag flag ..."   flags: pk uk n(nullable) fkx(tenant key, no line) fk:<table>
# MySQL types: uuid -> CHAR(36), bool -> TINYINT(1)
MYSQL_TYPES = {'uuid': 'char(36)', 'bool': 'tinyint(1)'}

def C(s):
    p = s.split()
    d = dict(name=p[0], type=MYSQL_TYPES.get(p[1], p[1]), pk=False, uk=False, null=False, fkx=False, fk=None)
    for f in p[2:]:
        if f == 'pk': d['pk'] = True
        elif f == 'uk': d['uk'] = True
        elif f == 'n': d['null'] = True
        elif f == 'fkx': d['fkx'] = True
        elif f.startswith('fk:'): d['fk'] = f[3:]
        else: raise ValueError(s)
    return d

TABLES = []
def T(name, group, cols, note=None, one=False):
    TABLES.append(dict(name=name, group=group, cols=[C(c) for c in cols], note=note))

# ── Platform (Super Admin console) ──
T('agency_application', 'platform', [
    'id uuid pk', 'agency_id uuid fk:agency n', 'reviewed_by uuid fk:user n',
    'agency_name varchar(255)', 'acronym varchar(32)', 'agency_type varchar(32)', 'region varchar(64)',
    'contact_first_name varchar(100)', 'contact_middle_name varchar(100) n', 'contact_last_name varchar(100)',
    'contact_email varchar(255)', 'contact_phone varchar(32)',
    'status varchar(32)', 'reason text n', 'submitted_at datetime', 'reviewed_at datetime n'],
  'status: pending | under_review | needs_info | approved | rejected')
T('application_document', 'platform', [
    'id uuid pk', 'application_id uuid fk:agency_application', 'doc_kind varchar(32)',
    'file_name varchar(255)', 'file_ref varchar(500)', 'size_bytes int'],
  'doc_kind: auth_letter | moa | valid_id')
T('audit_log', 'platform', [
    'id uuid pk', 'agency_id uuid fk:agency n', 'action varchar(64)', 'target_type varchar(32)',
    'target_label varchar(255)', 'detail text n', 'created_at datetime', 'created_by uuid fk:user',
    'updated_at datetime n', 'updated_by uuid fk:user n'],
  'append-only: written by the server on every sensitive action\ncreated_by = the actor · detail = what changed (e.g. role: Committee to Resource Person) · updated_* stay empty')
T('platform_default_item', 'platform', [
    'id uuid pk', 'kind varchar(32)', 'name varchar(255)', 'sort_order int'],
  'kind: activity_type | document_type | budget_category\nUQ (kind, name) · copied into each new agency')
T('subscription_plan', 'platform', [
    'id uuid pk', 'code varchar(32) uk', 'name varchar(100)', 'description text n', 'price decimal(12,2)',
    'currency varchar(3)', 'billing_period varchar(16)', 'max_participants int n', 'max_storage_mb int n',
    'features json n', 'is_active bool'],
  'catalogue managed by the Super Admin · billing_period: free | monthly | yearly\nempty limit = unlimited')
T('platform_setting', 'platform', [
    'key varchar(64) pk', 'value json', 'updated_at datetime'],
  'keys: certificate_defaults | registration_docs | email_templates | security')

# ── Tenancy & people ──
T('agency', 'tenancy', [
    'id uuid pk', 'name varchar(255) uk', 'short_name varchar(32) uk', 'type varchar(32)', 'region varchar(64)',
    'status varchar(20)', 'mission text n', 'vision text n', 'mandate text n', 'values json n',
    'contact_email varchar(255) n', 'logo_url varchar(500) n', 'cover_url varchar(500) n',
    'brand_color varchar(20)', 'welcomed_at datetime n', 'created_at datetime'],
  'type: government | academic | private | non_profit\nstatus: active | suspended')
T('user', 'tenancy', [
    'id uuid pk', 'email varchar(255) uk', 'password_hash varchar(255)', 'first_name varchar(100)',
    'middle_name varchar(100) n', 'last_name varchar(100)', 'contact varchar(100) n',
    'status varchar(20)', 'is_super_admin bool', 'must_reset_password bool',
    'last_sign_in_at datetime n', 'created_at datetime'],
  'status: active | suspended')
T('participant_profile', 'tenancy', [
    'user_id uuid pk fk:user', 'sex varchar(16) n', 'birth_date date n', 'province varchar(100) n',
    'municipality varchar(100) n', 'avatar_url varchar(500) n',
    'onboarded_at datetime n'],
  'one row per participant account (set up once, on the mobile app)')
T('agency_role', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx', 'name varchar(100)', 'data_access varchar(32)',
    'is_system bool', 'updated_at datetime'],
  'UQ (agency_id, name)\ndata_access: all_records | assigned_activities | assigned_sessions')
T('agency_membership', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx', 'user_id uuid fk:user', 'role_id uuid fk:agency_role',
    'category_id uuid fk:participant_category n', 'affiliation varchar(255) n',
    'status varchar(20)', 'joined_at datetime'],
  'UQ (agency_id, user_id) · one row per workspace the user joined\ncategory_id + affiliation are copied from the invitation code, never typed by the participant\nstatus: invited | pending | active | suspended')
T('role_menu', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx', 'role_id uuid fk:agency_role', 'menu_key varchar(32)'],
  'UQ (role_id, menu_key) · default menus of a role: a row = the role can open that menu\nmenu_key: dashboard | calendar | activities | participants | budget | reports | messaging | about | settings')
T('membership_menu', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx', 'membership_id uuid fk:agency_membership', 'menu_key varchar(32)',
    'is_enabled bool'],
  'UQ (membership_id, menu_key) · only differences from the role defaults\nis_enabled true = extra menu · false = hidden menu · no row = follow the role')
T('participant_category', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx', 'name varchar(255)'],
  'UQ (agency_id, name)')
T('invitation', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx', 'code varchar(64) uk', 'role_id uuid fk:agency_role n',
    'category_id uuid fk:participant_category n', 'affiliation varchar(255) n', 'expires_at datetime',
    'max_uses int'],
  'staff invite = role_id · participant invite = category_id + affiliation\nthe code fixes both, so participants never choose or edit them')
T('invitation_redemption', 'tenancy', [
    'id uuid pk', 'invitation_id uuid fk:invitation', 'user_id uuid fk:user', 'redeemed_at datetime'],
  'UQ (invitation_id, user_id)')
T('agency_follower', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx', 'user_id uuid fk:user', 'followed_at datetime'],
  'UQ (agency_id, user_id) · follows the public agency page')
T('agency_subscription', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx', 'plan_id uuid fk:subscription_plan', 'status varchar(20)',
    'starts_on date', 'ends_on date n', 'auto_renew bool'],
  'billing history, one row per term · the current plan = the active row\nstatus: trial | active | past_due | cancelled | expired')
T('notification', 'tenancy', [
    'id uuid pk', 'agency_id uuid fkx n', 'user_id uuid fk:user', 'title varchar(255)', 'body text',
    'link varchar(255) n', 'read_at datetime n', 'created_at datetime'])

# ── Planning & lookups ──
T('activity_type', 'planning', ['id uuid pk', 'agency_id uuid fkx', 'name varchar(255)'])
T('partner_agency', 'planning', [
    'id uuid pk', 'agency_id uuid fkx', 'name varchar(255)', 'type varchar(100)', 'is_self bool', 'archived bool'],
  'UQ (agency_id, name) · an organization the agency works with: only a name and a type, no account needed\ntype: government_agency | educational_institution | private_company | ngo_cooperative_association\nis_self = the agency itself (so it can be picked as Implementing)')
T('funding_source', 'planning', [
    'id uuid pk', 'agency_id uuid fkx', 'partner_id uuid fk:partner_agency n', 'name varchar(255)', 'archived bool'],
  'UQ (agency_id, name) · partner_id = who pays; empty for the agency\'s own funds (GAA, Agency Fund)')
T('budget_category', 'planning', ['id uuid pk', 'agency_id uuid fkx', 'name varchar(255)'])
T('document_type', 'planning', [
    'id uuid pk', 'agency_id uuid fkx', 'name varchar(255)', 'required_at_creation bool'])
T('annual_budget', 'planning', [
    'id uuid pk', 'agency_id uuid fkx', 'funding_source_id uuid fk:funding_source',
    'activity_type_id uuid fk:activity_type', 'year int', 'amount decimal(14,2)'])
T('calendar_entry', 'planning', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_type_id uuid fk:activity_type',
    'funding_source_id uuid fk:funding_source n', 'title varchar(255)', 'planned_start date',
    'planned_end date', 'planned_venue varchar(255) n', 'status varchar(50)', 'published bool'])

# ── Core activity ──
T('activity', 'core', [
    'id uuid pk', 'agency_id uuid fkx', 'calendar_entry_id uuid fk:calendar_entry uk n',
    'activity_type_id uuid fk:activity_type', 'funding_source_id uuid fk:funding_source n',
    'title varchar(255)', 'venue varchar(255)', 'start_date date', 'end_date date',
    'topic varchar(255) n', 'description text n', 'audience varchar(255) n', 'max_participants int n',
    'is_public bool', 'status varchar(50)', 'join_code varchar(32) uk'],
  'status: draft | upcoming | ongoing | completed | cancelled')
T('activity_objective', 'core', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'text varchar(500)', 'sort_order int'])
T('activity_outcome', 'core', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'text varchar(500)', 'sort_order int'],
  'planned outcomes only; results are read from outputs')
T('activity_partner', 'core', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity',
    'partner_id uuid fk:partner_agency', 'role varchar(50)', 'notes text n'],
  'UQ (activity_id, partner_id) · role: implementing | funding | collaborating | participating')
T('staffing', 'core', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'user_id uuid fk:user',
    'role_id uuid fk:agency_role', 'duty_date date n', 'duty varchar(255) n', 'status varchar(50)'],
  'role_id = the person\'s role in this activity only\neffective menus = base role (membership) + this role')
T('registration', 'core', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'user_id uuid fk:user',
    'status varchar(50)', 'registered_at datetime'],
  'UQ (activity_id, user_id)')
T('certificate_rule', 'core', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity uk',
    'min_attendance_pct decimal(5,2)', 'require_feedback bool', 'require_reentry_plan bool',
    'require_output bool'])
T('certificate', 'core', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'user_id uuid fk:user',
    'certificate_no varchar(64) uk', 'file_ref varchar(500) n', 'status varchar(20)', 'released_at datetime n'],
  'status: eligible | released | revoked')

# ── Delivery ──
T('session', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'resource_person_id uuid fk:user n',
    'title varchar(255)', 'session_type varchar(20)', 'session_date date', 'period varchar(10)',
    'start_time time', 'end_time time', 'room varchar(255) n', 'description text n',
    'qr_token varchar(128) uk', 'short_code varchar(16)', 'opens_at datetime', 'closes_at datetime',
    'feedback_opens_at datetime n'],
  'UQ (activity_id, session_date, period) · period: AM | PM\nsession_type: session | workshop | practicum | closing')
T('attendance', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'session_id uuid fk:session', 'user_id uuid fk:user',
    'recorded_by uuid fk:user n', 'client_id varchar(64) uk', 'direction varchar(8)', 'method varchar(30)',
    'device_created_at datetime', 'server_received_at datetime', 'sync_status varchar(30)'],
  'direction: in | out · method: qr | code | manual\nclient_id makes offline sync idempotent')
T('material', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'session_id uuid fk:session n',
    'uploaded_by uuid fk:user', 'title varchar(255)', 'kind varchar(20)', 'file_ref varchar(500) n',
    'url varchar(500) n', 'size_bytes int n', 'uploaded_at datetime'],
  'kind: ppt | pdf | word | image | handout | link\nsession_id empty = general reference')
T('document', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'session_id uuid fk:session n',
    'doc_type_id uuid fk:document_type', 'uploaded_by uuid fk:user', 'file_name varchar(255)',
    'file_ref varchar(500)', 'size_bytes int', 'uploaded_at datetime'],
  'agency-side records (memo, MOA, signed sheets, receipts)')
T('feedback_question', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'text varchar(500)',
    'qtype varchar(20)', 'criterion varchar(20) n', 'options json n', 'required bool', 'sort_order int'],
  'qtype: rating | choice | text\ncriterion: overall | content | speaker | venue | recommend (feeds the summaries)')
T('feedback', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'session_id uuid fk:session', 'user_id uuid fk:user',
    'client_id varchar(64) uk', 'rating int', 'comments text n', 'is_anonymous bool', 'submitted_at datetime'],
  'UQ (session_id, user_id) · one evaluation per session')
T('feedback_answer', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'feedback_id uuid fk:feedback',
    'question_id uuid fk:feedback_question', 'rating_value int n', 'text_value text n'],
  'UQ (feedback_id, question_id)')

# ── Finance & resources ──
T('budget_item', 'finance', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'category_id uuid fk:budget_category',
    'funding_source_id uuid fk:funding_source n', 'description text', 'qty decimal(12,2)',
    'unit_cost decimal(14,2)'],
  'estimate = qty x unit_cost')
T('actual_cost', 'finance', [
    'id uuid pk', 'agency_id uuid fkx', 'budget_item_id uuid fk:budget_item',
    'receipt_document_id uuid fk:document n', 'recorded_by uuid fk:user', 'amount decimal(14,2)', 'incurred_on date'])
T('resource', 'finance', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'budget_item_id uuid fk:budget_item n',
    'resource_type varchar(50)', 'name varchar(255)', 'unit varchar(50)', 'qty_needed decimal(12,2)',
    'qty_allocated decimal(12,2)', 'status varchar(30)'],
  'resource_type: people | venue | tools | inputs')

# ── Outputs & follow-up ──
T('reentry_plan', 'outputs', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'user_id uuid fk:user',
    'client_id varchar(64) uk', 'summary varchar(255)', 'timeline varchar(255) n', 'details text',
    'expected_result text n', 'support_needed text n', 'file_ref varchar(500) n', 'status varchar(20)',
    'submitted_at datetime n'],
  'UQ (activity_id, user_id) · status: pending | submitted')
T('output_submission', 'outputs', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'session_id uuid fk:session n',
    'user_id uuid fk:user', 'client_id varchar(64) uk', 'title varchar(255)', 'kind varchar(20)',
    'file_ref varchar(500)', 'size_bytes int', 'submitted_at datetime'],
  'kind: photo | file | video · uploaded from the mobile app')

T('activity_report', 'outputs', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity', 'version int', 'status varchar(20)',
    'title varchar(255)', 'input_snapshot json', 'model varchar(64) n', 'generated_at datetime n',
    'reviewed_by uuid fk:user n', 'reviewed_at datetime n', 'finalized_by uuid fk:user n', 'finalized_at datetime n'],
  'AI-drafted after-activity report · UQ (activity_id, version)\nstatus: generated | reviewed | final · final cannot be edited\ninput_snapshot = totals sent to the model (no personal data)')
T('activity_report_section', 'outputs', [
    'id uuid pk', 'agency_id uuid fkx', 'report_id uuid fk:activity_report', 'section_key varchar(32)',
    'title varchar(255)', 'body text', 'is_edited bool', 'sort_order int'],
  'UQ (report_id, section_key)\nsection_key: summary | objectives | delivery | feedback | budget | outputs | recommendations\nis_edited = a person changed the AI text')

# ── Feedback summaries (cached, refreshed when feedback is submitted) ──
T('session_feedback_summary', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'session_id uuid fk:session uk', 'activity_id uuid fk:activity',
    'resource_person_id uuid fk:user n', 'eligible_count int', 'response_count int', 'avg_rating decimal(3,2) n',
    'rating_5 int', 'rating_4 int', 'rating_3 int', 'rating_2 int', 'rating_1 int',
    'avg_content decimal(3,2) n', 'avg_speaker decimal(3,2) n', 'avg_venue decimal(3,2) n',
    'recommend_yes int', 'comment_count int', 'refreshed_at datetime'],
  'one row per session · a cache of feedback + feedback_answer, rebuilt when feedback is submitted\nshown only when response_count >= 5 so no one can be identified')
T('activity_feedback_summary', 'delivery', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity uk', 'sessions_rated int',
    'eligible_count int', 'response_count int', 'avg_rating decimal(3,2) n', 'recommend_pct decimal(5,2) n',
    'best_session_id uuid fk:session n', 'lowest_session_id uuid fk:session n', 'refreshed_at datetime'],
  'overall satisfaction = average of session ratings weighted by responses\nrebuilt from session_feedback_summary')

# ── Messaging ──
T('message_group', 'msg', [
    'id uuid pk', 'agency_id uuid fkx', 'activity_id uuid fk:activity n', 'name varchar(255)',
    'scope varchar(20)', 'archived bool'],
  'scope: dm | activity | agency')
T('group_member', 'msg', [
    'id uuid pk', 'agency_id uuid fkx', 'group_id uuid fk:message_group', 'user_id uuid fk:user',
    'muted bool', 'last_read_at datetime n', 'joined_at datetime'],
  'UQ (group_id, user_id) · last_read_at drives the unread count')
T('message', 'msg', [
    'id uuid pk', 'agency_id uuid fkx', 'group_id uuid fk:message_group', 'sender_id uuid fk:user',
    'removed_by uuid fk:user n', 'body text', 'sent_at datetime', 'removed bool'])

# ── audit columns ──
# Records that staff create and edit carry who/when for both actions. One-shot records (attendance,
# feedback, messages, registrations, scans, uploads) already hold their own actor + timestamp.
AUDIT_TABLES = [
    'agency', 'agency_role', 'agency_membership', 'participant_category', 'invitation',
    'subscription_plan', 'agency_subscription', 'platform_default_item', 'platform_setting',
    'activity_type', 'partner_agency', 'funding_source', 'budget_category', 'document_type', 'annual_budget',
    'calendar_entry', 'activity', 'activity_objective', 'activity_outcome', 'activity_partner',
    'staffing', 'certificate_rule', 'session', 'feedback_question', 'budget_item', 'resource', 'message_group',
    'role_menu', 'membership_menu', 'activity_report', 'activity_report_section',
]
AUDIT_COLS = ['created_at datetime', 'created_by uuid fk:user', 'updated_at datetime n', 'updated_by uuid fk:user n']
_by = {t['name']: t for t in TABLES}
for _n in AUDIT_TABLES:
    _t = _by[_n]
    _t['cols'] = [c for c in _t['cols'] if c['name'] not in ('created_at', 'updated_at', 'created_by', 'updated_by')]
    _t['cols'] += [C(c) for c in AUDIT_COLS]

# ───────────────────────── layout ─────────────────────────
BANDS = [
    ['agency', None, 'user', 'subscription_plan', 'agency_subscription'],
    ['agency_application', 'application_document', 'audit_log', 'platform_default_item', 'platform_setting'],
    ['participant_profile', 'agency_role', 'role_menu', 'agency_membership', 'participant_category'],
    ['invitation', 'invitation_redemption', 'agency_follower', 'notification', 'membership_menu'],
    ['activity_type', 'funding_source', 'annual_budget', 'document_type', 'budget_category'],
    ['calendar_entry', 'activity_objective', 'activity', 'activity_outcome', 'activity_partner'],
    ['staffing', 'registration', 'certificate_rule', 'certificate', 'resource'],
    ['session', 'material', 'document', 'feedback_question', 'budget_item'],
    ['attendance', 'feedback', 'feedback_answer', 'actual_cost', 'reentry_plan'],
    ['output_submission', 'session_feedback_summary', 'activity_feedback_summary', 'activity_report', 'activity_report_section'],
    ['message_group', 'group_member', 'message', 'partner_agency', None],
]

# line colour per parent table
PARENT_COLORS = {
    'agency': '#8b5cf6', 'user': '#3b82f6', 'agency_role': '#0ea5e9', 'participant_category': '#d946ef',
    'subscription_plan': '#0d9488', 'agency_membership': '#6366f1', 'invitation': '#2563eb',
    'agency_application': '#0891b2', 'activity_type': '#14b8a6', 'funding_source': '#84cc16',
    'budget_category': '#ec4899', 'partner_agency': '#f59e0b', 'document_type': '#6b7280', 'calendar_entry': '#94a3b8',
    'activity_report': '#9333ea', 'activity': '#22c55e', 'session': '#f97316', 'document': '#b45309', 'budget_item': '#ef4444',
    'message_group': '#1e40af', 'feedback_question': '#ca8a04', 'feedback': '#9333ea',
}

W, ROWH, HDR, FOOT_LH = 272, 16, 24, 11
G = 8
COL_GAP, ROW_GAP = 152, 144
MARGIN_X, TOP = 80, 184
BADGE_W = 18

by_name = {t['name']: t for t in TABLES}

def snap(v): return int(round(v / G)) * G

def foot_lines(t):
    if not t['note']: return []
    out = []
    for para in t['note'].split('\n'):
        out += textwrap.wrap(para, 50) or ['']
    return out

def height(t):
    h = HDR + ROWH * len(t['cols'])
    fl = foot_lines(t)
    if fl: h += FOOT_LH * len(fl) + 8
    return snap(h + G - 1) if snap(h) < h else snap(h)

# positions
y = TOP
GAPS = [150] + [104] * 20
for bi, b in enumerate(BANDS):
    bh = 0
    for ci, nm in enumerate(b):
        if nm is None: continue
        t = by_name[nm]
        t['x'] = MARGIN_X + ci * (W + COL_GAP)
        t['y'] = y
        t['h'] = height(t)
        t['col'] = ci
        bh = max(bh, t['h'])
    y += bh + GAPS[bi]
CANVAS_W = MARGIN_X * 2 + 5 * W + 4 * COL_GAP
CANVAS_H = y - GAPS[len(BANDS) - 1] + 80
assert not [t['name'] for t in TABLES if 'x' not in t], [t['name'] for t in TABLES if 'x' not in t]

# ───────────────────────── edges ─────────────────────────
# user_id references are drawn only where the link to the person defines the table;
# every other user_id / *_by column is badged FKu and its line is omitted (like agency_id)
DRAW_USER = {('participant_profile', 'user_id'), ('agency_membership', 'user_id'),
             ('registration', 'user_id'), ('staffing', 'user_id')}
edges = []
for t in TABLES:
    for i, c in enumerate(t['cols']):
        if c['fk'] == 'user' and (t['name'], c['name']) not in DRAW_USER:
            c['fku'] = True          # user reference: badge only, no line (keeps the diagram readable)
            continue
        if c['fk']:
            p = by_name[c['fk']]
            edges.append(dict(child=t, parent=p, col=c, row=i, color=PARENT_COLORS[p['name']],
                              optional=c['null'], one=c['pk'] or c['uk']))
for e in edges:
    assert e['parent']['name'] in PARENT_COLORS, e['parent']['name']

# child end of every edge: left/right side of the table, at the FK row
for e in edges:
    ch, pa = e['child'], e['parent']
    pcx = pa['x'] + W / 2
    ccx = ch['x'] + W / 2
    if abs(pcx - ccx) < W / 2:
        side = 'left' if ch['col'] >= 2 else 'right'
    else:
        side = 'left' if pcx < ccx else 'right'
    e['cside'] = side
    e['cy'] = ch['y'] + HDR + e['row'] * ROWH + ROWH // 2
    e['cx'] = ch['x'] if side == 'left' else ch['x'] + W

# parent end: busy parents (many children) use their left/right sides as well as the bottom,
# so lines leave in different directions instead of one tangled bundle
count = {}
for e in edges: count[e['parent']['name']] = count.get(e['parent']['name'], 0) + 1
BUSY = {n for n, k in count.items() if k >= 8}

slots = {}
for e in edges:
    ch, pa = e['child'], e['parent']
    below = ch['y'] >= pa['y'] + pa['h']
    if ch['y'] + ch['h'] <= pa['y']: side = 'top'
    elif pa['name'] in BUSY and below and ch['col'] != pa['col']:
        side = 'left' if ch['col'] < pa['col'] else 'right'
    else: side = 'bottom'
    e['pside'] = side
    slots.setdefault((pa['name'], side), []).append(e)

def pick_evenly(cands, n):
    if n >= len(cands): return cands[:n]
    return [cands[round(i * (len(cands) - 1) / (n - 1))] if n > 1 else cands[len(cands) // 2] for i in range(n)]

for (pn, side), es in slots.items():
    pa = by_name[pn]
    n = len(es)
    pcol = pa['col']
    if side in ('left', 'right'):
        # farthest column first, deeper child first: top slot -> outermost lane, so lines never cross
        es.sort(key=lambda e: ((e['child']['col'] if side == 'left' else -e['child']['col']), -e['child']['y'], e['row']))
        used = [e2['cy'] for e2 in edges if e2['child'] is pa and e2['cside'] == side]
        cands = [yy for yy in range(pa['y'] + HDR + G, pa['y'] + pa['h'] - G + 1, G)
                 if all(abs(yy - u) >= 16 for u in used)]
        c16 = cands[::2]
        pool = c16 if len(c16) >= n else cands
        ys = pick_evenly(pool, n)
        for e, yy in zip(es, ys):
            e['py'] = yy
            e['px'] = pa['x'] if side == 'left' else pa['x'] + W
        continue
    es.sort(key=lambda e: (e['child']['col'], -e['child']['y'] if e['child']['col'] <= pcol else e['child']['y'], e['row']))
    lo, hi = pa['x'] + 24, pa['x'] + W - 24
    if n == 1: xs = [snap((lo + hi) / 2)]
    else:
        step = max(G, snap((hi - lo) / (n - 1)))
        total = step * (n - 1)
        start = snap(pa['x'] + W / 2 - total / 2)
        xs = [start + step * k for k in range(n)]
    for e, x in zip(es, xs):
        e['px'] = min(max(x, pa['x'] + 16), pa['x'] + W - 16)
        e['py'] = pa['y'] if side == 'top' else pa['y'] + pa['h']

# ───────────────────────── routing ─────────────────────────
NX, NY = CANVAS_W // G + 3, CANVAS_H // G + 3
blocked = [bytearray(NY) for _ in range(NX)]
near = [bytearray(NY) for _ in range(NX)]
for t in TABLES:
    x0, x1 = t['x'], t['x'] + W
    y0, y1 = t['y'], t['y'] + t['h']
    for ix in range(max(0, (x0 - 16) // G), min(NX, (x1 + 16) // G + 1)):
        for iy in range(max(0, (y0 - 16) // G), min(NY, (y1 + 16) // G + 1)):
            cx, cy = ix * G, iy * G
            if x0 - G < cx < x1 + G and y0 - G < cy < y1 + G: blocked[ix][iy] = 1
            elif x0 - 2 * G < cx < x1 + 2 * G and y0 - 2 * G < cy < y1 + 2 * G: near[ix][iy] = 1
for ix in range(NX):
    blocked[ix][0] = blocked[ix][NY - 1] = 1
for iy in range(NY):
    blocked[0][iy] = blocked[NX - 1][iy] = 1

DX = [1, 0, -1, 0]; DY = [0, 1, 0, -1]
Huse, Vuse = {}, {}
TURN, OVERLAP, CROSS, NEAR = 7, 40, 22, 2

def astar(start, sdir, goal, gdir, eid):
    sx, sy = start; gx, gy = goal
    pq = [(abs(sx - gx) + abs(sy - gy), 0, sx, sy, sdir)]
    best = {(sx, sy, sdir): 0}
    prev = {}
    while pq:
        f, g, x, y, d = heapq.heappop(pq)
        if best.get((x, y, d), 1e18) < g: continue
        if (x, y) == (gx, gy) and d == gdir:
            path = [(x, y)]
            k = (x, y, d)
            while k in prev:
                k = prev[k]; path.append((k[0], k[1]))
            return path[::-1]
        for nd in range(4):
            if (nd + 2) % 4 == d: continue
            nx_, ny_ = x + DX[nd], y + DY[nd]
            if not (0 <= nx_ < NX and 0 <= ny_ < NY): continue
            if blocked[nx_][ny_]: continue
            cost = 1
            if nd != d: cost += TURN
            horiz = nd in (0, 2)
            own, other = (Huse, Vuse) if horiz else (Vuse, Huse)
            u = own.get((nx_, ny_))
            if u and (u - {eid}): cost += OVERLAP
            o = other.get((nx_, ny_))
            if o and (o - {eid}): cost += CROSS
            if near[nx_][ny_]: cost += NEAR
            ng = g + cost
            k = (nx_, ny_, nd)
            if ng < best.get(k, 1e18):
                best[k] = ng; prev[k] = (x, y, d)
                heapq.heappush(pq, (ng + abs(nx_ - gx) + abs(ny_ - gy), ng, nx_, ny_, nd))
    return None

def mark(path, eid):
    for i in range(len(path)):
        x, y = path[i]
        if i > 0:
            px, py = path[i - 1]
            (Huse if py == y else Vuse).setdefault((x, y), set()).add(eid)
            (Huse if py == y else Vuse).setdefault((px, py), set()).add(eid)

STUB = 16
for i, e in enumerate(edges):
    e['id'] = i
    if e['cside'] == 'left':
        s = (e['cx'] - STUB, e['cy']); sd = 2
    else:
        s = (e['cx'] + STUB, e['cy']); sd = 0
    if e['pside'] == 'top':
        g = (e['px'], e['py'] - STUB); gd = 1
    elif e['pside'] == 'left':
        g = (e['px'] - STUB, e['py']); gd = 0
    elif e['pside'] == 'right':
        g = (e['px'] + STUB, e['py']); gd = 2
    else:
        g = (e['px'], e['py'] + STUB); gd = 3
    e['s'], e['sd'], e['g'], e['gd'] = (s[0] // G, s[1] // G), sd, (g[0] // G, g[1] // G), gd
    e['dist'] = abs(s[0] - g[0]) + abs(s[1] - g[1])

failed = []
for e in sorted(edges, key=lambda e: e['dist']):
    path = astar(e['s'], e['sd'], e['g'], e['gd'], e['id'])
    if not path:
        failed.append(e); continue
    mark(path, e['id'])
    # compress to corner points (pixels)
    pts = [path[0]]
    for k in range(1, len(path) - 1):
        a, b, c = path[k - 1], path[k], path[k + 1]
        if (b[0] - a[0], b[1] - a[1]) != (c[0] - b[0], c[1] - b[1]): pts.append(b)
    pts.append(path[-1])
    pts = [(p[0] * G, p[1] * G) for p in pts]
    e['poly'] = [(e['cx'], e['cy'])] + pts + [(e['px'], e['py'])]
if failed:
    print('UNROUTED:', [(f['child']['name'], f['col']['name']) for f in failed], file=sys.stderr)

# collapse collinear duplicates
for e in edges:
    if 'poly' not in e: continue
    p = [e['poly'][0]]
    for q in e['poly'][1:]:
        if q != p[-1]: p.append(q)
    out = [p[0]]
    for k in range(1, len(p) - 1):
        a, b, c = out[-1], p[k], p[k + 1]
        if (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) != 0: out.append(b)
    out.append(p[-1])
    e['poly'] = out

# ───────────────────────── svg ─────────────────────────
MONO = "'DejaVu Sans Mono','Cascadia Mono',Consolas,Menlo,monospace"
SANS = "'DejaVu Sans','Segoe UI',Arial,sans-serif"
esc = html.escape
o = []
a = o.append

a(f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_W}" height="{CANVAS_H}" viewBox="0 0 {CANVAS_W} {CANVAS_H}">')
a(f'<rect width="100%" height="100%" fill="#ffffff"/>')

# header
n_edges = len([e for e in edges if 'poly' in e])
a(f'<text x="40" y="46" font-family="{SANS}" font-size="30" font-weight="700" fill="#111827">TMIS Logical Data Model</text>')
a(f'<text x="40" y="70" font-family="{SANS}" font-size="14" fill="#4b5563">Training and Extension Management Information System (UniFyle) · schema v3 · MySQL · {len(TABLES)} entities, no merges · {n_edges} relationships drawn</text>')

def badge(x, y, label, kind):
    if kind == 'pk': fill, stroke, col = '#fde68a', '#fde68a', '#78350f'
    elif kind == 'fk': fill, stroke, col = '#bfdbfe', '#bfdbfe', '#1e3a8a'
    elif kind == 'fkx': fill, stroke, col = '#ffffff', '#3b82f6', '#1e3a8a'
    elif kind == 'fku': fill, stroke, col = '#eff6ff', '#60a5fa', '#1e3a8a'
    else: fill, stroke, col = '#e9d5ff', '#e9d5ff', '#581c87'
    return (f'<rect x="{x}" y="{y}" width="{BADGE_W}" height="11" rx="2.5" fill="{fill}" stroke="{stroke}"/>'
            f'<text x="{x + BADGE_W / 2}" y="{y + 8.3}" text-anchor="middle" font-family="{MONO}" font-size="7.6" font-weight="700" fill="{col}">{label}</text>')

# legend
ly = 104
lx = 40
a(badge(lx, ly - 9, 'PK', 'pk')); a(f'<text x="{lx + 24}" y="{ly}" font-family="{SANS}" font-size="12" fill="#374151">primary key</text>')
lx = 150
a(badge(lx, ly - 9, 'FK', 'fk')); a(f'<text x="{lx + 24}" y="{ly}" font-family="{SANS}" font-size="12" fill="#374151">foreign key (line drawn)</text>')
lx = 345
a(badge(lx, ly - 9, 'FK*', 'fkx')); a(f'<text x="{lx + 24}" y="{ly}" font-family="{SANS}" font-size="12" fill="#374151">agency_id tenant key → agency.id (line omitted for readability)</text>')
lx = 745
a(badge(lx, ly - 9, 'FKu', 'fku')); a(f'<text x="{lx + 24}" y="{ly}" font-family="{SANS}" font-size="12" fill="#374151">user_id / *_by → user.id (line omitted for readability)</text>')
lx = 1130
a(badge(lx, ly - 9, 'UK', 'uk')); a(f'<text x="{lx + 24}" y="{ly}" font-family="{SANS}" font-size="12" fill="#374151">unique</text>')
a(f'<text x="1220" y="{ly}" font-family="{MONO}" font-size="12" font-style="italic" fill="#374151">italic</text>'
  f'<text x="1265" y="{ly}" font-family="{SANS}" font-size="12" fill="#374151">= nullable</text>')

ly2 = 132
def lg_line(x0, x1, y, mk):
    s = f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="#374151" stroke-width="1.4"/>'
    return s + mk
c = '#374151'
# many (FK end): crow's foot on the left
a(lg_line(40, 78, ly2 - 4, f'<path d="M 50 {ly2 - 4} L 40 {ly2 - 9} M 50 {ly2 - 4} L 40 {ly2 + 1}" stroke="{c}" stroke-width="1.4" fill="none"/>'))
a(f'<text x="86" y="{ly2}" font-family="{SANS}" font-size="12" fill="#374151">many (FK end)</text>')
a(lg_line(200, 238, ly2 - 4, f'<path d="M 216 {ly2 - 9} L 216 {ly2 + 1}" stroke="{c}" stroke-width="1.4"/>'))
a(f'<text x="246" y="{ly2}" font-family="{SANS}" font-size="12" fill="#374151">one (1:1 FK)</text>')
a(lg_line(370, 408, ly2 - 4, f'<path d="M 384 {ly2 - 9} L 384 {ly2 + 1} M 389 {ly2 - 9} L 389 {ly2 + 1}" stroke="{c}" stroke-width="1.4"/>'))
a(f'<text x="416" y="{ly2}" font-family="{SANS}" font-size="12" fill="#374151">parent required</text>')
a(lg_line(560, 598, ly2 - 4, f'<circle cx="572" cy="{ly2 - 4}" r="3.5" fill="#fff" stroke="{c}" stroke-width="1.4"/><path d="M 580 {ly2 - 9} L 580 {ly2 + 1}" stroke="{c}" stroke-width="1.4"/>'))
a(f'<text x="606" y="{ly2}" font-family="{SANS}" font-size="12" fill="#374151">parent optional (nullable FK)</text>')
a(f'<path d="M 800 {ly2 - 4} L 812 {ly2 - 4} A 4 4 0 0 1 820 {ly2 - 4} L 840 {ly2 - 4}" stroke="{c}" stroke-width="1.4" fill="none"/>')
a(f'<text x="848" y="{ly2}" font-family="{SANS}" font-size="12" fill="#374151">hop = lines cross, not connected</text>')
a(f'<text x="1110" y="{ly2}" font-family="{SANS}" font-size="12" fill="#374151">line colour = colour of the parent table (dot in its header)</text>')

gx0 = 40; ly3 = 158
for key, (label, col) in GROUPS.items():
    a(f'<rect x="{gx0}" y="{ly3 - 10}" width="11" height="11" rx="2" fill="{col}"/>')
    a(f'<text x="{gx0 + 17}" y="{ly3}" font-family="{SANS}" font-size="12" fill="#374151">{esc(label)}</text>')
    gx0 += 17 + len(label) * 7.2 + 38

# relationship lines (under tables)
def hop_path(poly, others):
    """Build SVG path for polyline with hops over perpendicular segments of other edges."""
    d = f'M {poly[0][0]} {poly[0][1]}'
    for k in range(1, len(poly)):
        (x0, y0), (x1, y1) = poly[k - 1], poly[k]
        if y0 == y1 and x0 != x1:
            lo, hi = min(x0, x1), max(x0, x1)
            xs = sorted({vx for (vx, vy0, vy1) in others if lo + 6 < vx < hi - 6 and min(vy0, vy1) < y0 < max(vy0, vy1)})
            if x1 < x0: xs = xs[::-1]
            sweep = 1 if x1 > x0 else 0
            sgn = 1 if x1 > x0 else -1
            last = None
            for vx in xs:
                if last is not None and abs(vx - last) < 10: continue
                d += f' L {vx - 4 * sgn} {y0} A 4 4 0 0 {sweep} {vx + 4 * sgn} {y0}'
                last = vx
            d += f' L {x1} {y1}'
        else:
            d += f' L {x1} {y1}'
    return d

# vertical segments per edge for hop calculation
vsegs = {}
for e in edges:
    if 'poly' not in e: continue
    vs = []
    for k in range(1, len(e['poly'])):
        (x0, y0), (x1, y1) = e['poly'][k - 1], e['poly'][k]
        if x0 == x1 and y0 != y1: vs.append((x0, y0, y1))
    vsegs[e['id']] = vs

for e in edges:
    if 'poly' not in e: continue
    others = [v for k, vs in vsegs.items() if k != e['id'] for v in vs]
    a(f'<path d="{hop_path(e["poly"], others)}" fill="none" stroke="{e["color"]}" stroke-width="1.5" stroke-linejoin="round" opacity="0.92"/>')

# markers
def marker_child(e):
    col = e['color']
    x, y = e['cx'], e['cy']
    s = -1 if e['cside'] == 'left' else 1   # direction pointing away from table
    if e['one']:
        bx = x + s * 7
        return f'<path d="M {bx} {y - 5} L {bx} {y + 5}" stroke="{col}" stroke-width="1.5"/>'
    ax = x + s * 11
    return (f'<path d="M {ax} {y} L {x} {y - 5.5} M {ax} {y} L {x} {y} M {ax} {y} L {x} {y + 5.5}" '
            f'stroke="{col}" stroke-width="1.5" fill="none"/>')

def marker_parent(e):
    col = e['color']
    x, y = e['px'], e['py']
    ox, oy = {'top': (0, -1), 'bottom': (0, 1), 'left': (-1, 0), 'right': (1, 0)}[e['pside']]
    qx, qy = -oy, ox          # perpendicular
    def bar(d, h=5):
        return f'M {x + ox * d + qx * h} {y + oy * d + qy * h} L {x + ox * d - qx * h} {y + oy * d - qy * h}'
    if e['optional']:
        return (f'<path d="{bar(6)}" stroke="{col}" stroke-width="1.5"/>'
                f'<circle cx="{x + ox * 12}" cy="{y + oy * 12}" r="3.6" fill="#fff" stroke="{col}" stroke-width="1.5"/>')
    return f'<path d="{bar(5)} {bar(9)}" stroke="{col}" stroke-width="1.5"/>'

for e in edges:
    if 'poly' not in e: continue
    a(marker_child(e)); a(marker_parent(e))

# tables
has_children = {e['parent']['name'] for e in edges}
for t in TABLES:
    x, y, h = t['x'], t['y'], t['h']
    gcol = GROUPS[t['group']][1]
    a(f'<g>')
    a(f'<rect x="{x}" y="{y}" width="{W}" height="{h}" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>')
    a(f'<path d="M {x} {y + HDR} L {x} {y + 3} Q {x} {y} {x + 3} {y} L {x + W - 3} {y} Q {x + W} {y} {x + W} {y + 3} L {x + W} {y + HDR} Z" fill="{gcol}"/>')
    a(f'<text x="{x + 10}" y="{y + 16.5}" font-family="{MONO}" font-size="12" font-weight="700" fill="#ffffff">{esc(t["name"])}</text>')
    if t['name'] in has_children:
        a(f'<circle cx="{x + W - 14}" cy="{y + HDR / 2}" r="5.2" fill="{PARENT_COLORS[t["name"]]}" stroke="#ffffff" stroke-width="1.6"/>')
    for i, c in enumerate(t['cols']):
        ry = y + HDR + i * ROWH
        if i % 2 == 1:
            a(f'<rect x="{x + 0.5}" y="{ry}" width="{W - 1}" height="{ROWH}" fill="#f1f5f9"/>')
        bx = x + 6
        kinds = []
        if c['pk']: kinds.append(('PK', 'pk'))
        if c.get('fku'): kinds.append(('FKu', 'fku'))
        elif c['fk']: kinds.append(('FK', 'fk'))
        elif c['fkx']: kinds.append(('FK*', 'fkx'))
        if c['uk']: kinds.append(('UK', 'uk'))
        for lab, kd in kinds:
            a(badge(bx, ry + 2.5, lab, kd)); bx += BADGE_W + 2
        nx0 = x + 6 + (BADGE_W + 2) * max(1, len(kinds)) + 4
        weight = '700' if c['pk'] else '400'
        style = ' font-style="italic"' if c['null'] else ''
        a(f'<text x="{nx0}" y="{ry + 11.6}" font-family="{MONO}" font-size="10.5" font-weight="{weight}"{style} fill="#111827">{esc(c["name"])}</text>')
        a(f'<text x="{x + W - 8}" y="{ry + 11.6}" text-anchor="end" font-family="{MONO}" font-size="9" fill="#6b7280">{esc(c["type"])}</text>')
    fl = foot_lines(t)
    if fl:
        fy = y + HDR + ROWH * len(t['cols'])
        a(f'<line x1="{x}" y1="{fy}" x2="{x + W}" y2="{fy}" stroke="#e2e8f0"/>')
        for k, line in enumerate(fl):
            a(f'<text x="{x + 8}" y="{fy + 12 + k * FOOT_LH}" font-family="{MONO}" font-size="8" font-style="italic" fill="#64748b">{esc(line)}</text>')
    a('</g>')

a('</svg>')
svg = '\n'.join(o)
svg_path = os.path.join(HERE, 'TMIS_Logical_Data_Model_v3.svg')
open(svg_path, 'w', encoding='utf-8').write(svg)
print('entities', len(TABLES), 'edges drawn', n_edges, 'canvas', CANVAS_W, CANVAS_H)

try:
    import pymupdf
    doc = pymupdf.open(svg_path)
    page = doc[0]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1.0, 1.0), alpha=False)
    pix.save(os.path.join(HERE, 'TMIS_Logical_Data_Model_v3.png'))
    print('png written', pix.width, pix.height)
except Exception as ex:
    print('PNG skipped:', ex)
