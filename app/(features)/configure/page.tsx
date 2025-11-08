// app/(features)/configure/page.tsx
"use client"
import ModelConfigurator from "../../../components/containers/ModelConfigurator"
import SearchConfigurator from "../../../components/containers/SearchConfigurator"

export default function ConfigurePage() {
  return (
    <main className="space-y-6">
      <ModelConfigurator />
      <SearchConfigurator />
    </main>
  )
}
