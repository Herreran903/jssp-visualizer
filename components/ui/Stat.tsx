 // components/ui/Stat.tsx
 type StatProps = { label: string; value: string | number; help?: string }
 export default function Stat({ label, value, help }: StatProps) {
   return (
     <div
       className="px-6 py-3 text-center border-b border-dashed border-black/10 bg-transparent rounded-none shadow-none"
       title={help}
       aria-label={help ? `${label}: ${help}` : label}
     >
       <div className="text-3xl font-extrabold text-slate-800 font-hand">{value}</div>
       <div className="text-xs text-slate-700 font-hand uppercase tracking-wide">{label}</div>
     </div>
   )
 }
