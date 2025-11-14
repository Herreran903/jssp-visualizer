"use client";
import { Play } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Select from "../ui/Select";
import useInstances from "../../hooks/useInstances";
import useOneShot from "../../hooks/useOneShot";
import useRunStore from "../../hooks/useRunStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SolverConfig } from "../../types/domain";

export default function RunLauncher() {
  const router = useRouter();
  const { setRun } = useRunStore();
  const { instances, getContent } = useInstances();
  const { runOnce, loading } = useOneShot();
  const [instanceId, setInstanceId] = useState("");
  const [solverConfig, setSolverConfig] = useState<SolverConfig | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("jssp:solverConfig");
    if (saved) {
      try {
        setSolverConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading solver config:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (instances.length && !instanceId) setInstanceId(instances[0].id);
  }, [instances, instanceId]);

  async function onRun() {
    if (!instanceId || !solverConfig) {
      alert("Por favor configura el solver en la página de Configuración");
      return;
    }

    const inst = instances.find((i) => i.id === instanceId);
    if (!inst) {
      alert("Instancia no encontrada");
      return;
    }

    let effectiveSolverConfig: SolverConfig = solverConfig;

    if (inst.problemType !== solverConfig.problemType) {
      const confirm = window.confirm(
        `La instancia es de tipo "${inst.problemType}" pero el solver está configurado para "${solverConfig.problemType}". ` +
          `Si continúas, se usará el tipo de la instancia ("${inst.problemType}") en la ejecución. ¿Continuar?`
      );
      if (!confirm) return;

      effectiveSolverConfig = {
        ...solverConfig,
        problemType: inst.problemType,
      };
    }

    const content = await getContent(instanceId);
    if (!content) {
      alert("No se pudo cargar el contenido de la instancia");
      return;
    }

    const file = new File([content], `${inst.name}.dzn`, {
      type: "text/plain",
    });

    try {
      const result = await runOnce({
        file,
        instanceId,
        instanceName: inst.name,
        solverConfig: effectiveSolverConfig,
      });
      setRun(result);
      router.replace("/results");
    } catch (error) {
      alert(
        `Error al ejecutar: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  const selectedInstance = instances.find((i) => i.id === instanceId);

  return (
    <Card className="space-y-3 font-hand">
      <div className="flex items-center gap-2">
        <Play className="w-5 h-5" />
        <div className="text-xl font-bold uppercase">Ejecutar</div>
      </div>

      {!solverConfig && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ No hay configuración del solver. Ve a <strong>Configurar</strong>{" "}
          para establecer los parámetros.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div>
          <div className="mb-1 text-xs text-slate-700 font-hand uppercase">
            Instancia
          </div>
          <Select
            value={instanceId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setInstanceId(e.target.value)
            }
            disabled={loading || instances.length === 0}
          >
            {instances.length === 0 ? (
              <option value="">No hay instancias disponibles</option>
            ) : (
              instances.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.problemType})
                </option>
              ))
            )}
          </Select>
          {selectedInstance && (
            <div className="mt-1 text-xs text-slate-500">
              {selectedInstance.jobs} jobs × {selectedInstance.machines}{" "}
              máquinas = {selectedInstance.operations} ops
            </div>
          )}
        </div>

        {solverConfig && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
            <div className="font-bold uppercase mb-1">
              Configuración del Solver:
            </div>
            <div className="space-y-1 text-slate-700">
              <div>
                • Tipo:{" "}
                <span className="font-mono">{solverConfig.problemType}</span>
              </div>
              <div>
                • Solver:{" "}
                <span className="font-mono">{solverConfig.solver}</span>
              </div>
              <div>
                • Búsqueda:{" "}
                <span className="font-mono">
                  {solverConfig.searchHeuristic}
                </span>
              </div>
              <div>
                • Valor:{" "}
                <span className="font-mono">{solverConfig.valueChoice}</span>
              </div>
              <div>
                • Límites: {solverConfig.timeLimitSec}s,{" "}
                {solverConfig.maxSolutions} sol
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onRun}
            disabled={
              loading || !instanceId || !solverConfig || instances.length === 0
            }
            className="flex-1"
          >
            {loading ? "Ejecutando..." : "Ejecutar Solver"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
