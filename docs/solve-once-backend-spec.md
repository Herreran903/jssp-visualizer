# Especificación del endpoint solve-once (para backend en Python con FastAPI)

## Contexto frontend
- El frontend Next.js expone un endpoint intermedio que reenvía la petición al backend real y enriquece la respuesta con meta. Ver [`app/api/solve-once/route.ts OR TypeScript.function POST(req: Request)`](app/api/solve-once/route.ts:43).
- Variables de entorno relevantes usadas por el frontend: [`app/api/solve-once/route.ts OR TypeScript.const base`](app/api/solve-once/route.ts:45), [`app/api/solve-once/route.ts OR TypeScript.const isMock`](app/api/solve-once/route.ts:46).
  - NEXT_PUBLIC_BACKEND_URL: base del backend al que se reenvía.
  - USE_MOCKS: si "true", el frontend devolverá una respuesta simulada sin llamar al backend.

## Endpoint que debe exponer el backend
- Método y ruta: POST ${NEXT_PUBLIC_BACKEND_URL}/api/solve-once
- El backend debe aceptar dos tipos de cuerpo: multipart/form-data y application/json.
- No es necesario devolver meta; el frontend la añade antes de responder al navegador.

## Esquemas de entrada
1) multipart/form-data (cuando el usuario sube un archivo de instancia):
- file: archivo de la instancia (UploadFile). Opcional si se usa instanceId.
- modelId: string. Identificador del modelo/solver a usar.
- variation: string (opcional).
- instanceId: string (opcional).
- instanceName: string (opcional).
- search: string (JSON serializado) requerido. Debe parsearse al esquema SearchConfig definido en el frontend: [`types/domain.ts OR TypeScript.interface SearchConfig`](types/domain.ts:22).
  - Estructura de SearchConfig: heuristic ('greedy' | 'tabu' | 'sa'), timeLimitSec (number), maxSolutions (number).

2) application/json (cuando no hay archivo y se referencia una instancia ya cargada):
- instanceId: string.
- instanceName: string (opcional).
- modelId: string.
- variation: string (opcional).
- search: objeto con el esquema de SearchConfig: [`types/domain.ts OR TypeScript.interface SearchConfig`](types/domain.ts:22).
- fileName: string (opcional, solo informativo).

## Esquema de salida que espera el frontend
El backend debe responder un objeto "SolutionEnvelope" sin el campo meta (el frontend lo añade). Definición de tipos en el frontend:
- Estado: [`types/api.ts OR TypeScript.type SolutionStatus`](types/api.ts:25) con valores 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR'.
- Envoltura: [`types/api.ts OR TypeScript.interface SolutionEnvelope`](types/api.ts:43) con campos:
  - status: SolutionStatus.
  - solution?: objeto solución (ver abajo).
  - logs?: string[] con mensajes o trazas breves.
- Objeto solución: [`types/solution.ts OR TypeScript.interface Solution`](types/solution.ts:16), con:
  - makespan: number.
  - machines: [`types/solution.ts OR TypeScript.interface Machine`](types/solution.ts:2)[] con { id: string; name: string }.
  - operations: [`types/solution.ts OR TypeScript.interface Operation`](types/solution.ts:7)[] con { jobId, machineId, opId, start, end, duration }.
  - stats: Record<string, number> para métricas adicionales (por ejemplo, utilización, tardanza, etc.).

## Reglas y validaciones mínimas recomendadas en backend
- start, end, duration en operations deben ser números no negativos; se recomienda end = start + duration.
- machineId de cada operación debe existir en machines.
- makespan debe ser >= al mayor end.
- Los IDs (jobId, machineId, opId) deben ser consistentes y únicos por su ámbito.
- El backend puede devolver status 'COMPLETED' con solution llena; para errores, use 'ERROR' y un logs con mensajes.

## Códigos de estado HTTP
- 200 OK: ejecución exitosa ('COMPLETED') o progreso ('PENDING'/'RUNNING') si aplica.
- 400 Bad Request: validación fallida (por ejemplo, search inválido).
- 500 Internal Server Error: errores de ejecución inesperados.

## Ejemplos de request/response
1) JSON  
Request (application/json):
```
{
  "instanceId": "tai-20-5-10",
  "instanceName": "tai-20-5-10",
  "modelId": "basic",
  "variation": "default",
  "search": { "heuristic": "greedy", "timeLimitSec": 5, "maxSolutions": 1 },
  "fileName": "tai-20-5-10.txt"
}
```

