'use client'
import { T } from './tokens'

export default function Hero({ stats }: { stats:{label:string,value:string,color:string}[] }) {
  return (
    <div style={{ padding:'32px 32px 0' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:24, marginBottom:20 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:500, letterSpacing:1, textTransform:'uppercase', color:T.t4, margin:'0 0 8px' }}>Intelligence Layer</p>
          <h1 style={{ fontSize:30, fontWeight:600, color:T.t1, margin:0, letterSpacing:-0.5, lineHeight:1.2 }}>Project Alignment</h1>
          <p style={{ fontSize:14, color:T.t3, margin:'6px 0 0' }}>Notion PRDs · GitHub · Jira — kept in sync automatically</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {stats.map(s=>(
            <div key={s.label} style={{ background:'#fff', border:`1px solid ${T.b1}`, borderRadius:10, padding:'10px 16px', minWidth:110 }}>
              <p style={{ fontSize:10, color:T.t4, letterSpacing:0.6, textTransform:'uppercase', margin:'0 0 4px', fontWeight:500 }}>{s.label}</p>
              <p className="mono" style={{ fontSize:13, fontWeight:500, color:s.color, margin:0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Impact bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
        background: '#fff',
        border: `1px solid ${T.b1}`,
        borderRadius: 10,
        padding: '14px 20px',
        marginTop: 4,
      }}>
        {[
          { metric: '7 hrs', label: 'saved per sprint', sub: 'per PM', color: T.orange },
          { metric: '35 hrs', label: 'saved per week', sub: '5-person team', color: T.green },
          { metric: '$91k', label: 'annual saving', sub: 'at $100/hr loaded cost', color: T.blue },
          { metric: '1 click', label: 'to full alignment', sub: 'zero manual input', color: T.purple },
        ].map(s => (
          <div key={s.label} style={{ display:'flex', flexDirection:'column', gap:2 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <span className="mono" style={{ fontSize:20, fontWeight:600, color:s.color, letterSpacing:-0.5 }}>{s.metric}</span>
              <span style={{ fontSize:11, color:T.t3 }}>{s.label}</span>
            </div>
            <span style={{ fontSize:11, color:T.t4 }}>{s.sub}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
