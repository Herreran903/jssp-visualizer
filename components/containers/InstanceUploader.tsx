// components/containers/InstanceUploader.tsx
'use client'
import { useState } from 'react'
import { Upload, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import FileDrop from '../ui/FileDrop'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Select from '../ui/Select'
import useInstances from '../../hooks/useInstances'
import type { ProblemType } from '../../types/domain'

export default function InstanceUploader() {
  const { uploadInstance, importInstance, loading } = useInstances()
  const [file, setFile] = useState<File | null>(null)
  const [problemType, setProblemType] = useState<ProblemType>('jssp_maint')
  const [validationStatus, setValidationStatus] = useState<{
    validated: boolean
    errors: string[]
    warnings: string[]
  } | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  async function handleFileSelect(files: File[]) {
    const selectedFile = files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setValidationStatus(null)
    setUploadSuccess(null)

    // Check if it's a .dzn file or import files
    if (selectedFile.name.endsWith('.dzn')) {
      // Check if there's a .meta.json file in the selection
      const metaFile = files.find(f => f.name.endsWith('.meta.json'))
      
      if (metaFile) {
        // Import mode
        try {
          const id = await importInstance(selectedFile, metaFile)
          setUploadSuccess(`Instancia importada exitosamente! ID: ${id}`)
          setFile(null)
        } catch (error) {
          setValidationStatus({
            validated: false,
            errors: [error instanceof Error ? error.message : 'Error al importar'],
            warnings: [],
          })
        }
        return
      }

      // Upload mode - validate
      try {
        const content = await selectedFile.text()
        const { parseDZN } = await import('../../lib/dzn-parser')
        const result = parseDZN(content, problemType)
        
        setValidationStatus({
          validated: result.metadata.validated || false,
          errors: result.errors,
          warnings: result.warnings,
        })
      } catch (error) {
        setValidationStatus({
          validated: false,
          errors: ['Error al leer el archivo'],
          warnings: [],
        })
      }
    } else {
      setValidationStatus({
        validated: false,
        errors: ['Por favor selecciona un archivo .dzn'],
        warnings: [],
      })
    }
  }

  async function doUpload() {
    if (!file) return
    setUploadSuccess(null)
    
    try {
      const id = await uploadInstance(file, problemType)
      setUploadSuccess(`Instancia subida exitosamente! ID: ${id}`)
      setFile(null)
      setValidationStatus(null)
    } catch (error) {
      setValidationStatus({
        validated: false,
        errors: [error instanceof Error ? error.message : 'Error al subir'],
        warnings: [],
      })
    }
  }

  return (
    <Card className="space-y-4 font-hand">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5" />
        <div className="text-xl font-bold uppercase">Subir / Importar Instancia</div>
      </div>
      
      {/* Problem Type Selector */}
      <div>
        <div className="mb-1 text-xs text-slate-700 font-hand uppercase">Tipo de Problema</div>
        <Select 
          value={problemType} 
          onChange={(e) => setProblemType(e.target.value as ProblemType)}
          disabled={loading}
        >
          <option value="jssp_maint">JSSP con Mantenimiento</option>
          <option value="tardanza_ponderada">Tardanza Ponderada</option>
        </Select>
      </div>

      {/* Single File Upload/Import Area */}
      <div className="space-y-2">
        <div className="text-sm text-slate-700 font-hand uppercase">
          Archivo DZN {file && <span className="text-slate-500">(arrastra .meta.json para importar)</span>}
        </div>
        <FileDrop onFiles={handleFileSelect} accept=".dzn,.json" multiple />
        
        {file && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-700 font-hand uppercase">
              <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
              <Button onClick={doUpload} disabled={loading}>
                {loading ? 'Subiendo...' : 'Subir'}
              </Button>
            </div>

            {/* Validation Status */}
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
                    <div className="font-bold text-red-700 uppercase">Errores:</div>
                    {validationStatus.errors.map((err, i) => (
                      <div key={i} className="text-red-600 text-xs flex items-start gap-1">
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
                      <div key={i} className="text-yellow-600 text-xs flex items-start gap-1">
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
        <strong>Tip:</strong> Arrastra un archivo .dzn para subir, o arrastra .dzn + .meta.json juntos para importar
      </div>
    </Card>
  )
}