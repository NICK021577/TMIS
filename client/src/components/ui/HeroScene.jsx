import { Component, lazy, Suspense, useState } from 'react';
import { HeroArt } from './HeroArt';

// The 3D library is loaded only when a banner that uses it is shown.
const Hero3D = lazy(() => import('./Hero3D'));

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const webglAvailable = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
};

/**
 * HeroScene — live 3D scene for banner cards (right side, hidden on phones).
 * Falls back to the flat CSS shapes when WebGL is not available.
 */
export function HeroScene() {
  const [ok] = useState(webglAvailable);
  if (!ok) return <HeroArt />;
  return (
    <Boundary fallback={<HeroArt />}>
      <div className="absolute inset-y-0 right-0 hidden w-[50%] translate-x-[14%] cursor-grab active:cursor-grabbing sm:block" aria-hidden="true">
        <Suspense fallback={null}><Hero3D /></Suspense>
      </div>
    </Boundary>
  );
}
