// components/ui/InstancePreviewModal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { LocalInstance } from "../../types/domain";
import Button from "./Button";
import Tabs from "./Tabs";

interface InstancePreviewModalProps {
  instance: LocalInstance | null;
  onClose: () => void;
}

export default function InstancePreviewModal({
  instance,
  onClose,
}: InstancePreviewModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Reset to metadata tab cuando cambia la instancia
    if (instance) {
      setActiveTab(0);
    }
  }, [instance]);

  if (!instance || !mounted) return null;

  const { metadata, content } = instance;
  const tabs = ["Metadatos", "Contenido", "Validación"];

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-(--color-surface) w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col elevation-2 ring-1 ring-(--color-border-subtle)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-(--color-surface-alt) border-b border-(--color-border-subtle)">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold font-title tracking-tight text-(--color-text-primary)">
              {metadata.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-(--overlay-08) rounded transition-colors text-(--color-text-secondary) focus-visible:ring-2 focus-visible:ring-(--color-accent)"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex gap-2 items-center text-sm font-hand uppercase text-slate-600">
            <span
              className={`badge ${
                metadata.problemType === "jssp_maint"
                  ? "badge--type-maint"
                  : "badge--type-tard"
              }`}
            >
              {metadata.problemType === "jssp_maint"
                ? "JSSP Mantenimiento"
                : "Tardanza Ponderada"}
            </span>
            <span
              className={`badge ${
                metadata.validated ? "badge--success" : "badge--danger"
              }`}
            >
              {metadata.validated ? "✓ Validado" : "✗ Con errores"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-(--color-border-subtle)">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 0 && (
            <div className="space-y-4 font-hand">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase">ID</div>
                  <div className="text-sm font-mono">{metadata.id}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">Tamaño</div>
                  <div className="text-sm">
                    {Math.round(metadata.size / 1024)} KB
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">
                    Fecha de Creación
                  </div>
                  <div className="text-sm">
                    {new Date(metadata.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase">
                    Tipo de Problema
                  </div>
                  <div className="text-sm uppercase">
                    {metadata.problemType}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="text-sm font-bold uppercase mb-3">
                  Dimensiones
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Jobs</div>
                    <div className="text-2xl font-bold">
                      {metadata.jobs || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Máquinas
                    </div>
                    <div className="text-2xl font-bold">
                      {metadata.machines || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Operaciones
                    </div>
                    <div className="text-2xl font-bold">
                      {metadata.operations || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="font-mono text-xs">
              <pre className="bg-(--color-surface-alt) p-4 rounded border border-(--color-border-subtle) overflow-x-auto whitespace-pre-wrap wrap-break-word text-(--color-text-primary)">
                {content}
              </pre>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4 font-hand">
              <div
                className={`p-4 rounded ${
                  metadata.validated
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div
                  className={`font-bold uppercase ${
                    metadata.validated ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {metadata.validated
                    ? "✓ Instancia Válida"
                    : "✗ Instancia con Errores"}
                </div>
              </div>

              {metadata.validationErrors &&
                metadata.validationErrors.length > 0 && (
                  <div>
                    <div className="font-bold uppercase text-red-700 mb-2">
                      Errores de Validación:
                    </div>
                    <ul className="space-y-2">
                      {metadata.validationErrors.map((error, i) => (
                        <li
                          key={i}
                          className="text-sm text-red-600 flex items-start gap-2"
                        >
                          <span className="text-red-400">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {metadata.validated && (
                <div className="text-sm text-slate-600">
                  Esta instancia ha pasado todas las validaciones y está lista
                  para ser ejecutada.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-(--color-border-subtle) flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
