/**
 * Agency verification rules: which supporting documents an agency must submit,
 * based on the type of organization it registers as.
 *
 * Why: UniFyle verifies every agency to keep an audit trail under the Data Privacy Act of 2012
 * before an Agency Administrator can manage trainee personal data.
 *
 * Four slots:
 *   1 authority  Authority to represent        required for all
 *   2 entity     Proof of entity / legitimacy  required, except where an official email auto-verifies it
 *   3 validId    Valid ID of contact person    required for all
 *   4 moa        MOA / partnership document    optional for all (legal sign-off must not block onboarding)
 */

export const ORG_TYPES = [
  {
    value: 'Government Agency', icon: 'building',
    desc: 'National agency, attached agency or LGU, e.g. DA-PRRI',
    authority: { label: 'Endorsement letter or office order', options: ['Endorsement letter', 'Office order'] },
    entity: { label: 'Proof of government status', options: ['Office order', 'Special order', 'Agency charter'], autoDomain: 'gov.ph', autoLabel: '.gov.ph' },
  },
  {
    value: 'Educational Institution', icon: 'award',
    desc: 'SUC, private school or TESDA-accredited center',
    authority: { label: 'Designation or authorization letter', options: ['Designation letter', 'Authorization letter'] },
    entity: { label: 'Proof of institution status', options: ['DepEd / CHED permit', 'TESDA accreditation', 'Charter'], autoDomain: 'edu.ph', autoLabel: '.edu.ph' },
  },
  {
    value: 'Private Company', icon: 'users',
    desc: 'Corporation, sole proprietorship or private training provider',
    authority: { label: 'Authorization letter or secretary’s certificate', options: ['Authorization letter', 'Secretary’s certificate'] },
    entity: { label: 'Business registration', options: ['DTI certificate (sole proprietorship)', 'SEC registration (corporation / partnership)', 'Mayor’s / business permit'] },
  },
  {
    value: 'NGO / Cooperative / Association', icon: 'sparkle',
    desc: 'Non-government organization, cooperative or association',
    authority: { label: 'Board resolution or authorization letter', options: ['Board resolution', 'Authorization letter'] },
    entity: { label: 'Registration certificate', options: ['SEC non-stock registration', 'CDA certificate'] },
  },
];

export const AGENCY_TYPES = ORG_TYPES.map((t) => t.value);
export const orgType = (value) => ORG_TYPES.find((t) => t.value === value);

/** True when the email's domain is the given suffix, e.g. emailHasDomain('a@prri.gov.ph', 'gov.ph'). */
export function emailHasDomain(email = '', suffix) {
  const domain = String(email).split('@')[1]?.trim().toLowerCase();
  return !!domain && (domain === suffix || domain.endsWith(`.${suffix}`));
}

/** The four document slots for an organization type. `auto` means an official email verifies it, so nothing is uploaded. */
export function docSlots(type, email) {
  const t = orgType(type);
  if (!t) return [];
  const auto = !!t.entity.autoDomain && emailHasDomain(email, t.entity.autoDomain);
  return [
    { id: 'authority', n: 1, label: t.authority.label, short: 'Authority to represent', required: true, options: t.authority.options,
      hint: 'Shows you are allowed to register this organization on UniFyle.' },
    { id: 'entity', n: 2, label: t.entity.label, short: 'Proof of entity', required: !auto, auto, options: t.entity.options,
      autoLabel: t.entity.autoLabel,
      hint: t.entity.autoDomain
        ? `Not needed if your contact email ends in ${t.entity.autoLabel}. Otherwise attach one of the documents below.`
        : 'Shows the organization is legitimately registered.' },
    { id: 'validId', n: 3, label: 'Valid ID of the contact person', short: 'Valid ID', required: true,
      options: ['Official agency / employee ID', 'Philippine government-issued ID'],
      hint: 'An official agency or employee ID, or a Philippine government-issued ID.' },
    { id: 'moa', n: 4, label: 'Memorandum of Agreement or partnership document', short: 'MOA / partnership', required: false,
      hint: 'Optional for now. You can add it later, so legal sign-off never delays your workspace.' },
  ];
}

/** Slots that must still be provided for an application (given the files/docs it already has, by slot id). */
export const missingSlots = (type, email, have) =>
  docSlots(type, email).filter((s) => s.required && !s.auto && !have(s.id));

export const FILE_RULES = { maxMb: 5, ext: ['pdf', 'jpg', 'jpeg', 'png'], accept: '.pdf,.jpg,.jpeg,.png' };
