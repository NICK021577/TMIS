import { useState, useCallback } from 'react';

/**
 * useToast — lightweight toast notification hook
 *
 * Usage:
 *   const { toast, notify } = useToast();
 *   notify('Activity created!');
 *   // then render <Toast message={toast} /> somewhere at the root
 */
export function useToast(duration = 2800) {
  const [toast, setToast] = useState('');

  const notify = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(''), duration);
  }, [duration]);

  return { toast, notify };
}
