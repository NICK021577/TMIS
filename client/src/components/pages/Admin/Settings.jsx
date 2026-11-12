import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Button, Tabs } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import ProfileTab from '../../settings/ProfileTab';
import BrandingTab from '../../settings/BrandingTab';
import CategoriesTab from '../../settings/CategoriesTab';
import UsersTab from '../../settings/UsersTab';
import RolesTab from '../../settings/RolesTab';

const TABS = [
  { id: 'profile',    label: 'Agency profile' },
  { id: 'brand',      label: 'Branding' },
  { id: 'categories', label: 'Participant categories' },
  { id: 'users',      label: 'Users' },
  { id: 'roles',      label: 'Roles & permissions' },
];

/**
 * Agency settings (Agency Administrators only).
 * Tabs follow the draft: profile · branding · participant categories · users · roles.
 */
export default function Settings({ notify }) {
  const { role } = useAuth();
  const [tab, setTab] = useState('profile');
  const readOnly = !(role === 'Agency Administrator' || role === 'Super Admin');

  return (
    <PageWrapper>
      <PageHeader
        title="Agency settings"
        subtitle="Configure your agency profile, participant-facing identity, users, and permissions."
      >
        {!readOnly && <Button onClick={() => notify?.('All settings are saved')}>Save changes</Button>}
      </PageHeader>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'profile'    && <ProfileTab readOnly={readOnly} notify={notify} />}
      {tab === 'brand'      && <BrandingTab readOnly={readOnly} notify={notify} />}
      {tab === 'categories' && <CategoriesTab readOnly={readOnly} notify={notify} />}
      {tab === 'users'      && <UsersTab readOnly={readOnly} notify={notify} />}
      {tab === 'roles'      && <RolesTab readOnly={readOnly} notify={notify} />}
    </PageWrapper>
  );
}
