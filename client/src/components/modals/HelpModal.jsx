import { Button, Icon, Modal } from '../ui';

const TIPS = [
  { icon: 'search', title: 'Search from anywhere', text: 'Press Ctrl K (⌘ K on Mac) to find pages, activities and participants.' },
  { icon: 'bell', title: 'Stay up to date', text: 'The bell shows new registrations, feedback and budget alerts. Open one to jump straight to it.' },
  { icon: 'grid', title: 'Your menus', text: 'The menus you see depend on your role. If one is missing, ask your Agency Administrator.' },
  { icon: 'logout', title: 'Signing out', text: 'Use Sign out at the bottom of the left menu.' },
];

/** HelpModal — quick tips for now. A fuller help center can replace it later. */
export default function HelpModal({ onClose }) {
  return (
    <Modal title="Help" subtitle="A few things that make UniFyle quicker to use" onClose={onClose} width={520}
      footer={<><span /><Button onClick={onClose}>Got it</Button></>}>
      <ul className="space-y-3 pb-2">
        {TIPS.map((t) => (
          <li key={t.title} className="flex gap-3">
            <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-brand-100/70 text-brand-700"><Icon name={t.icon} size={16} /></span>
            <span><strong className="block text-[13px] font-medium text-ink-950">{t.title}</strong><small className="mt-0.5 block text-xs leading-relaxed text-ink-600">{t.text}</small></span>
          </li>
        ))}
      </ul>
      <p className="glass-inset mt-2 rounded-2xl px-4 py-3 text-xs leading-relaxed text-ink-600">Need something else? Your Agency Administrator can help with accounts and access.</p>
    </Modal>
  );
}
