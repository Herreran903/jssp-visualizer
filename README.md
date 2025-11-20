# JSSP Visualizer

Aplicación Next.js para cargar, validar y ejecutar instancias de Job Shop Scheduling (JSSP y variaciones) y visualizar resultados (métricas y diagrama de Gantt). El frontend redirige al flujo de ejecución por defecto mediante [`redirect()`](app/page.tsx:5).

Características principales:
- Gestión local de instancias .dzn (IndexedDB + localStorage)
- Configuración de solver y parámetros de búsqueda
- Ejecución en modo simulado (mocks) o contra un backend externo
- Panel de resultados con métricas, exportación JSON/CSV y Gantt

## Arquitectura general

- Frontend: Next.js App Router y React.
  - Entradas en [`app/(features)/`](app/(features)/) con páginas: [`/instances`](app/(features)/instances/page.tsx), [`/configure`](app/(features)/configure/page.tsx), [`/run`](app/(features)/run/page.tsx) y [`/results`](app/(features)/results/page.tsx).
  - Estilos globales en [`app/globals.css`](app/globals.css) y específicos en [`styles/gantt.css`](styles/gantt.css). Configuración en [`tailwind.config.ts`](tailwind.config.ts) y [`postcss.config.mjs`](postcss.config.mjs).
- API interna (Next.js Route Handler): [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts) exporta [`POST()`](app/api/solve-once/route.ts:34).
  - Lee `NEXT_PUBLIC_BACKEND_URL` y `USE_MOCKS` en [`route.ts`](app/api/solve-once/route.ts).
  - Si `USE_MOCKS=true`, responde con datos simulados usando [`lib/mock-solution.ts`](lib/mock-solution.ts); si no, reenvía la petición al backend `NEXT_PUBLIC_BACKEND_URL`.
- Persistencia local de instancias: [`lib/storage/instances.ts`](lib/storage/instances.ts) con IndexedDB (`idb-keyval`) y un índice en localStorage. Alta de instancias vía [`saveInstance()`](lib/storage/instances.ts:31).
- Utilidades y parsing:
  - Clientes HTTP en [`lib/api.ts`](lib/api.ts) como [`getJSON()`](lib/api.ts:2).
  - Parser de archivos .dzn en [`lib/dzn-parser.ts`](lib/dzn-parser.ts) con [`parseDZN()`](lib/dzn-parser.ts:9).
- Tipos de dominio y configuración del solver en [`types/domain.ts`](types/domain.ts) (por ejemplo [`SolverConfig`](types/domain.ts:61)).
- Modelos MiniZinc de referencia en [`modelos/`](modelos/). Ejemplos de instancias en [`public/instances/`](public/instances/).

## Requisitos previos

- Node.js 18.18+ (recomendado Node 20 LTS)
- npm (se usa [`package-lock.json`](package-lock.json)); no se requiere Python ni Docker para el frontend.
- Backend de resolución opcional (no incluido en este repositorio). La API interna puede trabajar en modo simulado.

## Instalación

```bash
npm install
```

## Variables de entorno

Cree un archivo `.env.local` en la raíz con las variables usadas por la API interna:

```bash
# URL base del backend externo (si se usa). Ej: http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=

# Si es "true", la ruta /api/solve-once devuelve resultados simulados.
USE_MOCKS=true
```

Referencias en código: lectura de variables en [`route.ts`](app/api/solve-once/route.ts) y decisión de mocks en [`POST()`](app/api/solve-once/route.ts:34).

## Ejecutar en desarrollo

```bash
npm run dev
# abre http://localhost:3000
```

La página principal redirige a `/run` mediante [`redirect()`](app/page.tsx:5). También puede navegar a:
- `/instances` para subir/importar .dzn (ver [`components/containers/InstanceUploader.tsx`](components/containers/InstanceUploader.tsx)).
- `/configure` para guardar la configuración del solver.
- `/run` para lanzar una ejecución (ver [`components/containers/RunLauncher.tsx`](components/containers/RunLauncher.tsx) que usa [`runOnce()`](hooks/useOneShot.ts:18)).
- `/results` para visualizar métricas, exportar CSV/JSON y ver el Gantt (ver [`components/containers/ResultsDashboard.tsx`](components/containers/ResultsDashboard.tsx)).

## Uso básico

