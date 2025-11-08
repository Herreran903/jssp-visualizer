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
      className={`rounded-md border-2 border-dashed p-6 text-center transition-colors ${isDragActive ? 'border-blue-400 bg-blue-400/10' : 'border-white/20 hover:bg-white/5'}`}
    >
      <input {...getInputProps()} />
      <p className="text-sm text-gray-300">Suelta un .dzn o haz click para seleccionar</p>
    </div>
  )
}