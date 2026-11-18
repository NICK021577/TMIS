import { createContext, useContext } from 'react';

export const ConfirmContext = createContext(null);

/**
 * useConfirm — ask the user before doing something that is hard to undo.
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Delete item?', message: '…', confirmLabel: 'Delete' })) { … }
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
}
