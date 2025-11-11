# Flujo actual del frontend (solve-once) y dependencias

Este documento describe, de extremo a extremo, cómo el frontend ejecuta una corrida “one-shot” (solve-once), qué estado utiliza, cómo navega y qué endpoints necesita disponibles para funcionar.

## Resumen de alto nivel

1) El usuario configura “Modelo” y “Variación” y esos valores se persisten en localStorage.
   - Ver [`components/containers/ModelConfigurator.tsx`](components/containers/ModelConfigurator.tsx).
2) El usuario configura la búsqueda (heurística, tiempo, máx. soluciones) y también se persiste en localStorage.
   - Ver [`components/containers/SearchConfigurator.tsx`](components/containers/SearchConfigurator.tsx).
3) En “Ejecutar” (RunLauncher), el usuario elige la instancia y el modelo, se cargan los valores persistidos (variación y búsqueda), y se dispara la ejecución.
   - Ver [`components/containers/RunLauncher.tsx OR TypeScript.function onRun()`](components/containers/RunLauncher.tsx:38).
4) La ejecución se realiza mediante un hook que arma un FormData y llama al endpoint Next local “/api/solve-once”.
   - Ver [`hooks/useOneShot.ts OR TypeScript.function useOneShot()`](hooks/useOneShot.ts:16) y [`hooks/useOneShot.ts OR TypeScript.function runOnce()`](hooks/useOneShot.ts:21).
5) El endpoint Next decide si responder con mocks o reenviar la petición al backend real, y siempre añade meta antes de responder al navegador.
   - Ver [`app/api/solve-once/route.ts OR TypeScript.function POST(req: Request)`](app/api/solve-once/route.ts:43).
6) La respuesta se guarda en un store en memoria (últimas dos corridas) y el UI navega a “/results”.
   - Ver [`hooks/useRunStore.ts OR TypeScript.hook useRunStore()`](hooks/useRunStore.ts:52) y [`components/containers/RunLauncher.tsx OR TypeScript.function onRun()`](components/containers/RunLauncher.tsx:38).

## Componentes y hooks clave

