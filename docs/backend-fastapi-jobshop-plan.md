# Plan de implementación Backend FastAPI (jobshop: tardanza y mantenimiento) + Alineación Frontend

Objetivo: Implementar un único endpoint de backend que soporte dos variaciones del modelo "jobshop" y mantener el flujo actual del frontend Next.js sin romper el contrato.

- Endpoint único: POST ${NEXT_PUBLIC_BACKEND_URL}/api/solve-once
- Frontend Next orquesta y añade meta; el backend NUNCA devuelve meta. Ver [`app/api/solve-once/route.ts OR TypeScript.function POST(req: Request)`](app/api/solve-once/route.ts:43).
- Tipos esperados por el front:
  - Envelope: [`types/api.ts OR TypeScript.interface SolutionEnvelope`](types/api.ts:43)
  - Status: [`types/api.ts OR TypeScript.type SolutionStatus`](types/api.ts:25)
  - Solution/Operation/Machine: [`types/solution.ts OR TypeScript.interface Solution`](types/solution.ts:16), [`types/solution.ts OR TypeScript.interface Operation`](types/solution.ts:7), [`types/solution.ts OR TypeScript.interface Machine`](types/solution.ts:2)
  - SearchConfig: [`types/domain.ts OR TypeScript.interface SearchConfig`](types/domain.ts:22)

Contrato del endpoint (exacto)
- Content-Types:
  1) application/json: { instanceId (req), instanceName?, modelId (req), variation?, search (req, SearchConfig), fileName? }
  2) multipart/form-data: file? (UploadFile), modelId (req), variation?, instanceId?, instanceName?, search (req, STRING JSON con SearchConfig)
- Respuesta (sin meta): SolutionEnvelope { status: "PENDING"|"RUNNING"|"COMPLETED"|"ERROR"; solution?; logs?[] }
- Validaciones mínimas: SearchConfig válida, tiempos ≥ 0, end = start + duration (recomendado), machineId existe, IDs consistentes, makespan ≥ max(end). 400 para validación, 500 para inesperados.

Modelos soportados en el mismo endpoint
- modelId: "jobshop"
  - variation: "tardanza"        (MiniZinc JOBSHOP_TARDANZA.MZN)
  - variation: "mantenimiento"   (MiniZinc JOBSHOP_MANTENIMIENTO.MZN)
- Si modelId/variation no reconocidos → 400 con detalle claro.

Flujo actual del frontend (se mantiene)
- Configuración persistida en localStorage, ejecución vía hook y orquestación Next:
  - Lanzamiento: [`components/containers/RunLauncher.tsx OR TypeScript.function onRun()`](components/containers/RunLauncher.tsx:38)
  - Llamada HTTP: [`hooks/useOneShot.ts OR TypeScript.function runOnce()`](hooks/useOneShot.ts:21)
  - Endpoint Next (forward + meta): [`app/api/solve-once/route.ts OR TypeScript.function POST(req: Request)`](app/api/solve-once/route.ts:43)
  - Almacenamiento in-memory + navegación: [`hooks/useRunStore.ts OR TypeScript.hook useRunStore()`](hooks/useRunStore.ts:52), [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx:50)
  - Resultados: [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx:1), resumen de métricas: [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx:25)

Arquitectura propuesta backend (alto nivel)
- Estructura:
```
backend/
  app/
    __init__.py
    main.py
    models.py
    routers/
      __init__.py
      solve_once.py
    services/
      __init__.py
      jobshop.py
    utils/
      __init__.py
      minizinc_runner.py   # opcional: ejecución de MiniZinc
  requirements.txt
  .env.example
  README.md
```

Requerimientos (Pydantic v2)
- requirements.txt:
```
fastapi==0.115.0
pydantic==2.9.0
pydantic-settings==2.5.2
uvicorn[standard]==0.30.6
python-multipart==0.0.9
```

Aplicación FastAPI con CORS y logging
- Archivo: backend/app/main.py
```python
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.solve_once import router as solve_once_router

app = FastAPI(title="JSSP Backend", version="1.0.0")

# Logging básico
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)
logger = logging.getLogger("jssp-backend")

# CORS (ajustar origins según entorno)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(solve_once_router, prefix="/api")
```
Referencias: [`backend/app/main.py OR Python.def app`](backend/app/main.py:1)

