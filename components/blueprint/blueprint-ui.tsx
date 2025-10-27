'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Play, ArrowLeft } from 'lucide-react'

interface BlueprintUIProps {
  isSolved: boolean;
  setIsSolved: (value: boolean) => void;
}

export function BlueprintUI({ isSolved, setIsSolved }: BlueprintUIProps) {
  const sheetVariants = {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -50 },
  }

  return (
    <AnimatePresence mode="wait">
      {!isSolved ? (
        <motion.section
          key="config"
          className="
            blueprint-sheet
            w-[900px] h-[560px]
            p-10 md:p-12
            flex flex-col items-center justify-center text-center
            font-handwriting text-white hand-stroke
          "
          variants={sheetVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Título sin caja + subrayado “a mano” */}
          <h1 className="text-6xl md:text-7xl mb-3 scribble-underline">
            CONFIGURAR
          </h1>

          {/* Descripción corta, centrada, sin contenedores con borde */}
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Cargue la instancia del problema y ajuste los parámetros.
          </p>

          {/* Línea trazada (opcional) */}
          <div className="hr-sketched mb-8" />

          {/* Botón ENORME solo texto (sin caja), centrado */}
          <button
            className="btn-giant-text font-handwriting hand-stroke text-white
                       flex items-center justify-center gap-3
                       text-5xl md:text-6xl"
            onClick={() => setIsSolved(true)}
            aria-label="Ejecutar"
          >
            <Play size={42} />
            EJECUTAR
          </button>
        </motion.section>
      ) : (
        <motion.section
          key="results"
          className="
            blueprint-sheet
            w-[960px] h-[560px]
            p-10 md:p-12
            flex flex-col items-center justify-center text-center
            font-handwriting text-white hand-stroke
          "
          variants={sheetVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <h1 className="text-6xl md:text-7xl mb-3 scribble-underline">
            RESULTADOS
          </h1>

          <p className="text-xl md:text-2xl opacity-90 mb-8">
            (Aquí se renderizará el Diagrama de Gantt)
          </p>

          <div className="hr-sketched mb-8" />

          {/* “Volver” también solo texto */}
          <button
            className="btn-giant-text font-handwriting hand-stroke text-white
                       flex items-center justify-center gap-2
                       text-3xl md:text-4xl"
            onClick={() => setIsSolved(false)}
            aria-label="Volver"
          >
            <ArrowLeft size={28} />
            Volver
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
