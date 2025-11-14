// components/containers/InstanceList.tsx
"use client"
import { useState } from "react"
import { Eye, Download, Trash2, List, CheckCircle2, XCircle } from "lucide-react"
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" />
            <div className="text-xl font-bold uppercase">Instancias</div>
          </div>
          {instances.length > 0 && (
            <div className="text-xs text-(--color-text-secondary) font-hand uppercase">
              {instances.length} instancia{instances.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-sm text-(--color-text-secondary) uppercase">Cargando…</div>
        ) : instances.length === 0 ? (
          <div className="text-sm text-(--color-text-secondary) uppercase text-center py-8">
            No hay instancias. Sube una instancia para comenzar.
          </div>
        ) : (
          <div className="instance-table-container">
            <table className="instance-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Jobs</th>
                  <th>Máq.</th>
                  <th>Ops</th>
                  <th>Estado</th>
                  <th>Tamaño</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((inst) => (
                  <tr key={inst.id}>
                    <td className="instance-table-name">
                      <div className="font-medium">{inst.name}</div>
                      <div className="instance-table-id">{inst.id}</div>
                    </td>
                    <td>
                      <span className={getProblemTypeBadge(inst.problemType)}>
                        {getProblemTypeLabel(inst.problemType)}
                      </span>
                    </td>
                    <td className="instance-table-number">{inst.jobs || '—'}</td>
                    <td className="instance-table-number">{inst.machines || '—'}</td>
                    <td className="instance-table-number">{inst.operations || '—'}</td>
                    <td className="instance-table-status">
                      {inst.validated ? (
                        <div className="instance-status-valid">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Válida</span>
                        </div>
                      ) : (
                        <div className="instance-status-invalid">
                          <XCircle className="w-4 h-4" />
                          <span>Inválida</span>
                        </div>
                      )}
                    </td>
                    <td className="instance-table-size">
                      {Math.round(inst.size / 1024)} KB
                    </td>
                    <td>
                      <div className="instance-table-actions">
                        <button
                          onClick={() => handlePreview(inst.id)}
                          className="instance-action-btn"
                          title="Vista previa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(inst.id)}
                          className="instance-action-btn"
                          title="Exportar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id)}
                          disabled={deletingId === inst.id}
                          className="instance-action-btn instance-action-btn--danger"
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
      </Card>

      <InstancePreviewModal
        instance={previewInstance}
        onClose={() => setPreviewInstance(null)}
      />
    </>
  )
}
