// components/containers/InstanceUploader.tsx
'use client'
import { useState } from 'react'
import FileDrop from '../ui/FileDrop'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'
import useInstances from '../../hooks/useInstances'
import type { InstanceForm } from '../../types/domain'

export default function InstanceUploader() {
  const { uploadInstance, createFromForm } = useInstances()
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState<InstanceForm>({ name: '', machines: 3, jobs: 3, operationsPerJob: 3 })

  async function doUpload() {
    if (!file) return
    await uploadInstance(file)
    setFile(null)
  }

  async function createDraft() {
    if (!form.name) return
    await createFromForm(form)
    setForm({ ...form, name: '' })
  }

  return (
    <Card className="space-y-4">
      <div className="text-lg font-semibold">Instancias</div>
      <div className="space-y-2">
        <FileDrop onFiles={(files) => setFile(files[0])} />
        {file && (
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>{file.name} ({file.size} bytes)</span>
            <Button onClick={doUpload}>Subir</Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input type="number" placeholder="Máquinas" value={form.machines} onChange={(e) => setForm({ ...form, machines: Number(e.target.value) })} />
        <Input type="number" placeholder="Jobs" value={form.jobs} onChange={(e) => setForm({ ...form, jobs: Number(e.target.value) })} />
        <Input type="number" placeholder="Ops/Job" value={form.operationsPerJob} onChange={(e) => setForm({ ...form, operationsPerJob: Number(e.target.value) })} />
      </div>
      <div className="text-right">
        <Button variant="ghost" onClick={createDraft}>Crear draft</Button>
      </div>
    </Card>
  )
}