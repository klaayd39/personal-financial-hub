import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ShieldCheck, Lock } from 'lucide-react';

function CreditCardMesh({ isReducedMotion }: { isReducedMotion: boolean }) {
  const cardGroupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!isReducedMotion && cardGroupRef.current) {
      const targetX = (state.pointer.y * Math.PI) / 6;
      const targetY = (state.pointer.x * Math.PI) / 6;
      cardGroupRef.current.rotation.x = THREE.MathUtils.lerp(cardGroupRef.current.rotation.x, targetX, 0.06);
      cardGroupRef.current.rotation.y = THREE.MathUtils.lerp(cardGroupRef.current.rotation.y, targetY, 0.06);
    }
  });

  return (
    <Float speed={isReducedMotion ? 0 : 2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={cardGroupRef}>
        {/* Main Metallic/Glass Card Body */}
        <RoundedBox args={[3.2, 2.0, 0.1]} radius={0.12} smoothness={8}>
          <meshPhysicalMaterial
            color="#1e1b4b"
            metalness={0.8}
            roughness={0.15}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
            emissive="#312e81"
            emissiveIntensity={0.2}
          />
        </RoundedBox>

        {/* Golden Metallic Smart Chip */}
        <mesh position={[-0.9, 0.2, 0.06]}>
          <boxGeometry args={[0.5, 0.4, 0.02]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Embossed Card Accent Strips */}
        <mesh position={[0.6, -0.4, 0.06]}>
          <boxGeometry args={[1.4, 0.12, 0.01]} />
          <meshStandardMaterial color="#6366f1" emissive="#818cf8" emissiveIntensity={0.6} />
        </mesh>

        <mesh position={[0.6, -0.65, 0.06]}>
          <boxGeometry args={[1.0, 0.08, 0.01]} />
          <meshStandardMaterial color="#38bdf8" emissive="#7dd3fc" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

function CardScene({ isReducedMotion }: { isReducedMotion: boolean }) {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 4]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-4, 2, 2]} intensity={2.0} color="#818cf8" />
      <pointLight position={[3, -3, 3]} intensity={1.5} color="#38bdf8" />
      <CreditCardMesh isReducedMotion={isReducedMotion} />
    </>
  );
}

const Fallback2DCard: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl border border-indigo-500/20 shadow-2xl text-white">
    <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center mb-4 text-indigo-300">
      <ShieldCheck className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-white tracking-tight">Personal Financial Hub</h3>
    <p className="text-xs text-indigo-200/80 mt-1 text-center max-w-xs">
      Encrypted & real-time personal finance manager
    </p>
  </div>
);

export const AuthHero3D: React.FC = () => {
  const isReducedMotion = useReducedMotion();

  return (
    <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden h-[540px]">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          Bank-Grade Encryption
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
          Master Your Money <br /> With Confidence
        </h1>
        <p className="text-sm text-slate-300 max-w-sm">
          Track expenses, monitor savings, and hit your financial goals effortlessly.
        </p>
      </div>

      {/* 3D Interactive Canvas */}
      <div className="relative w-full flex-1 my-2">
        <CanvasErrorBoundary fallback={<Fallback2DCard />}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 4.8], fov: 45 }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            aria-label="Interactive 3D Glass Credit Card floating in space"
          >
            <CardScene isReducedMotion={isReducedMotion} />
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
        <span>© {new Date().getFullYear()} Personal Financial Hub</span>
        <span className="text-indigo-400 font-medium">3D Interactive UI</span>
      </div>
    </div>
  );
};
