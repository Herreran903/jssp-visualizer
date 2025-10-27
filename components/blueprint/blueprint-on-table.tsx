// src/components/scene/BlueprintOnTable.tsx
"use client";

import { Html } from "@react-three/drei";
import { BlueprintUI } from "./blueprint-ui";

interface BlueprintProps {
  isSolved: boolean;
  setIsSolved: (value: boolean) => void;
}

export function BlueprintOnTable({ isSolved, setIsSolved }: BlueprintProps) {
  const planeWidth = 9;
  const planeHeight = 5.5;

  return (
    <mesh position={[-2, 2.5, -2]} rotation={[-Math.PI / 5, 0, 0]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshStandardMaterial color="red" visible={false} />

      <Html center transform wrapperClass="html-container" scale={0.45}>
        <BlueprintUI isSolved={isSolved} setIsSolved={setIsSolved} />
      </Html>
    </mesh>
  );
}
