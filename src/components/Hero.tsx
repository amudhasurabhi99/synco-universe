'use client'
import { T } from './tokens'

export default function Hero({ stats }: { stats:{label:string,value:string,color:string}[] }) {
  return (
    <div style={{ padding:'32px 32px 0', display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:24 }}>
      <div>
        <p style={{ fontSize:11, fontWeight:500, letterSpacing:1, textTransform:'uppercase', color:T.t4, margin:'0 0 8px' }}>Intelligence Layer</p>
        <h1 style={{ fontSize:30, fontWeight:600, color:T.t1, margin:0, letterSpacing:-0.5, lineHeight:1.2 }}>Project Alignment</h1>
        <p style={{ fontSize:14, color:T.t3, margin:'6px 0 0', lineHeight:1.5 }}>Notion PRDs · GitHub · Jira — kept in sync automatically</p>
      </div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        {stats.map(s=>(
          <div key={s.label} style={{
            background: '#fff',
            border: `1px solid ${T.b1}`,
            borderRadius: 10,
            padding: '10px 16px',
            minWidth: 110,
          }}>
            <p style={{ fontSize:10, color:T.t4, letterSpacing:0.6, textTransform:'uppercase', margin:'0 0 4px' }}>{s.label}</p>
            <p className="mono" style={{ fontSize:13, fontWeight:500, color:s.color, margin:0 }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
