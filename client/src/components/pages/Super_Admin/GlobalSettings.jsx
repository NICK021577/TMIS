import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Button, Icon, Panel, PanelTitle } from '../../ui';
import { usePlatform } from '../../../hooks/usePlatform';

function ChipList({ title, subtitle, field, items, onChange }) {
  const [draft, setDraft] = useState('');

  function add(e) {
    e.preventDefault();
    const v = draft.trim();
    if (!v || items.some((i) => i.toLowerCase() === v.toLowerCase())) return;
    onChange(field, [...items, v], `${title}: added “${v}”`);
    setDraft('');
  }

  return (
    <Panel>
      <PanelTitle title={title} subtitle={subtitle} />
      <ul className="mb-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item} className="glass-inset inline-flex items-center gap-1.5 rounded-full py-1.5 pl-3.5 pr-1.5 text-[13px] font-medium text-ink-800">
            {item}
            <button
              onClick={() => onChange(field, items.filter((i) => i !== item), `${title}: removed “${item}”`)}
              aria-label={`Remove ${item}`}
              className="grid h-5 w-5 place-items-center rounded-full text-ink-500 transition-colors hover:bg-red-100 hover:text-danger"
            >
              <Icon name="close" size={12} />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Add to ${title.toLowerCase()}…`}
          aria-label={`Add to ${title}`}
          className="glass-input h-10 min-w-0 flex-1 rounded-xl px-3.5 text-[13px] text-ink-950 placeholder:text-ink-400"
        />
        <Button type="submit" size="sm" icon="plus" disabled={!draft.trim()}>Add</Button>
      </form>
    </Panel>
  );
}

export default function GlobalSettings() {
  const { settings, updateSettings, notify } = usePlatform();
  const [cert, setCert] = useState(settings.certificate);

  const onList = (field, items, what) => updateSettings({ [field]: items }, what);

  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Management"
        title="Global settings"
        subtitle="Defaults every new agency starts with. Agencies can change their own copy afterwards."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChipList title="Activity types" subtitle="Shown when creating an activity" field="activityTypes" items={settings.activityTypes} onChange={onList} />
        <ChipList title="Document types" subtitle="Agencies pick which ones are required" field="documentTypes" items={settings.documentTypes} onChange={onList} />
        <ChipList title="Budget categories" subtitle="Used by every activity budget" field="budgetCategories" items={settings.budgetCategories} onChange={onList} />

        <Panel>
          <PanelTitle title="Certificate defaults" subtitle="Starting rules for new activities" />
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <label htmlFor="minAtt" className="text-ink-600">Minimum attendance</label>
                <strong className="text-ink-950">{cert.minAttendance}%</strong>
              </div>
              <input
                id="minAtt"
                type="range"
                min="50"
                max="100"
                step="5"
                value={cert.minAttendance}
                onChange={(e) => setCert({ ...cert, minAttendance: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>
            {[
              ['requireFeedback', 'Require session feedback'],
              ['requireReentryPlan', 'Require a reentry plan'],
            ].map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between text-[13px] text-ink-800">
                {label}
                <input
                  type="checkbox"
                  checked={cert[key]}
                  onChange={(e) => setCert({ ...cert, [key]: e.target.checked })}
                  className="h-4 w-4 rounded accent-brand-600"
                />
              </label>
            ))}
            <Button onClick={() => { updateSettings({ certificate: cert }, 'Certificate defaults'); notify?.('Certificate defaults saved'); }}>
              Save defaults
            </Button>
          </div>
        </Panel>
      </div>
    </PageWrapper>
  );
}
