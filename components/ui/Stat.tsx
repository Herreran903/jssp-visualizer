 // components/ui/Stat.tsx
 export default function Stat({ label, value }: { label: string; value: string | number }) {
   return (
     <div className="px-6 py-3 text-center border-b border-dashed border-black/10 bg-transparent rounded-none shadow-none">
       <div className="text-3xl font-extrabold text-slate-800 font-hand">{value}</div>
       <div className="text-xs text-slate-700 font-hand uppercase tracking-wide">{label}</div>
     </div>
   )
 }
