import { useState } from 'react';
import { Button, Field, Icon, Modal, inputCls } from '../ui';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ForgotPasswordModal — ask for a reset link. Frontend only: it shows the confirmation state. */
export default function ForgotPasswordModal({ initialEmail = '', onClose }) {
  const [email, setEmail] = useState(initialEmail);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = EMAIL.test(email.trim());

  return (
    <Modal
      title={sent ? 'Check your email' : 'Reset your password'}
      subtitle={sent ? undefined : 'We will email you a link to choose a new password'}
      onClose={onClose}
      width={440}
      footer={sent
        ? <><span /><Button onClick={onClose}>Back to sign in</Button></>
        : <><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="forgot" icon="send">Send reset link</Button></div></>}
    >
      {sent ? (
        <div className="space-y-3 pb-2 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Icon name="mail" size={24} /></span>
          <p className="text-[13px] leading-relaxed text-ink-600">If an account exists for <strong className="font-medium text-ink-900">{email.trim()}</strong>, a reset link is on its way. It expires in 30 minutes.</p>
        </div>
      ) : (
        <form id="forgot" noValidate className="pb-2" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (valid) setSent(true); }}>
          <Field label="Email address">
            <input type="email" inputMode="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@agency.gov.ph"
              aria-invalid={touched && !valid} className={`${inputCls} aria-[invalid=true]:border-danger`} />
            {touched && !valid && <small className="flex items-center gap-1 text-[11px] text-danger"><Icon name="alert" size={12} />Enter a valid email address.</small>}
          </Field>
        </form>
      )}
    </Modal>
  );
}