Modelos Pydantic (normalización de salida)
- Archivo: backend/app/models.py
```python
from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field

class SearchConfig(BaseModel):
    heuristic: Literal["greedy", "tabu", "sa"]
    timeLimitSec: int = Field(ge=0)
    maxSolutions: int = Field(ge=1)

class Machine(BaseModel):
    id: str
    name: str

class Operation(BaseModel):
    jobId: str
    machineId: str
    opId: str
    start: int = Field(ge=0)
    end: int = Field(ge=0)
    duration: int = Field(ge=0)

class Solution(BaseModel):
    makespan: int = Field(ge=0)
    machines: List[Machine]
    operations: List[Operation]
    stats: Dict[str, float] = {}

SolutionStatus = Literal["PENDING", "RUNNING", "COMPLETED", "ERROR"]

class SolutionEnvelope(BaseModel):
    status: SolutionStatus
    solution: Optional[Solution] = None
    logs: Optional[List[str]] = None
```
Referencias:
- [`backend/app/models.py OR Python.class SearchConfig`](backend/app/models.py:1)
- [`backend/app/models.py OR Python.class Machine`](backend/app/models.py:1)
- [`backend/app/models.py OR Python.class Operation`](backend/app/models.py:1)
- [`backend/app/models.py OR Python.class Solution`](backend/app/models.py:1)
- [`backend/app/models.py OR Python.class SolutionEnvelope`](backend/app/models.py:1)

Router del endpoint (acepta JSON o multipart)
- Archivo: backend/app/routers/solve_once.py
```python
import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Body, HTTPException
from ..models import SearchConfig, SolutionEnvelope
from ..services.jobshop import solve_jobshop

router = APIRouter()

@router.post("/solve-once", response_model=SolutionEnvelope)
async def solve_once(
    # multipart
    file: Optional[UploadFile] = File(default=None),
    modelId: Optional[str] = Form(default=None),
    variation: Optional[str] = Form(default=None),
    instanceId: Optional[str] = Form(default=None),
    instanceName: Optional[str] = Form(default=None),
    search: Optional[str] = Form(default=None),
    # json
    body: Optional[Dict[str, Any]] = Body(default=None),
):
    # Decidir JSON vs multipart: si body tiene contenido y no llegaron campos form, tratamos como JSON
    if body and all(v is None for v in [file, modelId, search]):
        # JSON
        model_id = body.get("modelId")
        variation_id = body.get("variation")
        instance_id = body.get("instanceId")
        instance_name = body.get("instanceName")
        search_obj = body.get("search")

        if not model_id or search_obj is None:
            raise HTTPException(status_code=400, detail="Campos requeridos faltantes: modelId, search")
        try:
            cfg = SearchConfig(**search_obj)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"search inválido: {e}")

        envelope = await solve_jobshop(
            model_id=model_id,
            variation=variation_id,
            # En JSON, se carga instancia por instanceId (resolución específica del proyecto)
            instance={"instanceId": instance_id, "instanceName": instance_name},
            search=cfg,
            upload=None,
        )
        return envelope

    # Multipart
    if modelId is None or search is None:
        raise HTTPException(status_code=400, detail="Campos requeridos faltantes en multipart: modelId, search")

    try:
        cfg = SearchConfig.model_validate_json(search)
    except Exception:
        # Si no es JSON válido, intentar parsear manualmente por si viene como dict string
        try:
            cfg = SearchConfig(**json.loads(search))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"search inválido: {e}")

    envelope = await solve_jobshop(
        model_id=modelId,
        variation=variation,
        # En multipart, el archivo es la parametrización MiniZinc
        instance={"instanceId": instanceId, "instanceName": instanceName},
        search=cfg,
        upload=file,
    )
    return envelope
```
Referencias:
- [`backend/app/routers/solve_once.py OR Python.def solve_once()`](backend/app/routers/solve_once.py:1)

