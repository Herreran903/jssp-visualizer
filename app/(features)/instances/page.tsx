// app/(features)/instances/page.tsx
'use client'
import InstanceUploader from '../../../components/containers/InstanceUploader'
import InstanceList from '../../../components/containers/InstanceList'

export default function InstancesPage() {
  return (
    <main className="space-y-6">
      <InstanceUploader />
      <InstanceList />
    </main>
  )
}