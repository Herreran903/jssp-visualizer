// components/ui/FileDrop.tsx
'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileDropProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
}

export default function FileDrop({ onFiles, accept = '.dzn', multiple = false }: FileDropProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFiles(acceptedFiles)
  }, [onFiles])

  // Convert accept string to dropzone format
  const acceptObj = accept.split(',').reduce((acc, ext) => {
    const trimmed = ext.trim()
    if (trimmed === '.dzn') {
      acc['text/plain'] = ['.dzn']
    } else if (trimmed === '.json') {
      acc['application/json'] = ['.json']
    }
    return acc
  }, {} as Record<string, string[]>)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: acceptObj,
  })

  return (
    <div
      {...getRootProps()}
      className={`rounded-none border-2 border-dashed p-6 text-center transition-colors bg-(--color-surface) text-(--color-text-secondary) ${isDragActive ? 'border-(--color-accent) bg-(--overlay-08)' : 'border-(--color-border-subtle) hover:bg-(--overlay-02)'}`}
    >
      <input {...getInputProps()} />
      <p className="text-xl font-hand uppercase tracking-wide text-(--color-text-secondary)">
        {multiple ? 'Suelta archivos o haz click para seleccionar' : 'Suelta un archivo o haz click para seleccionar'}
      </p>
    </div>
  )
}