Servicio jobshop (normaliza SIEMPRE la salida)
- Archivo: backend/app/services/jobshop.py
```python
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, UploadFile
from ..models import Machine, Operation, Solution, SolutionEnvelope, SearchConfig

async def solve_jobshop(
    model_id: Optional[str],
    variation: Optional[str],
    instance: Dict[str, Optional[str]],
    search: SearchConfig,
    upload: Optional[UploadFile],
) -> SolutionEnvelope:
    if model_id != "jobshop":
        raise HTTPException(status_code=400, detail=f"modelId no soportado: {model_id}")
    if variation not in (None, "tardanza", "mantenimiento"):
        raise HTTPException(status_code=400, detail=f"variation no soportada para jobshop: {variation}")

    # TODO: Resolver "instance" (si es JSON, cargar por instanceId; si es multipart y viene upload, parsear archivo)
    # TODO: Ejecutar MiniZinc según variation y obtener resultados crudos (s, d, END, etc.)
    # Por ahora, devolvemos resultados de ejemplo coherentes y normalizados:

    if variation == "mantenimiento":
        sol = _demo_mantenimiento()
        logs = ["model:jobshop", "variation:mantenimiento", f"heuristic:{search.heuristic}"]
    else:
        # default a "tardanza"
        sol = _demo_tardanza()
        logs = ["model:jobshop", "variation:tardanza", f"heuristic:{search.heuristic}"]

    # Validaciones mínimas (ejemplo)
    _validate_solution(sol)

    return SolutionEnvelope(status="COMPLETED", solution=sol, logs=logs)

def _demo_tardanza() -> Solution:
    # supongamos #TASKS = 3 => M1..M3
    machines = [Machine(id=f"M{i}", name=f"M{i}") for i in range(1, 4)]
    ops = [
        Operation(jobId="J1", machineId="M1", opId="J1-1", start=0, end=20, duration=20),
        Operation(jobId="J1", machineId="M2", opId="J1-2", start=25, end=55, duration=30),
        Operation(jobId="J2", machineId="M1", opId="J2-1", start=0, end=15, duration=15),
    ]
    makespan = max(o.end for o in ops)
    stats = {"w": 12.0, "util": 0.72}
    return Solution(makespan=makespan, machines=machines, operations=ops, stats=stats)

def _demo_mantenimiento() -> Solution:
    machines = [Machine(id=f"M{i}", name=f"M{i}") for i in range(1, 3)]
    ops = [
        Operation(jobId="J1", machineId="M1", opId="J1-1", start=0, end=10, duration=10),
        Operation(jobId="J1", machineId="M2", opId="J1-2", start=12, end=20, duration=8),
    ]
    makespan = max(o.end for o in ops)
    stats = {"maint_windows": 2, "maint_time": 6}
    return Solution(makespan=makespan, machines=machines, operations=ops, stats=stats)

def _validate_solution(sol: Solution):
    machine_ids = {m.id for m in sol.machines}
    seen_ops = set()
    max_end = 0
    for op in sol.operations:
        if op.start < 0 or op.end < 0 or op.duration < 0:
            raise HTTPException(status_code=400, detail="Tiempos negativos detectados en operaciones")
        if op.end != op.start + op.duration:
            # Recomendación elevable a error de validación:
            pass
        if op.machineId not in machine_ids:
            raise HTTPException(status_code=400, detail=f"machineId inválido en operación: {op.machineId}")
        if op.opId in seen_ops:
            raise HTTPException(status_code=400, detail=f"opId duplicado: {op.opId}")
        seen_ops.add(op.opId)
        max_end = max(max_end, op.end)
    if sol.makespan < max_end:
        raise HTTPException(status_code=400, detail="makespan < max(end) de operaciones")
```
Referencias:
- [`backend/app/services/jobshop.py OR Python.def solve_jobshop()`](backend/app/services/jobshop.py:1)
- [`backend/app/services/jobshop.py OR Python.def _demo_tardanza()`](backend/app/services/jobshop.py:1)
- [`backend/app/services/jobshop.py OR Python.def _demo_mantenimiento()`](backend/app/services/jobshop.py:1)
- [`backend/app/services/jobshop.py OR Python.def _validate_solution()`](backend/app/services/jobshop.py:1)

Opcional: runner de MiniZinc
- Archivo: backend/app/utils/minizinc_runner.py
- Propósito: encapsular llamada a MiniZinc para cada variation (entradas/outputs), y devolver solución cruda que luego se normaliza en services.jobshop.

Arranque local
- Crear venv e instalar:
```
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
- Ejecutar uvicorn:
```
uvicorn app.main:app --reload --port 8000
```
- CORS admite http://localhost:3000 por defecto. Ajustar según necesidad en [`backend/app/main.py OR Python.def app`](backend/app/main.py:1).

CURLs de prueba
- JSON:
```
curl -X POST "http://localhost:8000/api/solve-once" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "demo-1",
    "modelId": "jobshop",
    "variation": "tardanza",
    "search": { "heuristic": "greedy", "timeLimitSec": 5, "maxSolutions": 1 }
  }'
```
- multipart:
```
curl -X POST "http://localhost:8000/api/solve-once" \
  -H "Accept: application/json" \
  -F "file=@./instancias/demo.dzn" \
  -F "modelId=jobshop" \
  -F "variation=mantenimiento" \
  -F "instanceId=demo-1" \
  -F "instanceName=Demo #1" \
  -F 'search={\"heuristic\":\"tabu\",\"timeLimitSec\":30,\"maxSolutions\":3}'
