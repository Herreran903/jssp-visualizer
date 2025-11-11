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
      className={`rounded-none border-2 border-dashed p-6 text-center transition-colors ${isDragActive ? 'border-black/60 bg-black/5' : 'border-black/30 bg-transparent hover:bg-black/5'}`}
    >
      <input {...getInputProps()} />
      <p className="text-xs text-slate-700 font-hand uppercase tracking-wide">Suelta un .dzn o haz click para seleccionar</p>
    </div>
  )
}