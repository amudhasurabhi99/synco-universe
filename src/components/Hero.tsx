'use client'
import { T } from './tokens'

export default function Hero({ stats }: { stats:{label:string,value:string,color:string}[] }) {
  return (
    <div style={{ padding:'24px 32px 0', display:'flex', alignItems:'flex-end', gap:32, flexWrap:'wrap' }}>
      <div style={{ flex:'1 1 360px' }}>
        <div style={{ fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:T.t3, marginBottom:12, fontWeight:500 }}>Intelligence Layer</div>
        <h1 style={{ fontSize:28, fontWeight:500, color:T.t1, margin:0, letterSpacing:-0.4, lineHeight:1.15 }}>Project Alignment</h1>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:6 }}>Notion PRDs · GitHub · Jira — kept in sync automatically</div>
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {stats.map(s=>(
          <div key={s.label} style={{ background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:8, padding:'12px 16px', display:'flex', flexDirection:'column', gap:4, minWidth:120 }}>
            <div style={{ fontSize:10, color:T.t3, letterSpacing:0.5, textTransform:'uppercase' }}>{s.label}</div>
            <div className="mono" style={{ fontSize:12, fontWeight:500, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
