import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, OrbitControls, RoundedBox } from '@react-three/drei';

/**
 * Hero3D — the Agency Admin dashboard scene (react-three-fiber).
 * A glossy faceted gem, a knot, a stack of "document" discs and a small orbit of spheres.
 * Drag to rotate; it also turns slowly on its own. Zoom and pan are off so the page still scrolls.
 */

const Glossy = ({ color, ...p }) => (
  <meshPhysicalMaterial color={color} roughness={0.22} metalness={0.05} clearcoat={1} clearcoatRoughness={0.12} {...p} />
);

function Orbiters() {
  const g = useRef();
  useFrame((_, dt) => { if (g.current) g.current.rotation.y += dt * 0.6; });
  const dots = [
    { a: 0,   r: 2.5, y: 0.5,  s: 0.16, c: '#fbbf24' },
    { a: 1.4, r: 2.3, y: -0.3, s: 0.12, c: '#4a82ee' },
    { a: 2.7, r: 2.7, y: 0.9,  s: 0.2,  c: '#f472b6' },
    { a: 4.1, r: 2.4, y: -0.8, s: 0.14, c: '#34d399' },
    { a: 5.3, r: 2.6, y: 0.1,  s: 0.1,  c: '#ffffff' },
  ];
  return (
    <group ref={g}>
      {dots.map((d) => (
        <mesh key={d.a} position={[Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r]}>
          <sphereGeometry args={[d.s, 32, 32]} />
          <Glossy color={d.c} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 5]} intensity={2.4} />
      <directionalLight position={[-5, -2, -3]} intensity={0.7} color="#9cc2ff" />
      <pointLight position={[0, 2, 4]} intensity={18} color="#ffffff" />

      <Float speed={1.4} rotationIntensity={0.7} floatIntensity={1.1}>
        <mesh position={[0.2, 0.25, 0]}>
          <icosahedronGeometry args={[1.2, 0]} />
          <Glossy color="#3b72e6" flatShading />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.4}>
        <mesh position={[-1.9, 0.9, 0.4]} scale={0.5}>
          <torusKnotGeometry args={[0.8, 0.26, 128, 24]} />
          <Glossy color="#8a63f0" />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0.9} floatIntensity={1.2}>
        <group position={[1.9, -0.55, 0.5]} rotation={[0.35, 0.5, 0.15]}>
          <RoundedBox args={[1.1, 0.16, 1.4]} radius={0.06} position={[0, 0.0, 0]}><Glossy color="#34d399" /></RoundedBox>
          <RoundedBox args={[1.1, 0.16, 1.4]} radius={0.06} position={[0, 0.26, 0]}><Glossy color="#ffffff" /></RoundedBox>
          <RoundedBox args={[1.1, 0.16, 1.4]} radius={0.06} position={[0, 0.52, 0]}><Glossy color="#fbbf24" /></RoundedBox>
        </group>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.6}>
        <mesh position={[-1.3, -1.25, 0.6]} rotation={[0.4, 0.2, 0.6]}>
          <capsuleGeometry args={[0.2, 0.7, 12, 24]} />
          <Glossy color="#f472b6" />
        </mesh>
      </Float>

      <Orbiters />
      <ContactShadows position={[0, -2.1, 0]} opacity={0.28} scale={9} blur={2.6} far={4} color="#3a4a8c" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.1} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
    </>
  );
}

export default function Hero3D() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.4, 7.4], fov: 38 }} gl={{ alpha: true, antialias: true }} style={{ touchAction: 'pan-y' }}>
      <Scene />
    </Canvas>
  );
}
