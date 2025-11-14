// components/containers/InstanceList.tsx
"use client"
import { useState } from "react"
import { Eye, Download, Trash2, List } from "lucide-react"
import Card from "../ui/Card"
import useInstances from "../../hooks/useInstances"
import InstancePreviewModal from "../ui/InstancePreviewModal"
import type { LocalInstance } from "../../types/domain"

export default function InstanceList() {
  const { instances, loading, deleteInstance, exportInstance, getInstanceData } = useInstances()
  const [previewInstance, setPreviewInstance] = useState<LocalInstance | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handlePreview(id: string) {
    const data = await getInstanceData(id)
    setPreviewInstance(data)
  }

  async function handleExport(id: string) {
    try {
      await exportInstance(id)
    } catch (error) {
      alert(`Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta instancia?')) {
      return
    }
    
    setDeletingId(id)
    try {
      await deleteInstance(id)
    } catch (error) {
      alert(`Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setDeletingId(null)
    }
  }

  function getProblemTypeLabel(type: string): string {
    return type === 'jssp_maint' ? 'JSSP Mant.' : 'Tard. Pond.'
  }

  function getProblemTypeBadge(type: string): string {
    return type === 'jssp_maint' 
      ? 'bg-blue-100 text-blue-700' 
      : 'bg-purple-100 text-purple-700'
  }

  return (
    <>
      <Card className="space-y-3 font-hand">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5" />
          <div className="text-xl font-bold uppercase">Instancias</div>
        </div>
        
        {loading ? (
          <div className="text-sm text-slate-700 uppercase">Cargando…</div>
        ) : instances.length === 0 ? (
          <div className="text-sm text-slate-500 uppercase text-center py-8">
            No hay instancias. Sube una instancia para comenzar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-hand uppercase text-xs text-slate-600">Nombre</th>
                  <th className="text-left py-2 px-2 font-hand uppercase text-xs text-slate-600">Tipo</th>
                  <th className="text-center py-2 px-2 font-hand uppercase text-xs text-slate-600">Jobs</th>
                  <th className="text-center py-2 px-2 font-hand uppercase text-xs text-slate-600">Máq.</th>
                  <th className="text-center py-2 px-2 font-hand uppercase text-xs text-slate-600">Ops</th>
                  <th className="text-center py-2 px-2 font-hand uppercase text-xs text-slate-600">Estado</th>
                  <th className="text-center py-2 px-2 font-hand uppercase text-xs text-slate-600">Tamaño</th>
                  <th className="text-right py-2 px-2 font-hand uppercase text-xs text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((inst) => (
                  <tr key={inst.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2 font-hand">
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{inst.id}</div>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-hand uppercase ${getProblemTypeBadge(inst.problemType)}`}>
                        {getProblemTypeLabel(inst.problemType)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono">{inst.jobs || '—'}</td>
                    <td className="py-2 px-2 text-center font-mono">{inst.machines || '—'}</td>
                    <td className="py-2 px-2 text-center font-mono">{inst.operations || '—'}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-hand uppercase ${
                        inst.validated 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {inst.validated ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-xs text-slate-600">
                      {Math.round(inst.size / 1024)} KB
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handlePreview(inst.id)}
                          className="p-2 text-xs hover:bg-slate-200 rounded font-hand uppercase transition-colors"
                          title="Vista previa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(inst.id)}
                          className="p-2 text-xs hover:bg-slate-200 rounded font-hand uppercase transition-colors"
                          title="Exportar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id)}
                          disabled={deletingId === inst.id}
                          className="p-2 text-xs hover:bg-red-100 rounded font-hand uppercase text-red-600 disabled:opacity-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {instances.length > 0 && (
          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 font-hand uppercase">
            Total: {instances.length} instancia{instances.length !== 1 ? 's' : ''}
          </div>
        )}
      </Card>

      <InstancePreviewModal 
        instance={previewInstance} 
        onClose={() => setPreviewInstance(null)} 
      />
    </>
  )
}
