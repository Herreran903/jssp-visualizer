// src/app/page.tsx
"use client";
import { BlueprintOnTable } from "@/components/blueprint/blueprint-on-table";
import DraftingTableModel from "@/components/scene/drafting-table-model";
import SceneContainer from "@/components/scene/scene-container";
import { useState } from "react";

export default function Home() {
  const [isSolved, setIsSolved] = useState(false);

  return (
    <main className="h-screen w-full">
      <SceneContainer isSolved={isSolved}>
        <DraftingTableModel />
        <BlueprintOnTable isSolved={isSolved} setIsSolved={setIsSolved} />
      </SceneContainer>
    </main>
  );
}
