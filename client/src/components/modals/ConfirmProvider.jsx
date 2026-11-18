import { useCallback, useMemo, useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { ConfirmContext } from './confirmContext';

/** Mount once near the root. Renders the popup and resolves the promise returned by confirm(). */
export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null);

  const confirm = useCallback((options) => new Promise((resolve) => setReq({ options, resolve })), []);
  const close = (answer) => { req?.resolve(answer); setReq(null); };
  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {req && <ConfirmModal {...req.options} onConfirm={() => close(true)} onCancel={() => close(false)} />}
    </ConfirmContext.Provider>
  );
}
