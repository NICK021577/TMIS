import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { ActionIcon, Avatar, Button, Icon, Switch } from '../../ui';
import ModerateGroupModal from '../../modals/ModerateGroupModal';
import NewGroupModal from '../../modals/NewGroupModal';
import { useConfirm } from '../../modals/confirmContext';
import { MESSAGES, MESSAGE_GROUPS } from '../../../data/mockData';

const ME = 'Alexis Ramos';
const isDirectChat = (g) => g.type === 'Direct message';

/** Last-message previews for conversations that start with history. */
const SEED_PREVIEW = {
  'PRRI Participant Support': { text: 'Reminder: certificates are released after the final day.', time: 'Mon' },
  'Nursery Management Batch 2': { text: 'Please confirm your attendance for Friday.', time: 'Sat' },
};
const GROUP_MEMBERS = [
  { name: 'Dr. Marissa Flores', role: 'Activity lead' },
  { name: 'Juan Dela Cruz', role: 'Participant' },
  { name: 'Maria Santos', role: 'Participant' },
  { name: 'Rogelio Mendoza', role: 'Participant' },
  { name: 'Elena Garcia', role: 'Participant' },
];

/** A round avatar for a person, or an icon tile for a group. */
function ChatAvatar({ chat, size = 'md', online = false }) {
  const dim = size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  return (
    <span className="relative inline-block flex-shrink-0">
      {isDirectChat(chat) ? (
        <Avatar name={chat.name} size={size === 'lg' ? 'lg' : 'md'} className={`${dim} ${size === 'lg' ? 'text-xl' : ''} !ring-0`} />
      ) : (
        <span className={`grid ${dim} place-items-center rounded-full bg-gradient-to-br from-brand-500 to-[#7b61e8] text-white`}><Icon name="users" size={size === 'lg' ? 30 : size === 'sm' ? 15 : 20} /></span>
      )}
      {online && <i className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />}
    </span>
  );
}

