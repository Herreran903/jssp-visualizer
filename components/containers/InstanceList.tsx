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
      ? 'badge badge--type-maint'
      : 'badge badge--type-tard'
  }

  return (
    <>
      <Card className="space-y-3 font-hand">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5" />
          <div className="text-xl font-bold uppercase">Instancias</div>
        </div>
        
        {loading ? (
          <div className="text-sm text-(--color-text-secondary) uppercase">Cargando…</div>
        ) : instances.length === 0 ? (
          <div className="text-sm text-(--color-text-secondary) uppercase text-center py-8">
            No hay instancias. Sube una instancia para comenzar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border-subtle) bg-(--color-surface-alt)">
                  <th className="text-left py-2 px-2 font-sans uppercase text-xs text-(--color-text-secondary)">Nombre</th>
                  <th className="text-left py-2 px-2 font-sans uppercase text-xs text-(--color-text-secondary)">Tipo</th>
                  <th className="text-center py-2 px-2 font-sans uppercase text-xs text-(--color-text-secondary)">Jobs</th>
                  <th className="text-center py-2 px-2 font-sans uppercase text-xs text-(--color-text-secondary)">Máq.</th>
                  <th className="text-center py-2 px-2 font-sans uppercase text-xs text-(--color-text-secondary)">Ops</th>
                  <th className="text-center py-2 px-2 font-sans uppercase text-xs text-(--color-text-secondary)">Estado</th>
                  <th className="text-center py-2 px-2 font-sans uppercase text-xs text-(--color-text-secondary)">Tamaño</th>
                  <th className="text-right py-2 px-2 font-sans uppercase text-xs text-(--color-text-secondary)">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((inst) => (
                  <tr key={inst.id} className="border-b border-(--color-border-subtle) hover:bg-(--overlay-02)">
                    <td className="py-2 px-2 font-hand">
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-xs text-(--color-text-secondary) font-mono">{inst.id}</div>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`font-sans ${getProblemTypeBadge(inst.problemType)}`}>
                        {getProblemTypeLabel(inst.problemType)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono">{inst.jobs || '—'}</td>
                    <td className="py-2 px-2 text-center font-mono">{inst.machines || '—'}</td>
                    <td className="py-2 px-2 text-center font-mono">{inst.operations || '—'}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`badge font-sans ${
                        inst.validated
                          ? 'badge--success'
                          : 'badge--danger'
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
                          className="p-2 text-xs hover:bg-(--overlay-08) rounded font-sans transition-colors text-(--color-text-secondary) focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                          title="Vista previa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(inst.id)}
                          className="p-2 text-xs hover:bg-(--overlay-08) rounded font-sans transition-colors text-(--color-text-secondary) focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                          title="Exportar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id)}
                          disabled={deletingId === inst.id}
                          className="p-2 text-xs hover:bg-(--overlay-08) rounded font-sans transition-colors text-(--color-danger) disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-(--color-accent)"
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
          <div className="pt-3 border-t border-(--color-border-subtle) text-xs text-(--color-text-secondary) font-sans uppercase">
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