```

Alineación mínima del frontend
1) Catálogo de modelos (mock local en Next)
   - Actualizar el mock de modelos para ofrecer el modelo "jobshop" con variaciones. Archivo: [`app/api/models/list/route.ts`](app/api/models/list/route.ts)
   - Cambio propuesto del bloque mock:
```ts
// dentro del if (process.env.USE_MOCKS === "true") { ... }
return NextResponse.json({
  models: [
    { id: "jobshop", name: "Job Shop", variations: ["tardanza", "mantenimiento"] },
  ],
})
```
   Referencia: [`app/api/models/list/route.ts OR TypeScript.function GET()`](app/api/models/list/route.ts:4)

2) ModelConfigurator
   - Ya persiste localStorage (jssp:modelId, jssp:variation). Ver [`components/containers/ModelConfigurator.tsx`](components/containers/ModelConfigurator.tsx)
   - No requiere cambios de lógica; la UI mostrará las variaciones entregadas por la API.

3) useOneShot.runOnce
   - Mantener FormData con: file?, modelId, variation?, instanceId?, instanceName?, search=JSON.stringify(...)
   - Referencia: [`hooks/useOneShot.ts OR TypeScript.function runOnce()`](hooks/useOneShot.ts:21)

4) Orquestador Next /api/solve-once
   - Mantener decisión mock vs backend real; añadir logs coherentes en mock:
     - ["model:jobshop","variation:<var>","heuristic:<search.heuristic>"]
   - Forward intacto:
     - multipart: [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts:115)
     - json: [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts:132)
   - Cálculo de meta: [`app/api/solve-once/route.ts OR TypeScript.function buildMeta(input)`](app/api/solve-once/route.ts:12)

5) ResultsDashboard
   - Ya consume SolutionEnvelope normalizado; métricas opcionales leídas de stats:
     - Resumen y util: [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx:25)
   - Mostrar w (tardanza) o maint_* si existen (ya se presentan en el gráfico de stats): [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx:235)

Variables de entorno Next
- NEXT_PUBLIC_BACKEND_URL → URL del backend FastAPI
- USE_MOCKS → "true" para modo simulado
- Uso en forward: [`app/api/solve-once/route.ts OR TypeScript.const base`](app/api/solve-once/route.ts:45)

Códigos HTTP (backend)
- 200: COMPLETED o PENDING/RUNNING
- 400: validaciones (search inválido, model/variation no soportados, inconsistencias en solución)
- 500: inesperados

Checklist de entorno backend
- venv activo
- requirements instalados (FastAPI, Pydantic v2, Uvicorn, python-multipart)
- CORS habilitado (origins del front)
- logging básico configurado
- uvicorn ejecutando en puerto accesible por Next

Criterios de aceptación (verificación rápida)
- POST /api/solve-once acepta JSON y multipart con EXACTOS nombres de campos.
- Soporta modelId="jobshop" con variation="tardanza" y "mantenimiento".
- Salida SIEMPRE normalizada al SolutionEnvelope esperado (sin meta).
- Validaciones mínimas aplicadas; 400/500 correctos.
- Front mantiene flujo: localStorage → useOneShot → /api/solve-once (Next) → backend → store → /results.

Apéndice: mapeos de normalización por variación
- "tardanza" (JOBSHOP_TARDANZA.MZN):
  - machines: M1..MT (derivado de #TASKS).
  - operations: (i,j) → jobId="J<i>", machineId="M<j>", opId="J<i>-<j>", start=s[i,j], duration=d[i,j], end=start+duration.
  - makespan: max end (o END si el modelo lo entrega).
  - stats: incluir { w: tardanza_ponderada_total }.
- "mantenimiento" (JOBSHOP_MANTENIMIENTO.MZN):
  - machines: M1..MT.
  - operations: (i,j) → start=S[i,j], duration=PROC_TIME[i,j], end=start+duration.
  - makespan: END.
  - stats: opcional { maint_windows, maint_time }.

Notas finales
- El frontend ya está preparado para leer meta añadida por Next y para visualizar stats arbitrarios en un gráfico de barras. Ver [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx:235) y meta panel: [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx:83).
- Mantener exactamente los nombres de campos exigidos para evitar fricción con el orquestador. Forward en Next: multipart [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts:115), json [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts:132).