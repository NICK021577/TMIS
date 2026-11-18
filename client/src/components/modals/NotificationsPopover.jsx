import { useNavigate } from 'react-router-dom';
import { Icon, Popover } from '../ui';
import { useStore } from '../../hooks/useStore';

/** NotificationsPopover — the bell in the header, with a live unread count. */
export default function NotificationsPopover() {
  const navigate = useNavigate();
  const { notifications, setNotifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  const markAll = () => setNotifications((l) => l.map((n) => ({ ...n, read: true })));
  const open = (n, close) => {
    setNotifications((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    close();
    if (n.to) navigate(n.to);
  };

  return (
    <Popover
      width={360}
      trigger={({ open: isOpen, toggle }) => (
        <button onClick={toggle} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={isOpen}
          className={`relative grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-white/60 ${isOpen ? 'bg-white/70' : ''}`}>
          <Icon name="bell" size={18} />
          {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-medium text-white">{unread}</span>}
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <h2 className="text-sm font-medium text-ink-950">Notifications</h2>
            <button type="button" disabled={!unread} onClick={markAll} className="text-xs font-medium text-brand-700 hover:text-brand-900 disabled:cursor-default disabled:text-ink-400">Mark all as read</button>
          </div>
          {notifications.length ? (
            <ul className="max-h-[380px] overflow-y-auto px-2 pb-2">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button onClick={() => open(n, close)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/60">
                    <i className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-brand-600'}`} />
                    <span className="min-w-0 flex-1">
                      <strong className={`block text-[13px] ${n.read ? 'font-normal text-ink-700' : 'font-medium text-ink-950'}`}>{n.title}</strong>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-500">{n.text}</span>
                      <small className="mt-1 block text-[11px] text-ink-400">{n.time}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="px-5 pb-6 pt-2 text-center text-[13px] text-ink-500">You are all caught up.</p>}
        </div>
      )}
    </Popover>
  );
}
