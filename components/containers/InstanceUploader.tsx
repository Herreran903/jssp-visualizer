"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import FileDrop from "../ui/FileDrop";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Select from "../ui/Select";
import useInstances from "../../hooks/useInstances";
import type { ProblemType } from "../../types/domain";

export default function InstanceUploader() {
  const router = useRouter();
  const { uploadInstance, importInstance, loading } = useInstances();
  const [file, setFile] = useState<File | null>(null);
  const [problemType, setProblemType] = useState<ProblemType>("jssp_maint");
  const [validationStatus, setValidationStatus] = useState<{
    validated: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const tardanzaGuide = `jobs       = Número entero;
tasks      = Número entero;

d          = array2d(1..jobs, 1..tasks, [ enteros ]);
weights    = array[1..jobs] of int;
due_dates  = array[1..jobs] of int;`;

  const tardanzaExample = `jobs = 5;
tasks = 5;

d = array2d(1..5, 1..5, [
  1, 4, 5, 3, 6,
  3, 2, 7, 1, 2,
  4, 4, 4, 4, 4,
  1, 1, 1, 6, 8,
  7, 3, 2, 2, 1
]);

weights   = [7, 2, 3, 2, 1];
due_dates = [5, 8, 2, 3, 4];`;

  const maintGuide = `JOBS   = Número entero;
TASKS  = Número entero;

PROC_TIME       = array2d(1..JOBS, 1..TASKS, [ enteros ]);
MAX_MAINT_WINDOWS = Número entero;

MAINT_START  = array2d(1..num_machines, 1..MAX_MAINT_WINDOWS, [ enteros ]);
MAINT_END    = array2d(1..num_machines, 1..MAX_MAINT_WINDOWS, [ enteros ]);
MAINT_ACTIVE = array2d(1..num_machines, 1..MAX_MAINT_WINDOWS, [ bool ]);`;

  const maintExample = `JOBS  = 4;
TASKS = 3;

PROC_TIME = array2d(1..4, 1..3, [
  5, 3, 4,  
  2, 6, 3,  
  5, 3, 4,  
  3, 4, 5   
]);

MAX_MAINT_WINDOWS = 1;

MAINT_START = array2d(1..3, 1..1, [
  0,   
  8,   
  0   
]);

MAINT_END = array2d(1..3, 1..1, [
  0,   
  11,  
  0    
]);

MAINT_ACTIVE = array2d(1..3, 1..1, [
  false, 
  true,  
  false  
]);`;

  async function handleFileSelect(files: File[]) {
    const selectedFile = files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationStatus(null);
    setUploadSuccess(null);

    if (selectedFile.name.endsWith(".dzn")) {
      const metaFile = files.find((f) => f.name.endsWith(".meta.json"));

      if (metaFile) {
        try {
          const id = await importInstance(selectedFile, metaFile);
          setUploadSuccess(`Instancia importada exitosamente! ID: ${id}`);
          setFile(null);

          router.refresh(); // 👈 también aquí, para que aparezca la nueva instancia
        } catch (error) {
          setValidationStatus({
            validated: false,
            errors: [
              error instanceof Error ? error.message : "Error al importar",
            ],
            warnings: [],
          });
        }
        return;
      }
      try {
        const content = await selectedFile.text();
        const { parseDZN } = await import("../../lib/dzn-parser");
        const result = parseDZN(content, problemType);

        setValidationStatus({
          validated: result.metadata.validated || false,
          errors: result.errors,
          warnings: result.warnings,
        });
      } catch (error) {
        setValidationStatus({
          validated: false,
          errors: ["Error al leer el archivo"],
          warnings: [],
        });
      }
    } else {
      setValidationStatus({
        validated: false,
        errors: ["Por favor selecciona un archivo .dzn"],
        warnings: [],
      });
    }
  }

  async function doUpload() {
    if (!file) return;
    setUploadSuccess(null);

    try {
      const id = await uploadInstance(file, problemType);
      setUploadSuccess(`Instancia subida exitosamente! ID: ${id}`);
      setFile(null);
      setValidationStatus(null);

      router.refresh(); // 👈 fuerza a recargar el listado de instancias
    } catch (error) {
      setValidationStatus({
        validated: false,
        errors: [error instanceof Error ? error.message : "Error al subir"],
        warnings: [],
      });
    }
  }

  return (
    <Card className="space-y-4 font-hand">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5" />
        <div className="text-xl font-bold uppercase">
          Subir / Importar Instancia
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs text-slate-700 font-hand uppercase">
          Tipo de Problema
        </div>
        <Select
          value={problemType}
          onChange={(e) => setProblemType(e.target.value as ProblemType)}
          disabled={loading}
        >
          <option value="jssp_maint">JSSP con Mantenimiento</option>
          <option value="tardanza_ponderada">Tardanza Ponderada</option>
        </Select>
        {/* Guía de formato del archivo */}
        <div className="mt-6">
          {" "}
          {/* MÁS ESPACIO DESDE EL SELECT */}
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm text-slate-700 font-hand uppercase tracking-wide">
              Guia de formato del archivo
            </span>

            {/* Switch */}
            <button
              type="button"
              onClick={() => setShowGuide((prev) => !prev)}
              className={[
                "relative inline-flex h-5 w-10 items-center rounded-full border transition-colors",
                showGuide
                  ? "bg-slate-800 border-slate-800"
                  : "bg-slate-300 border-slate-400",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                  showGuide ? "translate-x-5" : "translate-x-1",
                ].join(" ")}
              />
            </button>
          </div>
          {showGuide && (
            <div className="space-y-4">
              {/* Estructura general */}
              <div className="rounded border border-slate-300 bg-slate-50 px-4 py-3">
                <pre className="text-[13px] leading-relaxed font-mono text-slate-800">
                  <code>
                    {problemType === "tardanza_ponderada"
                      ? tardanzaGuide
                      : maintGuide}
                  </code>
                </pre>
              </div>

              <div className="text-xs text-slate-700 font-hand uppercase tracking-wide">
                Ejemplo
              </div>

              <div className="rounded border border-slate-300 bg-slate-50 px-4 py-3">
                <pre className="text-[13px] leading-relaxed font-mono text-slate-800">
                  <code>
                    {problemType === "tardanza_ponderada"
                      ? tardanzaExample
                      : maintExample}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-slate-700 font-hand uppercase">
          Archivo DZN{" "}
          {file && (
            <span className="text-slate-500">
              (arrastra .meta.json para importar)
            </span>
          )}
        </div>
        <FileDrop onFiles={handleFileSelect} accept=".dzn,.json" multiple />

        {file && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-700 font-hand uppercase">
              <span>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </span>
              <Button onClick={doUpload} disabled={loading}>
                {loading ? "Subiendo..." : "Subir"}
              </Button>
            </div>
            {validationStatus && (
              <div className="p-3 rounded border text-sm font-hand">
                {validationStatus.validated ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validación exitosa</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-4 h-4" />
                    <span>Errores de validación</span>
                  </div>
                )}

                {validationStatus.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="font-bold text-red-700 uppercase">
                      Errores:
                    </div>
                    {validationStatus.errors.map((err, i) => (
                      <div
                        key={i}
                        className="text-red-600 text-xs flex items-start gap-1"
                      >
                        <span>•</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                {validationStatus.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-yellow-700 uppercase">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Advertencias:</span>
                    </div>
                    {validationStatus.warnings.map((warn, i) => (
                      <div
                        key={i}
                        className="text-yellow-600 text-xs flex items-start gap-1"
                      >
                        <span>•</span>
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3 rounded border border-green-500 bg-green-50 text-green-700 text-sm font-hand flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>

      <div className="pt-2 text-xs text-slate-500 font-hand">
        <strong>Tip:</strong> Arrastra un archivo .dzn para subir, o arrastra
        .dzn + .meta.json juntos para importar
      </div>
    </Card>
  );
}