### 1) Configuración de modelo y variación
- Componente: [`components/containers/ModelConfigurator.tsx`](components/containers/ModelConfigurator.tsx)
- Comportamiento:
  - Carga la lista de modelos vía `useModels` (selects poblados con `models`).
  - Selecciona por defecto el primer modelo y su primera variación (si existen).
  - Persiste selecciones en localStorage:
    - Claves: `jssp:modelId` y `jssp:variation`.
    - Persistencia: [`components/containers/ModelConfigurator.tsx`](components/containers/ModelConfigurator.tsx#L21-L23 no-anchor)
  - Enlaces de código:
    - Inicialización por defecto: [`components/containers/ModelConfigurator.tsx`](components/containers/ModelConfigurator.tsx#L13-L18 no-anchor)
    - Persistencia: [`components/containers/ModelConfigurator.tsx`](components/containers/ModelConfigurator.tsx#L20-L23 no-anchor)

### 2) Configuración de la búsqueda
- Componente: [`components/containers/SearchConfigurator.tsx`](components/containers/SearchConfigurator.tsx)
- Comportamiento:
  - Estado local con defaults: heuristic=greedy, timeLimitSec=5, maxSolutions=1.
    - Definición: [`components/containers/SearchConfigurator.tsx`](components/containers/SearchConfigurator.tsx#L10-L11 no-anchor)
  - Carga configuración guardada en localStorage al montar y la persiste en cada cambio.
    - Carga: [`components/containers/SearchConfigurator.tsx`](components/containers/SearchConfigurator.tsx#L12-L19 no-anchor)
    - Persistencia: [`components/containers/SearchConfigurator.tsx`](components/containers/SearchConfigurator.tsx#L21-L23 no-anchor)
  - El tipo `SearchConfig` corresponde a [`types/domain.ts OR TypeScript.interface SearchConfig`](types/domain.ts:22).

### 3) Lanzamiento de la ejecución
- Contenedor: [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx)
- Responsabilidades:
  - Trae listas de instancias y modelos con `useInstances` y `useModels`. Selecciona la primera opción por defecto si no hay selección previa.
    - Defaults: [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L33-L36 no-anchor)
  - Recupera `searchConfig` y `variation` desde localStorage para armar los parámetros de ejecución.
    - Carga searchConfig: [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L25-L31 no-anchor)
    - Lectura de variation: [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L41-L42 no-anchor)
  - Al hacer clic en “Ejecutar” invoca `runOnce` del hook `useOneShot`, guarda el resultado en el store en memoria y navega a `/results`.
    - onRun: [`components/containers/RunLauncher.tsx OR TypeScript.function onRun()`](components/containers/RunLauncher.tsx:38)
    - Deshabilita botón por loading: [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L71 no-anchor)
  - Navegación:
    - `router.replace("/results")`: [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L51-L52 no-anchor)

### 4) Ejecución one-shot (llamada HTTP)
- Hook: [`hooks/useOneShot.ts OR TypeScript.function useOneShot()`](hooks/useOneShot.ts:16)
- Lo que hace:
  - Expone estados `loading`, `error`, `result`.
  - Implementa `runOnce(params)` que:
    - Construye `FormData` con campos: file (opcional), modelId, variation (opcional), instanceId (opcional), instanceName (opcional) y search (JSON.stringify).
      - Armado de FormData: [`hooks/useOneShot.ts`](hooks/useOneShot.ts#L24-L31 no-anchor)
    - Hace POST a `/api/solve-once`.
      - Fetch y parseo: [`hooks/useOneShot.ts`](hooks/useOneShot.ts#L31-L35 no-anchor)

### 5) Store de corridas en memoria
- Hook: [`hooks/useRunStore.ts OR TypeScript.hook useRunStore()`](hooks/useRunStore.ts:52)
- Diseño:
  - Mantiene `lastRun` y `prevRun` en un store simple con `useSyncExternalStore`.
  - API:
    - `setRun(run)` actualiza `prevRun` y `lastRun`: [`hooks/useRunStore.ts OR TypeScript.function setRun()`](hooks/useRunStore.ts:37)
    - `clear()` limpia el estado: [`hooks/useRunStore.ts OR TypeScript.function clear()`](hooks/useRunStore.ts:43)
- Uso típico:
  - Desde `RunLauncher` después de ejecutar: [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L50 no-anchor)
  - La vista de resultados lee `lastRun` para pintar dashboards.
    - Ver [`app/(features)/results/page.tsx`](app/(features)/results/page.tsx) y [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx)

### 6) Endpoint Next de orquestación y “enriquecimiento”
- Ruta: [`app/api/solve-once/route.ts OR TypeScript.function POST(req: Request)`](app/api/solve-once/route.ts:43)
- Comportamiento:
  - Variables de control:
    - `NEXT_PUBLIC_BACKEND_URL`: [`app/api/solve-once/route.ts OR TypeScript.const base`](app/api/solve-once/route.ts:45)
    - `USE_MOCKS`: [`app/api/solve-once/route.ts OR TypeScript.const isMock`](app/api/solve-once/route.ts:46)
  - Modo mock (no llama backend) y construye una solución de ejemplo:
    - Bloque mock: [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts#L48-L112 no-anchor)
  - Modo real: reenvía multipart o JSON al backend `${base}/api/solve-once` y añade `meta` con `buildMeta(...)`.
    - Multipart forward: [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts#L115-L131 no-anchor)
    - JSON forward: [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts#L132-L148 no-anchor)
  - Cálculo de meta para el frontend:
    - [`app/api/solve-once/route.ts OR TypeScript.function buildMeta(input)`](app/api/solve-once/route.ts:12)

## Datos y endpoints que el frontend espera

- Listado de modelos (para poblar select):
  - Hook: [`hooks/useModels.ts`](hooks/useModels.ts)
  - API local (Next): [`app/api/models/list/route.ts`](app/api/models/list/route.ts)
  - Tipo: [`types/api.ts OR TypeScript.interface ModelsListResponse`](types/api.ts:11)

- Listado de instancias (para poblar select):
  - Hook: [`hooks/useInstances.ts`](hooks/useInstances.ts)
  - API local (Next): [`app/api/instances/list/route.ts`](app/api/instances/list/route.ts)
  - Tipo: [`types/api.ts OR TypeScript.type InstancesListResponse`](types/api.ts:5) con elementos [`types/domain.ts OR TypeScript.interface InstanceSummary`](types/domain.ts:2)

- Ejecución one-shot:
  - API local (Next) que reenvía al backend real: [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts)
  - Respuesta esperada de backend (sin meta): [`types/api.ts OR TypeScript.interface SolutionEnvelope`](types/api.ts:43) con `solution` de tipo [`types/solution.ts OR TypeScript.interface Solution`](types/solution.ts:16)

## Estado en cliente (localStorage)

- Claves usadas:
  - `jssp:modelId` y `jssp:variation`: se escriben al cambiar selección de modelo/variación:
    - [`components/containers/ModelConfigurator.tsx`](components/containers/ModelConfigurator.tsx#L20-L23 no-anchor)
  - `jssp:searchConfig`: se carga al montar y se persiste en cada cambio:
    - Carga: [`components/containers/SearchConfigurator.tsx`](components/containers/SearchConfigurator.tsx#L12-L19 no-anchor)
    - Persistencia: [`components/containers/SearchConfigurator.tsx`](components/containers/SearchConfigurator.tsx#L21-L23 no-anchor)
  - `RunLauncher` también lee `jssp:searchConfig` al montar y `jssp:variation` antes de ejecutar:
    - [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L25-L31 no-anchor), [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L41-L42 no-anchor)

## Variables de entorno relevantes

- `NEXT_PUBLIC_BACKEND_URL`: base del backend real al que se reenvía desde la API de Next.
  - Uso: [`app/api/solve-once/route.ts OR TypeScript.const base`](app/api/solve-once/route.ts:45)
- `USE_MOCKS`: si `"true"`, la API de Next retorna una solución simulada y no llama al backend.
  - Uso: [`app/api/solve-once/route.ts OR TypeScript.const isMock`](app/api/solve-once/route.ts:46)

## Secuencia detallada de ejecución

```text
Usuario
  │
  │ selecciona Modelo y Variación
  ▼
ModelConfigurator
  - usa useModels
  - guarda jssp:modelId / jssp:variation
  │
  │ ajusta parámetros de búsqueda
  ▼
SearchConfigurator
  - lee/guarda jssp:searchConfig
  │
  │ elige Instancia y hace clic en "Ejecutar"
  ▼
RunLauncher.onRun()
  - lee instances/models
  - lee jssp:searchConfig / jssp:variation
  - invoca useOneShot.runOnce(params)
       ▼
useOneShot.runOnce()
  - arma FormData
  - POST /api/solve-once
       ▼
Next API /api/solve-once
  - si USE_MOCKS => devuelve mock + meta
  - si no, reenvía a ${NEXT_PUBLIC_BACKEND_URL}/api/solve-once
    y añade meta
       ▼
RunLauncher
  - setRun(resultado)
  - router.replace("/results")
       ▼
Results
  - consume lastRun del store y renderiza dashboards
```

## Contrato de tipos usado por el frontend

- Envoltura de respuesta: [`types/api.ts OR TypeScript.interface SolutionEnvelope`](types/api.ts:43)
- Estado: [`types/api.ts OR TypeScript.type SolutionStatus`](types/api.ts:25)
- Solución: [`types/solution.ts OR TypeScript.interface Solution`](types/solution.ts:16)
- Operación: [`types/solution.ts OR TypeScript.interface Operation`](types/solution.ts:7)
- Máquina: [`types/solution.ts OR TypeScript.interface Machine`](types/solution.ts:2)
- Configuración de búsqueda: [`types/domain.ts OR TypeScript.interface SearchConfig`](types/domain.ts:22)

## Qué debe existir para que “funcione” end-to-end

- APIs locales de Next para listar datos, o que éstas reenvíen a un backend:
  - [`app/api/models/list/route.ts`](app/api/models/list/route.ts)
  - [`app/api/instances/list/route.ts`](app/api/instances/list/route.ts)
  - [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts)
- Backend real accesible en `NEXT_PUBLIC_BACKEND_URL` con `POST /api/solve-once` (si USE_MOCKS ≠ "true").
- Tipos y estructura de `solution` alineados con el frontend (máquinas, operaciones, makespan, stats).
- Rutas de UI:
  - Configuración/Run: [`app/(features)/run/page.tsx`](app/(features)/run/page.tsx)
  - Resultados: [`app/(features)/results/page.tsx`](app/(features)/results/page.tsx)
  - Dashboard de resultados: [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx)

## Puntos de extensión comunes

- Añadir nuevos parámetros de búsqueda: extender [`types/domain.ts OR TypeScript.interface SearchConfig`](types/domain.ts:22), actualizar `SearchConfigurator`, y hacer que `useOneShot` los envíe (se serializan dentro de `search`).
- Cambiar la selección por defecto: modificar los efectos en [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx#L33-L36 no-anchor) y [`components/containers/ModelConfigurator.tsx`](components/containers/ModelConfigurator.tsx#L13-L18 no-anchor).
- Almacenar más runs: ampliar el store en [`hooks/useRunStore.ts`](hooks/useRunStore.ts) para mantener historial.
