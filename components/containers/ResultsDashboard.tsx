"use client";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Stat from "../ui/Stat";
import GanttMini from "../ui/GanttMini";
import Chart from "../ui/Chart";
import useRunStore from "../../hooks/useRunStore";
import { useEffect, useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import { jsspResultToCSV } from "../../lib/jssp-result-to-csv";
import { formatDateTime } from "../../lib/formatting";

export default function ResultsDashboard() {
  const router = useRouter();
  const { lastRun, prevRun } = useRunStore();
  const [compare, setCompare] = useState(false);
  const [view, setView] = useState<"A" | "B">("A");
  const ganttRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lastRun) router.replace("/run");
  }, [lastRun, router]);

  const current = view === "A" ? lastRun : prevRun;

  // Unified metric structure for both models
  const summarize = (env: any | null) => {
    if (!env?.solution) return null;
    const s = env.solution;
    const makespan = s.makespan || 0;
    const ops = s.operations || [];
    const machines = s.machines || [];
    const stats = s.stats || {};
    const modelId = env.meta?.modelId || "";
    // Round elapsedMs to 1 decimal place
    const elapsedMs = env.meta?.elapsedMs !== null && env.meta?.elapsedMs !== undefined
      ? Math.round(env.meta.elapsedMs * 10) / 10
      : null;

    // Calculate machine utilization
    const durationsByMachine = new Map<string, number>();
    for (const op of ops) {
      durationsByMachine.set(
        op.machineId,
        (durationsByMachine.get(op.machineId) || 0) + (op.duration || 0)
      );
    }
    const utilPerMachine: Record<string, number> = {};
    for (const m of machines) {
      const dur = durationsByMachine.get(m.id) || 0;
      utilPerMachine[m.id] = makespan > 0 ? +(dur / makespan).toFixed(3) : 0;
    }

    return {
      makespan,
      operations: ops.length,
      machines: machines.length,
      utilPerMachine,
      elapsedMs,
      // Tardanza model metrics
      w: stats.w ?? null,
      tardanza_total: stats.tardanza ?? stats.tardiness ?? null,
      jobs_tardios: stats.jobs_tardios ?? null,
      max_tardanza: stats.max_tardanza ?? null,
      // Maintenance model metrics
      maint_windows: stats.maint_windows ?? null,
      maint_time: stats.maint_time ?? null,
      modelId,
    };
  };

  const sumA = useMemo(() => summarize(lastRun), [lastRun]);
  const sumB = useMemo(() => summarize(prevRun), [prevRun]);
  const canCompare = Boolean(prevRun?.solution);

  // Tooltip definitions for all metrics
  const metricTooltips: Record<string, string> = {
    makespan: "Tiempo total del cronograma (duración desde el inicio hasta que termina la última operación)",
    operations: "Número total de operaciones programadas en la solución",
    machines: "Número de máquinas/recursos disponibles en la instancia",
    utilPerMachine: "Proporción del makespan en que cada máquina está ejecutando operaciones (suma de duraciones / makespan)",
    elapsedMs: "Tiempo de ejecución real del solver en milisegundos",
    w: "Tardanza ponderada total (suma de tardanzas multiplicadas por sus pesos)",
    tardanza_total: "Suma de tardanzas sin pesos (tiempo que cada trabajo excede su due date)",
    jobs_tardios: "Cantidad de trabajos que terminan después de su due date",
    max_tardanza: "Mayor tardanza individual entre todos los trabajos",
    maint_windows: "Cantidad de ventanas de mantenimiento activas en el cronograma",
    maint_time: "Suma de tiempo bloqueado por mantenimiento (tiempo total no productivo)",
  };

  // Chart data with proper metric names
  const chartData = useMemo(() => {
    if (!current?.solution) return [];

    const { stats = {} } = current.solution;
    const data: { name: string; value: number }[] = [];

    // Add metrics based on what's available in stats
    Object.entries(stats).forEach(([key, rawValue]) => {
      const value = Number(rawValue ?? 0);
      data.push({ name: key, value });
    });

    return data;
  }, [current]);

  // Help map for chart tooltips
  const helpMap = useMemo(() => {
    const map: Record<string, string> = {};
    const st = current?.solution?.stats || {};
    
    Object.keys(st).forEach((key) => {
      if (metricTooltips[key]) {
        map[key] = metricTooltips[key];
      }
    });

    return map;
  }, [current]);

  // Actions

  async function copyJSON() {
    if (!lastRun) return;
    await navigator.clipboard.writeText(JSON.stringify(lastRun, null, 2));
  }

  function printPDF() {
    if (typeof window === "undefined") return;
    window.print();
  }

  function exportJSON() {
    if (!lastRun) return;
    const blob = new Blob([JSON.stringify(lastRun, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jssp-results-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function printGantt() {
    console.log("[printGantt] click"); // 👈 para ver si entra

    if (!ganttRef.current) {
      console.error("[printGantt] ganttRef.current es null");
      return;
    }

    try {
      console.log("[printGantt] capturando con html2canvas...");
      const canvas = await html2canvas(ganttRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");

      const meta = lastRun?.meta || {};
      const title = meta.instanceName || meta.instanceId || "Gantt";

      const printWindow = window.open("", "_blank", "width=1200,height=800");
      if (!printWindow) {
        console.error(
          "[printGantt] popup bloqueado o window.open devolvió null"
        );
        return;
      }

      const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              background: #ffffff;
            }
            h1 {
              font-size: 18px;
              margin: 0 0 12px 0;
              text-transform: uppercase;
              font-weight: 700;
            }
            .gantt-img-wrapper {
              max-width: 1100px;
              margin: 0 auto;
              border: 1px solid #ddd;
              padding: 8px;
            }
            img {
              width: 100%;
              height: auto;
              display: block;
            }
          </style>
        </head>
        <body>
          <h1>${title} – Gantt</h1>
          <div class="gantt-img-wrapper">
            <img id="gantt-img" src="${imgData}" />
          </div>
          <script>
            window.onload = function () {
              var img = document.getElementById("gantt-img");
              if (img && !img.complete) {
                img.onload = function () {
                  window.focus();
                  window.print();
                };
              } else {
                window.focus();
                window.print();
              }
            };
          <\/script>
        </body>
      </html>
    `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      console.log("[printGantt] ventana de impresión creada");
    } catch (err) {
      console.error("[printGantt] error:", err);
    }
  }

  function exportCSV() {
    if (!lastRun?.solution) return;

    const ops = lastRun.solution.operations || [];
    if (!ops.length) return;

    const SEP = ","; // coma para que Excel lo abra en columnas

    const meta = lastRun.meta || {};
    const stats = lastRun.solution.stats || {};

    const modelId = meta.modelId ?? "";
    const searchHeuristic = meta.searchHeuristic ?? "";
    const valueChoice = meta.valueChoice ?? "";
    const solver = meta.variation ?? "";
    const makespan = lastRun.solution.makespan ?? "";
    const elapsedMs = typeof meta.elapsedMs === "number"
      ? Math.round(meta.elapsedMs * 10) / 10
      : "";
    const timeLimitMs =
      typeof meta.timeLimit === "number"
        ? meta.timeLimit
        : typeof meta.timeLimit === "string"
        ? Number(meta.timeLimit)
        : "";
    const timestamp = meta.timestamp ?? "";

    // ==== métricas según el modelo ====
    let extraStatLines: string[] = [];

    if (modelId === "JOBSHOP_TARDANZA" || modelId === "tardanza_ponderada") {
      extraStatLines = [
        ["# w", stats.w ?? ""].join(SEP),
        ["# tardanza_total", stats.tardanza ?? stats.tardiness ?? ""].join(SEP),
        ["# jobs_tardios", stats.jobs_tardios ?? ""].join(SEP),
        ["# max_tardanza", stats.max_tardanza ?? ""].join(SEP),
      ];
    } else if (modelId === "JOBSHOP_MANTENIMIENTO" || modelId === "jssp_maint") {
      extraStatLines = [
        ["# maint_windows", stats.maint_windows ?? ""].join(SEP),
        ["# maint_time", stats.maint_time ?? ""].join(SEP),
      ];
    } else {
      // modelo genérico: volcamos todas las stats que haya
      extraStatLines = Object.entries(stats).map(([k, v]) =>
        [`# ${k}`, v ?? ""].join(SEP)
      );
    }

    // ==== líneas de meta comunes ====
    const metaLines = [
      ["# model_id", modelId].join(SEP),
      ["# solver", solver].join(SEP),
      ["# search_heuristic", searchHeuristic].join(SEP),
      ["# value_choice", valueChoice].join(SEP),
      ["# makespan", makespan].join(SEP),
      ...extraStatLines,
      ["# elapsed_ms", elapsedMs].join(SEP),
      ["# time_limit_ms", timeLimitMs].join(SEP),
      ["# timestamp", timestamp].join(SEP),
    ];

    // ==== header + operaciones ====
    const header = [
      "job_id",
      "machine_id",
      "op_id",
      "start",
      "end",
      "duration",
    ].join(SEP);

    const rows = ops.map((op: any) => {
      const jobId = op.jobId ?? "";
      const machineId = op.machineId ?? "";
      const opId = op.opId ?? op.id ?? `${jobId}-${machineId}`;
      const start = op.start ?? 0;
      const end = op.end ?? start + (op.duration ?? 0);
      const duration = op.duration ?? end - start;

      return [jobId, machineId, opId, start, end, duration].join(SEP);
    });

    // BOM para que Excel detecte UTF-8
    const csv = "\ufeff" + [...metaLines, "", header, ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jssp-results-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const meta = lastRun?.meta || {};
  const instanceLabel = meta.instanceName || meta.instanceId || "—";
  const jmLabel =
    meta.jobs && meta.machines ? `${meta.jobs} × ${meta.machines}` : "—";
  const timeLimitMs =
    typeof meta.timeLimit === "number"
      ? meta.timeLimit
      : meta.timeLimit && typeof meta.timeLimit === "string"
      ? Number(meta.timeLimit)
      : undefined;

  return (
    <div className="space-y-6 font-hand uppercase text-slate-800 print-page">
      {lastRun?.solution && (
        <Card className="space-y-3 font-hand">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xl font-bold uppercase">Ejecución</div>
            <div className="flex gap-2 no-print">
              <Button variant="ghost" onClick={exportJSON}>
                exportar JSON
              </Button>
              <Button onClick={exportCSV}>exportar CSV</Button>
              {/* <Button variant="outline" onClick={printGantt}>
                Imprimir Diagrama
              </Button> */}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <div className="mb-1 text-xs text-slate-700 uppercase">
                Instancia
              </div>
              <div className="text-sm">{instanceLabel}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-700 uppercase">
                Jobs × Máquinas
              </div>
              <div className="text-sm">{jmLabel}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-700 uppercase">
                Fecha/Hora
              </div>
              <div className="text-sm">
                {meta.timestamp ? formatDateTime(meta.timestamp) : "—"}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-700 uppercase">
                Heurísticas
              </div>
              <div className="text-sm">
                {meta.searchHeuristic || "—"}
                {meta.valueChoice ? ` · ${meta.valueChoice}` : ""}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-700 uppercase">
                Modelo
              </div>
              <div className="text-sm">
                {meta.modelId || "—"}
                {meta.variation ? ` · ${meta.variation}` : ""}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-700 uppercase">
                Tiempo
              </div>
              <div className="text-sm">
                {typeof meta.elapsedMs === "number"
                  ? `${Math.round(meta.elapsedMs * 10) / 10} ms`
                  : "—"}
                {typeof timeLimitMs === "number"
                  ? ` / límite ${timeLimitMs} ms`
                  : ""}
              </div>
            </div>
          </div>
        </Card>
      )}
      <Card className="space-y-3 font-hand">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold uppercase">Resultados</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-700 font-hand uppercase">
              <input
                type="checkbox"
                className="mr-2 align-middle"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
                disabled={!canCompare}
                title={canCompare ? "" : "Aún no hay ejecución anterior"}
              />
              Comparar con ejecución anterior
            </label>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => setView("A")}
                disabled={view === "A"}
              >
                A
              </Button>
              <Button
                variant="ghost"
                onClick={() => setView("B")}
                disabled={!canCompare || view === "B"}
                title={canCompare ? "" : "Aún no hay ejecución anterior"}
              >
                B
              </Button>
            </div>
          </div>
        </div>
        {lastRun?.solution && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-700 border-b border-dashed border-black/10">
                <tr>
                  <th className="px-3 py-2 font-semibold">Métrica</th>
                  <th className="px-3 py-2 font-semibold">
                    {compare ? "Última" : "Valor"}
                    {compare && sumA?.modelId && (
                      <div className="text-xs font-normal text-slate-600 mt-1">
                        Modelo: {sumA.modelId === "JOBSHOP_MANTENIMIENTO" ? "mantenimiento" : sumA.modelId === "JOBSHOP_TARDANZA" ? "tardanza ponderada" : sumA.modelId}
                      </div>
                    )}
                  </th>
                  {compare && (
                    <th className="px-3 py-2 font-semibold">
                      Anterior
                      {sumB?.modelId && (
                        <div className="text-xs font-normal text-slate-600 mt-1">
                          Modelo: {sumB.modelId === "JOBSHOP_MANTENIMIENTO" ? "mantenimiento" : sumB.modelId === "JOBSHOP_TARDANZA" ? "tardanza ponderada" : sumB.modelId}
                        </div>
                      )}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.makespan}>Makespan</td>
                  <td className="px-3 py-2">{sumA?.makespan ?? "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB?.makespan ?? "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.operations}>#Operaciones</td>
                  <td className="px-3 py-2">{sumA?.operations ?? "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB?.operations ?? "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.machines}>#Máquinas</td>
                  <td className="px-3 py-2">{sumA?.machines ?? "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB?.machines ?? "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.elapsedMs}>Tiempo de ejecución (ms)</td>
                  <td className="px-3 py-2">{sumA && sumA.elapsedMs !== null ? sumA.elapsedMs : "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB && sumB.elapsedMs !== null ? sumB.elapsedMs : "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10 align-top">
                  <td className="px-3 py-2" title={metricTooltips.utilPerMachine}>Utilización por máquina</td>
                  <td className="px-3 py-2">
                    {sumA?.utilPerMachine
                      ? Object.entries(sumA.utilPerMachine).map(([m, v]) => (
                          <span key={m} className="mr-3">
                            {m}: {v}
                          </span>
                        ))
                      : "—"}
                  </td>
                  {compare && (
                    <td className="px-3 py-2">
                      {sumB?.utilPerMachine
                        ? Object.entries(sumB.utilPerMachine).map(([m, v]) => (
                            <span key={m} className="mr-3">
                              {m}: {v}
                            </span>
                          ))
                        : "—"}
                    </td>
                  )}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.w}>Tardanza ponderada (w)</td>
                  <td className="px-3 py-2">{sumA && sumA.w !== null ? sumA.w : "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB && sumB.w !== null ? sumB.w : "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.tardanza_total}>Tardanza total</td>
                  <td className="px-3 py-2">{sumA && sumA.tardanza_total !== null ? sumA.tardanza_total : "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB && sumB.tardanza_total !== null ? sumB.tardanza_total : "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.jobs_tardios}>Jobs tardíos</td>
                  <td className="px-3 py-2">{sumA && sumA.jobs_tardios !== null ? sumA.jobs_tardios : "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB && sumB.jobs_tardios !== null ? sumB.jobs_tardios : "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.max_tardanza}>Tardanza máxima</td>
                  <td className="px-3 py-2">{sumA && sumA.max_tardanza !== null ? sumA.max_tardanza : "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB && sumB.max_tardanza !== null ? sumB.max_tardanza : "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.maint_windows}>Ventanas de mantenimiento</td>
                  <td className="px-3 py-2">{sumA && sumA.maint_windows !== null ? sumA.maint_windows : "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB && sumB.maint_windows !== null ? sumB.maint_windows : "—"}</td>}
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title={metricTooltips.maint_time}>Tiempo de mantenimiento</td>
                  <td className="px-3 py-2">{sumA && sumA.maint_time !== null ? sumA.maint_time : "—"}</td>
                  {compare && <td className="px-3 py-2">{sumB && sumB.maint_time !== null ? sumB.maint_time : "—"}</td>}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {current?.solution && (
        <>
          <Card className="font-hand">
            <div className="mb-3 text-sm text-slate-700 uppercase">Gantt</div>
            <div ref={ganttRef}>
              <GanttMini
                makespan={current.solution.makespan}
                machines={current.solution.machines}
                operations={current.solution.operations}
              />
            </div>
          </Card>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Stat
              label="Makespan"
              value={current.solution.makespan}
              help={metricTooltips.makespan}
            />
            <Stat
              label="Ops"
              value={current.solution.operations.length}
              help={metricTooltips.operations}
            />
            <Stat
              label="Máquinas"
              value={current.solution.machines.length}
              help={metricTooltips.machines}
            />
          </div>
          <Card className="font-hand">
            <div className="mb-3 text-sm text-slate-700 uppercase">
              Métricas
            </div>
            <Chart data={chartData} kind="bar" helpMap={helpMap} />
          </Card>
        </>
      )}
    </div>
  );
}