export default function Messaging({ notify }) {
  const confirm = useConfirm();
  // Arriving from "Message participant" opens a direct thread with that person.
  const { state } = useLocation();
  const direct = state?.to ? { name: state.to, type: 'Direct message', members: 2, unread: 0 } : null;
  const [groups, setGroups] = useState(direct ? [direct, ...MESSAGE_GROUPS] : MESSAGE_GROUPS);
  const [selected, setSelected] = useState(groups[0]);
  const [newGroup, setNewGroup] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [query, setQuery] = useState('');
  const [muted, setMuted] = useState({});
  const [draft, setDraft] = useState('');
  const [threads, setThreads] = useState({ [MESSAGE_GROUPS[0].name]: MESSAGES });
  const endRef = useRef(null);

  const thread = threads[selected.name] ?? [];
  const isDirect = isDirectChat(selected);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [thread.length, selected.name]);

  const createGroup = (g) => {
    const name = groups.some((x) => x.name === g.name) ? `${g.name} (2)` : g.name;
    const made = { ...g, name };
    setGroups((l) => [made, ...l]);
    setSelected(made);
    notify?.(`Group “${name}” created`);
  };
  const patchGroup = (patch) => {
    setGroups((l) => l.map((g) => (g.name === selected.name ? { ...g, ...patch } : g)));
    setSelected((s) => ({ ...s, ...patch }));
  };
  const deleteGroup = () => {
    const rest = groups.filter((g) => g.name !== selected.name);
    if (!rest.length) { notify?.('Keep at least one conversation'); return; }
    setGroups(rest);
    setSelected(rest[0]);
  };
  const removeDirect = async () => {
    if (!(await confirm({ tone: 'danger', title: `Delete chat with ${selected.name}?`, message: 'The conversation is removed from your list.', confirmLabel: 'Delete chat' }))) return;
    deleteGroup();
    notify?.('Conversation deleted');
  };
  const open = (g) => {
    setSelected(g);
    if (g.unread) setGroups((l) => l.map((x) => (x.name === g.name ? { ...x, unread: 0 } : x)));
  };

  function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setThreads((t) => ({ ...t, [selected.name]: [...(t[selected.name] ?? []), { who: ME, time: 'Just now', text: draft.trim() }] }));
    setDraft('');
  }

  const preview = (g) => {
    const t = threads[g.name];
    if (t?.length) { const m = t[t.length - 1]; return { text: `${m.who === ME ? 'You: ' : ''}${m.text}`, time: m.time }; }
    return SEED_PREVIEW[g.name] ?? { text: isDirectChat(g) ? 'Say hello 👋' : 'No messages yet', time: '' };
  };
  const shown = useMemo(() => groups.filter((g) => g.name.toLowerCase().includes(query.trim().toLowerCase())), [groups, query]);

  return (
    <PageWrapper>
      <PageHeader eyebrow="Administration" title="Messaging" subtitle="Talk to participants and run agency and activity groups.">
        <Button icon="plus" onClick={() => setNewGroup(true)}>New group</Button>
      </PageHeader>

      <div className="glass flex h-[calc(100vh-210px)] min-h-[520px] overflow-hidden rounded-3xl">
        {/* Conversations */}
        <aside className="flex w-[320px] flex-shrink-0 flex-col border-r border-[var(--glass-divider)] max-md:w-full max-md:border-r-0" aria-label="Conversations">
          <div className="p-4 pb-2">
            <h2 className="mb-3 text-lg font-medium text-ink-950">Chats</h2>
            <label className="glass-inset flex h-10 items-center gap-2 rounded-full px-3.5 text-ink-500">
              <Icon name="search" size={15} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" aria-label="Search chats" className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-950 outline-none placeholder:text-ink-400" />
            </label>
          </div>
          <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
            {shown.map((g) => {
              const active = g.name === selected.name;
              const p = preview(g);
              return (
                <li key={g.name}>
                  <button onClick={() => open(g)} aria-current={active ? 'true' : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${active ? 'bg-white/90 shadow-[0_4px_14px_rgba(30,70,180,0.10)]' : 'hover:bg-white/55'}`}>
                    <ChatAvatar chat={g} online={isDirectChat(g)} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <strong className={`truncate text-[14px] ${g.unread ? 'font-semibold' : 'font-medium'} text-ink-950`}>{g.name}</strong>
                        <small className="flex-shrink-0 text-[11px] text-ink-500">{p.time}</small>
                      </span>
                      <span className="flex items-center justify-between gap-2">
                        <span className={`truncate text-[13px] ${g.unread ? 'font-medium text-ink-900' : 'text-ink-500'}`}>{p.text}</span>
                        {g.unread > 0 && <span className="grid h-5 min-w-5 flex-shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-medium text-white">{g.unread}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-ink-500">No chats match “{query}”.</li>}
          </ul>
        </aside>

        {/* Conversation */}
        <section className="flex min-w-0 flex-1 flex-col max-md:hidden" aria-label={`Conversation with ${selected.name}`}>
          <header className="flex items-center gap-3 border-b border-[var(--glass-divider)] px-5 py-3">
            <ChatAvatar chat={selected} size="sm" online={isDirect} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[15px] font-medium text-ink-950">{selected.name}</h2>
              <p className="text-xs text-ink-500">{isDirect ? <span className="text-emerald-600">Active now</span> : `${selected.members} members`}</p>
            </div>
            <ActionIcon icon="phone" label="Call" onClick={() => notify?.('Calling is not available in this prototype')} />
            <ActionIcon icon="more" label={showInfo ? 'Hide details' : 'Show details'} tone={showInfo ? 'brand' : undefined} onClick={() => setShowInfo((v) => !v)} />
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {thread.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <ChatAvatar chat={selected} size="lg" />
                  <strong className="mt-3 block text-base font-medium text-ink-950">{selected.name}</strong>
                  <p className="mt-1 text-[13px] text-ink-500">{isDirect ? 'This is the start of your conversation. Say hello.' : 'No messages yet. Start the conversation.'}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-wider text-ink-400">Today</p>
                <div className="space-y-0.5">
                  {thread.map((m, i) => {
                    const mine = m.who === ME;
                    const next = thread[i + 1];
                    const prev = thread[i - 1];
                    const first = prev?.who !== m.who;
                    const last = next?.who !== m.who;
                    return (
                      <div key={i} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'} ${first && i > 0 ? 'pt-3' : ''}`}>
                        {!mine && (last ? <Avatar name={m.who} size="sm" className="!ring-0" /> : <span className="w-8 flex-shrink-0" />)}
                        <div className={`flex max-w-[68%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                          {!mine && !isDirect && first && <small className="mb-0.5 ml-3 text-[11px] text-ink-500">{m.who}</small>}
                          <p title={m.time}
                            className={`px-3.5 py-2 text-[14px] leading-snug ${mine ? 'bg-gradient-to-br from-brand-600 to-[#6f58e0] text-white' : 'bg-white text-ink-900 shadow-[0_1px_4px_rgba(30,50,120,0.08)]'} ${mine ? `rounded-[20px] ${first ? '' : 'rounded-tr-md'} ${last ? '' : 'rounded-br-md'}` : `rounded-[20px] ${first ? '' : 'rounded-tl-md'} ${last ? '' : 'rounded-bl-md'}`}`}>{m.text}</p>
                          {last && <small className="mt-1 px-2 text-[11px] text-ink-400">{m.time}</small>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-[var(--glass-divider)] px-4 py-3">
            <ActionIcon icon="plus" label="Attach a file" tone="brand" onClick={() => notify?.('Attachments are not available in this prototype')} />
            <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Message"
              placeholder={isDirect ? `Message ${selected.name}…` : 'Write to the group…'}
              className="glass-inset h-11 min-w-0 flex-1 rounded-full px-5 text-[14px] text-ink-950 outline-none placeholder:text-ink-400 focus:bg-white" />
            <button type="submit" disabled={!draft.trim()} aria-label="Send message"
              className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-brand-600 text-white transition-all hover:bg-brand-700 disabled:bg-ink-200 disabled:text-ink-400"><Icon name="send" size={17} /></button>
          </form>
        </section>

        {/* Details */}
        {showInfo && (
          <aside className="hidden w-[290px] flex-shrink-0 flex-col overflow-y-auto border-l border-[var(--glass-divider)] p-5 xl:flex" aria-label="Chat details">
            <div className="text-center">
              <ChatAvatar chat={selected} size="lg" online={isDirect} />
              <h3 className="mt-3 text-base font-medium text-ink-950">{selected.name}</h3>
              <p className="text-xs text-ink-500">{isDirect ? 'Participant · PRRI' : `${selected.type} · ${selected.members} members`}</p>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3">
              <span className="text-[13px] text-ink-800">Mute notifications</span>
              <Switch checked={!!muted[selected.name]} onChange={(v) => setMuted((m) => ({ ...m, [selected.name]: v }))} label="Mute notifications" />
            </div>

            {isDirect ? (
              <div className="mt-4 space-y-2">
                <Button variant="secondary" className="w-full" icon="users" onClick={() => notify?.(`Opening ${selected.name}'s profile`)}>View profile</Button>
                <Button variant="danger" className="w-full" icon="trash" onClick={removeDirect}>Delete chat</Button>
              </div>
            ) : (
              <>
                <h4 className="mb-2 mt-6 text-xs font-medium uppercase tracking-wider text-ink-500">Members</h4>
                <ul className="space-y-1">
                  {GROUP_MEMBERS.map((m) => (
                    <li key={m.name} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
                      <Avatar name={m.name} size="sm" className="!ring-0" />
                      <span className="min-w-0"><strong className="block truncate text-[13px] font-medium text-ink-950">{m.name}</strong><small className="text-[11px] text-ink-500">{m.role}</small></span>
                    </li>
                  ))}
                </ul>
                {selected.members > GROUP_MEMBERS.length && <p className="mt-1 px-1 text-xs text-ink-500">and {selected.members - GROUP_MEMBERS.length} more</p>}
                <Button variant="secondary" className="mt-5 w-full" icon="shield" onClick={() => setModerating(true)}>Moderate group</Button>
              </>
            )}
          </aside>
        )}
      </div>

      {newGroup && <NewGroupModal onCreate={createGroup} onClose={() => setNewGroup(false)} />}
      {moderating && <ModerateGroupModal group={selected} onUpdate={patchGroup} onDelete={deleteGroup} onClose={() => setModerating(false)} notify={notify} />}
    </PageWrapper>
  );
}
