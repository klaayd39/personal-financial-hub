import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { formatCurrency } from '../../utils/formatters';
import { PiggyBank, Sparkles } from 'lucide-react';

interface SphereContentProps {
  netSavings: number;
  isReducedMotion: boolean;
}

function FloatingCoin({ position, rotationSpeed, isReducedMotion }: { position: [number, number, number]; rotationSpeed: number; isReducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!isReducedMotion && meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
      meshRef.current.rotation.z += delta * (rotationSpeed * 0.5);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
      <meshStandardMaterial
        color="#f59e0b"
        metalness={0.85}
        roughness={0.2}
        emissive="#fbbf24"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function VaultScene({ netSavings, isReducedMotion }: SphereContentProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const outerSphereRef = useRef<THREE.Mesh>(null!);

  // Generate coin positions inside sphere
  const coins = useMemo(() => {
    const count = Math.min(Math.max(Math.floor(Math.abs(netSavings) / 5000) + 3, 4), 14);
    const items: Array<{ id: number; pos: [number, number, number]; speed: number }> = [];
    for (let i = 0; i < count; i++) {
      const radius = 0.6 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      items.push({
        id: i,
        pos: [x, y, z],
        speed: 0.6 + Math.random() * 0.8,
      });
    }
    return items;
  }, [netSavings]);

  const primaryColor = netSavings >= 0 ? '#8b5cf6' : '#f43f5e';
  const glowColor = netSavings >= 0 ? '#c084fc' : '#fda4af';

  useFrame((state) => {
    if (!isReducedMotion && groupRef.current) {
      // Gentle mouse tracking tilt
      const targetX = (state.pointer.y * Math.PI) / 8;
      const targetY = (state.pointer.x * Math.PI) / 8;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY + state.clock.elapsedTime * 0.1, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-4, -4, -2]} intensity={1.8} color={glowColor} />

      {/* Glass Orb Shell */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[1.45, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.4}
          chromaticAberration={0.06}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          color={primaryColor}
          roughness={0.15}
          transmission={0.92}
          ior={1.2}
        />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh scale={0.75}>
        <icosahedronGeometry args={[0.6, 2]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={primaryColor}
          emissiveIntensity={0.6}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Floating Coins inside Vault */}
      <Float speed={isReducedMotion ? 0 : 1.5} rotationIntensity={0.5} floatIntensity={0.8}>
        {coins.map((c) => (
          <FloatingCoin key={c.id} position={c.pos} rotationSpeed={c.speed} isReducedMotion={isReducedMotion} />
        ))}
      </Float>
    </group>
  );
}

const Fallback2DSavings: React.FC<{ netSavings: number }> = ({ netSavings }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-purple-500/10 rounded-2xl border border-violet-100">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 mb-3">
      <PiggyBank className="w-7 h-7" />
    </div>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vault Balance</p>
    <p className={`text-xl font-bold mt-1 ${netSavings >= 0 ? 'text-violet-700' : 'text-rose-600'}`}>
      {formatCurrency(netSavings)}
    </p>
  </div>
);

export const SavingsVault3D: React.FC<{ netSavings: number }> = ({ netSavings }) => {
  const isReducedMotion = useReducedMotion();

  return (
    <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800/80 flex items-center justify-between px-6 py-4">
      {/* Background Subtle Radial Glow */}
      <div
        className={`absolute inset-0 opacity-30 pointer-events-none transition-colors duration-500 ${
          netSavings >= 0 ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-600/40 via-transparent to-transparent' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-600/40 via-transparent to-transparent'
        }`}
      />

      {/* Info Overlay Column */}
      <div className="relative z-10 max-w-xs space-y-2 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[10px] font-semibold tracking-wide uppercase">
          <Sparkles className="w-3 h-3 text-amber-400" /> 3D Savings Vault
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">Interactive Financial Vault</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Hover and tilt to inspect your interactive savings core. Coins dynamically adjust to reflect your total net deposits.
        </p>
        <div className="pt-1">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Net Balance</span>
          <span className={`text-2xl font-black ${netSavings >= 0 ? 'text-violet-300' : 'text-rose-300'}`}>
            {formatCurrency(netSavings)}
          </span>
        </div>
      </div>

      {/* 3D Canvas Box */}
      <div className="relative w-44 sm:w-56 h-full shrink-0">
        <CanvasErrorBoundary fallback={<Fallback2DSavings netSavings={netSavings} />}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 4.2], fov: 45 }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            aria-label="Interactive 3D Glass Vault containing financial coins"
          >
            <VaultScene netSavings={netSavings} isReducedMotion={isReducedMotion} />
          </Canvas>
        </CanvasErrorBoundary>
      </div>
    </div>
  );
};
