import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 grid place-items-center mx-auto mb-4">
          <span className="text-3xl font-black">?</span>
        </div>
        <h1 className="text-4xl font-black text-ink-950 tracking-tight">404</h1>
        <p className="text-ink-500 text-sm mt-2 mb-6">This page doesn't exist.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
