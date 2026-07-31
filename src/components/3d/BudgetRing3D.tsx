import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface BudgetRingProps {
  usedPct: number;
  isOverBudget: boolean;
}

function TorusRingMesh({ usedPct, isOverBudget, isReducedMotion }: BudgetRingProps & { isReducedMotion: boolean }) {
  const torusRef = useRef<THREE.Mesh>(null!);

  const primaryColor = isOverBudget
    ? '#f43f5e'
    : usedPct > 80
    ? '#f59e0b'
    : '#22c55e';

  useFrame((state, delta) => {
    if (!isReducedMotion && torusRef.current) {
      torusRef.current.rotation.x = state.pointer.y * 0.4;
      torusRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <mesh ref={torusRef}>
      <torusGeometry args={[1.1, 0.32, 32, 64]} />
      <meshStandardMaterial
        color={primaryColor}
        metalness={0.7}
        roughness={0.25}
        emissive={primaryColor}
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

function RingScene({ usedPct, isOverBudget, isReducedMotion }: BudgetRingProps & { isReducedMotion: boolean }) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 3]} intensity={2.0} color="#ffffff" />
      <pointLight position={[-2, -2, 2]} intensity={1.0} color="#ffffff" />
      <TorusRingMesh usedPct={usedPct} isOverBudget={isOverBudget} isReducedMotion={isReducedMotion} />
    </>
  );
}

const Fallback2DRing: React.FC<BudgetRingProps> = ({ usedPct, isOverBudget }) => (
  <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-[10px]"
       style={{ borderColor: isOverBudget ? '#f43f5e' : usedPct > 80 ? '#f59e0b' : '#22c55e' }}>
    {usedPct.toFixed(0)}%
  </div>
);

export const BudgetRing3D: React.FC<BudgetRingProps> = ({ usedPct, isOverBudget }) => {
  const isReducedMotion = useReducedMotion();

  return (
    <div className="w-14 h-14 relative shrink-0">
      <CanvasErrorBoundary fallback={<Fallback2DRing usedPct={usedPct} isOverBudget={isOverBudget} />}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          className="w-full h-full cursor-pointer"
          aria-label="3D Budget Health Ring Indicator"
        >
          <RingScene usedPct={usedPct} isOverBudget={isOverBudget} isReducedMotion={isReducedMotion} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};
