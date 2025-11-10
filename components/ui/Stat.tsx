 // components/ui/Stat.tsx
 export default function Stat({ label, value }: { label: string; value: string | number }) {
   return (
     <div className="rounded-md border border-slate-200 bg-white p-3 text-center shadow-sm">
       <div className="text-2xl font-bold text-slate-900">{value}</div>
       <div className="text-xs text-slate-500">{label}</div>
     </div>
   )
 }