1. Suba una instancia `.dzn` en `/instances`. La app la valida con [`parseDZN()`](lib/dzn-parser.ts:9) y la guarda con [`saveInstance()`](lib/storage/instances.ts:31).
2. En `/configure`, establezca el `SolverConfig` (se persiste en localStorage).
3. En `/run`, seleccione una instancia y ejecute. El contenedor envía `multipart/form-data` a la API interna con `file`, `instanceId`, `instanceName` y `solverConfig` (ver [`runOnce()`](hooks/useOneShot.ts:18) y [`POST()`](app/api/solve-once/route.ts:34)).
4. Revise `/results` para métricas y Gantt; puede exportar CSV con [`jsspResultToCSV`](lib/jssp-result-to-csv.ts) y JSON desde la UI.

Si `USE_MOCKS=true`, no necesita backend; si es `false`, configure `NEXT_PUBLIC_BACKEND_URL` apuntando a un servicio que exponga `POST /api/solve-once` con la misma forma de datos.

## Construir y ejecutar en producción

```bash
npm run build
npm start
# por defecto en el puerto 3000
```

Asegúrese de definir las variables en `.env.production` o variables de entorno del sistema antes de `npm start`.

## API interna y backend externo

- Ruta: `POST /api/solve-once` implementada en [`app/api/solve-once/route.ts`](app/api/solve-once/route.ts).
- Cuerpo esperado (multipart/form-data):
  - `file`: archivo `.dzn` de la instancia (opcional si el backend resuelve por `instanceId`).
  - `instanceId` y `instanceName` (opcionales).
  - `solverConfig`: objeto JSON serializado con la forma de [`SolverConfig`](types/domain.ts:61).
- Comportamiento:
  - Con `USE_MOCKS=true` responde datos simulados de [`lib/mock-solution.ts`](lib/mock-solution.ts).
  - Con `USE_MOCKS=false` reenvía la petición a `${NEXT_PUBLIC_BACKEND_URL}/api/solve-once`.

## Persistencia local

- Las instancias se almacenan en IndexedDB (contenido `.dzn`) y se indexan en localStorage, gestionadas por [`lib/storage/instances.ts`](lib/storage/instances.ts).
- Para “limpiar” todo localmente, borre los datos del sitio en el navegador o implemente una acción que invoque `clearAllInstances` (ver [`clearAllInstances()`](lib/storage/instances.ts:112)).

## Tests y linting

- Tests: no hay configuración de tests en este repositorio.
- Linting: ESLint está configurado; ejecute:

```bash
npm run lint
```

## Estructura de directorios (resumen)

- [`app/`](app/): páginas y API Routes (App Router).
- [`components/`](components/): UI y contenedores (e.g., [`RunLauncher.tsx`](components/containers/RunLauncher.tsx)).
- [`hooks/`](hooks/): lógica de cliente (e.g., [`useOneShot.ts`](hooks/useOneShot.ts)).
- [`lib/`](lib/): utilidades, parsing y API (e.g., [`dzn-parser.ts`](lib/dzn-parser.ts), [`api.ts`](lib/api.ts)).
- [`lib/storage/`](lib/storage/): persistencia en navegador (e.g., [`instances.ts`](lib/storage/instances.ts)).
- [`types/`](types/): tipos de dominio (e.g., [`domain.ts`](types/domain.ts)).
- [`modelos/`](modelos/): modelos MiniZinc de referencia.
- [`public/instances/`](public/instances/): instancias de ejemplo `.dzn`.
- Configuración: [`package.json`](package.json), [`next.config.ts`](next.config.ts), [`tsconfig.json`](tsconfig.json), [`eslint.config.mjs`](eslint.config.mjs), [`tailwind.config.ts`](tailwind.config.ts), [`postcss.config.mjs`](postcss.config.mjs).

## Dependencias clave

Consulte [`package.json`](package.json) para versiones. Destacan: Next.js, React, Tailwind CSS, `idb-keyval`, `recharts`, `lucide-react`, `html2canvas`.

## Notas

- Este repositorio no incluye el backend de resolución; la variable `NEXT_PUBLIC_BACKEND_URL` debe apuntar a uno compatible si se desactivan los mocks.
- Los archivos en [`modelos/`](modelos/) no se consumen directamente por el frontend; sirven como referencia/prototipos de modelado.
