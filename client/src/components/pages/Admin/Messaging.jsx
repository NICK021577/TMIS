import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Avatar, Button, Icon, Panel } from '../../ui';
import { MESSAGES, MESSAGE_GROUPS } from '../../../data/mockData';

export default function Messaging({ notify }) {
  const [selected, setSelected] = useState(MESSAGE_GROUPS[0]);
  const [draft, setDraft] = useState('');
  const [thread, setThread] = useState(MESSAGES);

  function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setThread((t) => [...t, { who: 'Alexis Ramos', time: 'Just now', text: draft.trim() }]);
    setDraft('');
  }

  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Administration"
        title="Messaging administration"
        subtitle="Manage online agency and activity groups, membership, and moderation."
      >
        <Button icon="plus" onClick={() => notify?.('New group created')}>New group</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_260px]">
        {/* Groups */}
        <Panel pad={false} className="h-fit overflow-hidden">
          <div className="p-5 pb-3">
            <h2 className="text-base font-medium text-ink-950">Message groups</h2>
            <p className="text-[13px] text-ink-500">{MESSAGE_GROUPS.length} active groups</p>
          </div>
          <ul className="px-2 pb-2">
            {MESSAGE_GROUPS.map((g) => {
              const active = g.name === selected.name;
              return (
                <li key={g.name}>
                  <button
                    onClick={() => setSelected(g)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${active ? 'bg-white/85 shadow-[0_4px_14px_rgba(30,70,180,0.10)]' : 'hover:bg-white/55'}`}
                  >
                    <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><Icon name="message" size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[13px] font-medium text-ink-950">{g.name}</strong>
                      <small className="block text-xs text-ink-500">{g.type} · {g.members} members</small>
                    </span>
                    {g.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1.5 text-[11px] font-medium text-white">{g.unread}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Thread */}
        <Panel pad={false} className="flex min-h-[460px] flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[var(--glass-divider)] px-5 py-4">
            <div>
              <h2 className="text-base font-medium text-ink-950">{selected.name}</h2>
              <p className="text-xs text-ink-500">{selected.members} members · Created by Alexis Ramos</p>
            </div>
            <Icon name="more" size={18} className="text-ink-400" />
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {thread.map((m, i) => (
              <div key={i} className="flex gap-3">
                <Avatar name={m.who} size="sm" />
                <div className="min-w-0">
                  <p className="text-[13px]"><strong className="text-ink-950">{m.who}</strong> <span className="ml-1 text-xs text-ink-500">{m.time}</span></p>
                  <p className="glass-inset mt-1 inline-block rounded-2xl rounded-tl-md px-3.5 py-2 text-[13px] leading-relaxed text-ink-800">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-[var(--glass-divider)] p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write an announcement…"
              aria-label="Message"
              className="glass-input h-11 min-w-0 flex-1 rounded-xl px-4 text-[13px] text-ink-950 placeholder:text-ink-400"
            />
            <Button type="submit" icon="send">Send</Button>
          </form>
        </Panel>

        {/* Overview */}
        <Panel className="hidden h-fit xl:block">
          <h2 className="text-base font-medium text-ink-950">Group overview</h2>
          <div className="mt-3 flex items-center -space-x-2">
            {['Alexis Ramos', 'Marissa Flores', 'Juan Dela Cruz'].map((n) => <Avatar key={n} name={n} size="sm" />)}
            <span className="ml-3 pl-2 text-[13px] text-ink-500">+{selected.members - 3}</span>
          </div>
          <dl className="mt-5 space-y-3 border-t border-[var(--glass-divider)] pt-4 text-[13px]">
            <div className="flex justify-between"><dt className="text-ink-500">Type</dt><dd className="font-medium text-ink-950">{selected.type}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Members</dt><dd className="font-medium text-ink-950">{selected.members}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Unread</dt><dd className="font-medium text-ink-950">{selected.unread}</dd></div>
          </dl>
          <Button variant="secondary" className="mt-5 w-full" onClick={() => notify?.('Moderation tools opened')}>Moderate group</Button>
        </Panel>
      </div>
    </PageWrapper>
  );
}
