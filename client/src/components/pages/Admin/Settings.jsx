import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { useAuth } from '../../../context/AuthContext';
import { SettingsLayout } from '../../settings/SettingsKit';
import ProfileTab from '../../settings/ProfileTab';
import BrandingTab from '../../settings/BrandingTab';
import CategoriesTab from '../../settings/CategoriesTab';
import PartnersTab from '../../settings/PartnersTab';
import FundingTab from '../../settings/FundingTab';
import UsersTab from '../../settings/UsersTab';
import RolesTab from '../../settings/RolesTab';

const SECTIONS = [
  { id: 'profile',    label: 'Agency profile', icon: 'building', desc: 'Name, mission and vision', Body: ProfileTab },
  { id: 'brand',      label: 'Branding',       icon: 'sparkle',  desc: 'Logo and colors',          Body: BrandingTab },
  { id: 'categories', label: 'Participant categories', icon: 'users', desc: 'Who participates',    Body: CategoriesTab },
  { id: 'partners',   label: 'Partner agencies', icon: 'link',  desc: 'Who you work with',       Body: PartnersTab },
  { id: 'funding',    label: 'Funding sources',  icon: 'award', desc: 'Where the money comes from', Body: FundingTab },
  { id: 'users',      label: 'Users',         icon: 'key',      desc: 'Accounts and invites',     Body: UsersTab },
  { id: 'roles',      label: 'Roles & permissions', icon: 'shield', desc: 'Who can see what',     Body: RolesTab },
];

/**
 * Agency settings (Agency Administrators only).
 * Only the agency profile and branding hold a draft, so only those two ask to be saved.
 */
export default function Settings({ notify }) {
  const { role } = useAuth();
  const [id, setId] = useState('profile');
  const readOnly = !(role === 'Agency Administrator' || role === 'Super Admin');
  const { Body } = SECTIONS.find((s) => s.id === id);

  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Administration"
        title="Agency settings"
        subtitle="Configure your agency profile, participant-facing identity, users, and permissions."
      />
      <SettingsLayout sections={SECTIONS} id={id} onChange={setId}>
        <Body readOnly={readOnly} notify={notify} />
      </SettingsLayout>
    </PageWrapper>
  );
}
