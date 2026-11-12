import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Logo } from '../../ui/Logo';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="app-bg flex items-center justify-center p-8">
      <div className="glass-panel rounded-[28px] px-10 py-12 text-center max-w-md w-full">
        <div className="mb-4 flex justify-center"><Logo size={64} wordmark={false} /></div>
        <h1 className="text-4xl font-medium text-ink-950 tracking-tight">404</h1>
        <p className="text-ink-500 text-sm mt-2 mb-6">This page doesn't exist.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
