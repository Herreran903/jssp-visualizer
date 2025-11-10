// components/ui/FileDrop.tsx
'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function FileDrop({ onFiles }: { onFiles: (files: File[]) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFiles(acceptedFiles)
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'text/plain': ['.dzn'] },
  })

  return (
    <div
      {...getRootProps()}
      className={`rounded-md border-2 border-dashed p-6 text-center transition-colors ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
    >
      <input {...getInputProps()} />
      <p className="text-sm text-slate-600">Suelta un .dzn o haz click para seleccionar</p>
    </div>
  )
}