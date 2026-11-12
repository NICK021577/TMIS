import { useContext } from 'react';
import { PlatformContext } from '../context/platformContext';

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used inside <PlatformProvider>');
  return ctx;
}