Respuesta (200):
```
{
  "status": "COMPLETED",
  "solution": {
    "makespan": 100,
    "machines": [
      { "id": "M1", "name": "M1" },
      { "id": "M2", "name": "M2" }
    ],
    "operations": [
      { "jobId": "J1", "machineId": "M1", "opId": "J1-1", "start": 0, "end": 20, "duration": 20 }
    ],
    "stats": { "util": 0.72, "tardanza": 12 }
  },
  "logs": ["solver:basic", "heuristic:greedy"]
}
```

2) multipart/form-data  
Campos (boundary omitido):
- file: <archivo>
- modelId: basic
- variation: default
- instanceId: tai-20-5-10
- instanceName: tai-20-5-10
- search: {"heuristic":"tabu","timeLimitSec":30,"maxSolutions":3}

Respuesta (200): igual estructura que en JSON.

## Ejemplos curl
JSON:
```
curl -X POST "$NEXT_PUBLIC_BACKEND_URL/api/solve-once" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId":"tai-20-5-10",
    "modelId":"basic",
    "search":{"heuristic":"greedy","timeLimitSec":5,"maxSolutions":1}
  }'
```

multipart:
```
curl -X POST "$NEXT_PUBLIC_BACKEND_URL/api/solve-once" \
  -H "Accept: application/json" \
  -F "file=@./instancias/tai-20-5-10.txt" \
  -F "modelId=basic" \
  -F "variation=default" \
  -F "instanceId=tai-20-5-10" \
  -F "instanceName=tai-20-5-10" \
  -F 'search={\"heuristic\":\"tabu\",\"timeLimitSec\":30,\"maxSolutions\":3}'
```

## Notas sobre meta
- El frontend calculará y añadirá meta antes de responder al navegador. Ver constructor de meta en [`app/api/solve-once/route.ts OR TypeScript.function buildMeta(input)`](app/api/solve-once/route.ts:12).
- El backend puede ignorar completamente meta.

## Boceto de implementación en FastAPI (referencial)
Referencias propuestas para los constructos: [`backend/app/main.py OR Python.def solve_once()`](backend/app/main.py:1), [`backend/app/models.py OR Python.class Solution`](backend/app/models.py:1), [`backend/app/models.py OR Python.class Operation`](backend/app/models.py:1), [`backend/app/models.py OR Python.class Machine`](backend/app/models.py:1), [`backend/app/models.py OR Python.class SolutionEnvelope`](backend/app/models.py:1), [`backend/app/models.py OR Python.class SearchConfig`](backend/app/models.py:1).

```python
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal, Union

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

app = FastAPI()

@app.post("/api/solve-once", response_model=SolutionEnvelope)
async def solve_once(
    file: Optional[UploadFile] = File(None),
    modelId: Optional[str] = Form(None),
    variation: Optional[str] = Form(None),
    instanceId: Optional[str] = Form(None),
    instanceName: Optional[str] = Form(None),
    search: Optional[str] = Form(None),
    body: Optional[Dict] = Body(default=None),
):
    # Soporte dual: multipart (campos Form) o JSON (body)
    if body and not any([file, modelId, search]):
        # JSON
        try:
            cfg = SearchConfig(**body["search"])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"search inválido: {e}")
        # TODO: resolver instancia por instanceId y ejecutar solver...
        mdl = body.get("modelId", "basic")
        heur = cfg.heuristic
    else:
        # multipart
        if not search:
            raise HTTPException(status_code=400, detail="campo 'search' requerido")
        try:
            cfg = SearchConfig.model_validate_json(search)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"search inválido: {e}")
        mdl = modelId or "basic"
        heur = cfg.heuristic
        # TODO: leer archivo si viene 'file' y ejecutar solver...

    # Respuesta de ejemplo
    return {
        "status": "COMPLETED",
        "solution": {
            "makespan": 100,
            "machines": [{"id": "M1", "name": "M1"}],
            "operations": [
                {"jobId": "J1", "machineId": "M1", "opId": "J1-1", "start": 0, "end": 20, "duration": 20}
            ],
            "stats": {"util": 0.72}
        },
        "logs": [f"model:{mdl}", f"heuristic:{heur}"]
    }
```

## Consideraciones adicionales
- El frontend llamará al backend exactamente así: multipart -> reenvía FormData sin modificar; JSON -> reenvía el body JSON. Ver reenvío en [`app/api/solve-once/route.ts OR TypeScript.fetch multipart`](app/api/solve-once/route.ts:127) y [`app/api/solve-once/route.ts OR TypeScript.fetch json`](app/api/solve-once/route.ts:133).
- Mantén nombres de campos exactamente como se indican para evitar fricción.