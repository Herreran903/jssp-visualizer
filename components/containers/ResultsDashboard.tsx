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

  const summarize = (env: any | null) => {
    if (!env?.solution) return null;
    const s = env.solution;
    const makespan = s.makespan || 0;
    const ops = s.operations || [];
    const machines = s.machines || [];
    const stats = s.stats || {};
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
      tardinessTotal: Number(
        (stats.w ?? stats.tardanza ?? stats.tardiness ?? 0) as number
      ),
      operations: ops.length,
      machines: machines.length,
      violations: Number((stats.violations ?? 0) as number),
      utilPerMachine,
      stats,
    };
  };

  const sumA = useMemo(() => summarize(lastRun), [lastRun]);
  const sumB = useMemo(() => summarize(prevRun), [prevRun]);
  const canCompare = Boolean(prevRun?.solution);

  const chartData = useMemo(() => {
    if (!current?.solution) return [];

    const { stats = {}, makespan } = current.solution;
    const data: { name: string; value: number }[] = [];

    Object.entries(stats).forEach(([key, rawValue]) => {
      const value = Number(rawValue ?? 0);

      if (key === "w") {
        // mostrar "peso" en vez de "w"
        data.push({ name: "peso", value });
      } else if (key === "tardanza" || key === "tardiness") {
        // mostrar "tiempo total" y usar el makespan
        data.push({
          name: "tiempo total",
          value: typeof makespan === "number" ? makespan : 0,
        });
      } else {
        // el resto igual
        data.push({ name: key, value });
      }
    });

    return data;
  }, [current]);

  // Help text for metrics (tooltips)
  const helpMap = useMemo(() => {
    const map: Record<string, string> = {
      "peso": "Suma de pesos usada por la función objetivo de tardanza ponderada.",
      "tiempo total": "Duración total del cronograma (makespan).",
    };
    const st = current?.solution?.stats || {};
    if ("maint_windows" in st) map["maint_windows"] = "Número de ventanas de mantenimiento consideradas.";
    if ("maint_time" in st) map["maint_time"] = "Tiempo total empleado en mantenimiento.";
    if ("violations" in st) map["violations"] = "Número de restricciones incumplidas por la solución.";
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

    const modelId = meta.modelId ?? ""; // 'jssp_maint' o 'tardanza_ponderada'
    const strategy = meta.strategy ?? "";
    const makespan = lastRun.solution.makespan ?? "";
    const elapsedMs = meta.elapsedMs ?? "";
    const timeLimitMs =
      typeof meta.timeLimit === "number"
        ? meta.timeLimit
        : typeof meta.timeLimit === "string"
        ? Number(meta.timeLimit)
        : "";
    const timestamp = meta.timestamp ?? "";

    // ==== métricas según el modelo ====
    let extraStatLines: string[] = [];

    if (modelId === "tardanza_ponderada") {
      const w = (stats.w ?? stats.tardanza ?? stats.tardiness ?? "") as
        | number
        | string;
      const tardanza = (stats.tardanza ?? stats.tardiness ?? "") as
        | number
        | string;

      extraStatLines = [
        ["# w", w].join(SEP),
        ["# tardanza", tardanza].join(SEP),
      ];
    } else if (modelId === "jssp_maint") {
      const maintWindows = stats.maint_windows ?? "";
      const maintTime = stats.maint_time ?? "";

      extraStatLines = [
        ["# maint_windows", maintWindows].join(SEP),
        ["# maint_time", maintTime].join(SEP),
      ];
    } else {
      // modelo genérico: volcamos todas las stats que haya
      extraStatLines = Object.entries(stats).map(([k, v]) =>
        [`# ${k}`, v ?? ""].join(SEP)
      );
    }

    // ==== líneas de meta comunes ====
    const metaLines = [
      ["# strategy", strategy].join(SEP),
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
              <div className="text-sm">{meta.timestamp || "—"}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-700 uppercase">
                Estrategia
              </div>
              <div className="text-sm">{meta.strategy || "—"}</div>
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
                Tiempo/Seed
              </div>
              <div className="text-sm">
                {typeof meta.elapsedMs === "number"
                  ? `${meta.elapsedMs} ms`
                  : "—"}
                {typeof timeLimitMs === "number"
                  ? ` / límite ${timeLimitMs} ms`
                  : ""}
                {typeof meta.seed === "number" ? ` · seed ${meta.seed}` : ""}
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
        {compare && lastRun?.solution && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-700 border-b border-dashed border-black/10">
                <tr>
                  <th className="px-3 py-2 font-semibold">Métrica</th>
                  <th className="px-3 py-2 font-semibold">Última</th>
                  <th className="px-3 py-2 font-semibold">Anterior</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title="Tiempo total para completar todos los trabajos (longitud del cronograma).">Makespan</td>
                  <td className="px-3 py-2">{sumA?.makespan ?? "—"}</td>
                  <td className="px-3 py-2">{sumB?.makespan ?? "—"}</td>
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title="Suma de tardanzas ponderadas o no, según el modelo.">Tardiness total</td>
                  <td className="px-3 py-2">{sumA?.tardinessTotal ?? "—"}</td>
                  <td className="px-3 py-2">{sumB?.tardinessTotal ?? "—"}</td>
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title="Cantidad de operaciones programadas.">#Operaciones</td>
                  <td className="px-3 py-2">{sumA?.operations ?? "—"}</td>
                  <td className="px-3 py-2">{sumB?.operations ?? "—"}</td>
                </tr>
                <tr className="border-b border-dashed border-black/10">
                  <td className="px-3 py-2" title="Número de restricciones incumplidas por la solución.">#Violaciones</td>
                  <td className="px-3 py-2">{sumA?.violations ?? "—"}</td>
                  <td className="px-3 py-2">{sumB?.violations ?? "—"}</td>
                </tr>
                <tr className="border-b border-dashed border-black/10 align-top">
                  <td className="px-3 py-2" title="Proporción del tiempo activo de cada máquina respecto al makespan.">Utilización por máquina</td>
                  <td className="px-3 py-2">
                    {sumA?.utilPerMachine
                      ? Object.entries(sumA.utilPerMachine).map(([m, v]) => (
                          <span key={m} className="mr-3">
                            {m}: {v}
                          </span>
                        ))
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {sumB?.utilPerMachine
                      ? Object.entries(sumB.utilPerMachine).map(([m, v]) => (
                          <span key={m} className="mr-3">
                            {m}: {v}
                          </span>
                        ))
                      : "—"}
                  </td>
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
              help="Tiempo total para completar todos los trabajos (longitud del cronograma)."
            />
            <Stat
              label="Ops"
              value={current.solution.operations.length}
              help="Cantidad de operaciones programadas en la solución."
            />
            <Stat
              label="Máquinas"
              value={current.solution.machines.length}
              help="Cantidad de recursos/máquinas usadas en la instancia."
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
