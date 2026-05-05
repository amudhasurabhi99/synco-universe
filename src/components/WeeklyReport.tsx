'use client'
import { useState } from 'react'
import { T } from './tokens'
import { Card, Badge, Button, Label } from './ui'
import { useCount } from './hooks'

export default function WeeklyReport() {
  const [state, setState] = useState<'ready'|'loading'|'done'>('ready')
  const [stage, setStage] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const generate = async () => {
    setState('loading'); setStage(0); setError('')
    setTimeout(()=>setStage(1), 2500)
    try {
      const res = await fetch('/api/orchestrate/report',{method:'POST'})
      const data = await res.json()
      if (data.error) { setError(data.error); setState('ready'); return }
      setResult(data); setState('done')
    } catch(e:any) { setError(e.message); setState('ready') }
  }

  const isLoading = state==='loading'
  const completion = useCount(result?.stats?.completion??0, 700, state==='done')
  const drift = result?.report?.driftScore ?? 0
  const driftTone = drift>=80?'green':drift>=60?'amber':'red'

  return (
    <Card style={{ display:'flex', flexDirection:'column', gap:16, minHeight:480 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:T.purple }}/>
        <Label color={T.purple}>Weekly Report</Label>
        <span style={{ marginLeft:'auto', fontSize:12, color:T.t4 }}>AI-generated from live Jira data</span>
      </div>

      <Button
        variant={isLoading?'purple-grad-loading':'purple-grad'}
        size="lg"
        onClick={generate}
        disabled={isLoading}
        style={{ width:'100%', fontWeight:600 }}
      >
        {isLoading ? (
          <><svg width="14" height="14" viewBox="0 0 14 14" style={{animation:'spin 1s linear infinite'}}><circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none"/><path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>{['Gathering project data...','Writing report...'][stage]}</>
        ) : state==='done' ? 'Regenerate Report' : 'Generate Report Now'}
      </Button>

      {error && <div style={{ background:T.redBg, border:`1px solid ${T.redBorder}`, borderRadius:8, padding:'10px 14px', fontSize:13, color:T.red }}>{error}</div>}

      {state==='done' && result && (
        <div style={{ display:'flex', flexDirection:'column', gap:14, animation:'fadeIn 300ms ease' }}>
          <div style={{ background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:10, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
              <p style={{ flex:1, fontSize:15, fontWeight:500, color:T.t1, lineHeight:1.5, margin:0 }}>{result.report.headline}</p>
              <Badge tone={driftTone} style={{ flexShrink:0 }}>Drift {drift}</Badge>
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:T.t4, letterSpacing:0.5, textTransform:'uppercase', fontWeight:500 }}>Completion</span>
                <span className="mono" style={{ fontSize:11, color:T.blue }}>{Math.round(completion)}%</span>
              </div>
              <div style={{ height:5, background:T.bg3, borderRadius:999, overflow:'hidden' }}>
                <div style={{ width:`${completion}%`, height:'100%', background:`linear-gradient(90deg,${T.blue},${T.purple})`, borderRadius:999, transition:'width 300ms ease' }}/>
              </div>
            </div>

            <p style={{ fontSize:13, color:T.t2, lineHeight:1.7, margin:0 }}>{result.report.progressNarrative}</p>

            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <Label color={T.amber}>Risks</Label>
              {result.report.risks.map((r:string,i:number)=>(
                <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', fontSize:13, color:T.t2 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink:0, marginTop:1 }}>
                    <path d="M7 1.5 L13 12 L1 12 Z" stroke={T.amber} strokeWidth="1.2" fill={T.amberBg} strokeLinejoin="round"/>
                    <path d="M7 5.5 L7 8.5" stroke={T.amber} strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="7" cy="10.3" r="0.7" fill={T.amber}/>
                  </svg>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div style={{ borderLeft:`2px solid ${T.orange}`, paddingLeft:12, fontSize:13, color:T.t2, lineHeight:1.6 }}>
              <Label color={T.orange} style={{ display:'block', marginBottom:4 }}>Recommendation</Label>
              {result.report.recommendation}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {[
              {v:result.stats.delivered, label:'Shipped', c:T.green},
              {v:result.stats.inProgress, label:'In flight', c:T.blue},
              {v:result.stats.total, label:'Total', c:T.t2},
              {v:result.stats.completion+'%', label:'Done', c:T.purple},
            ].map(s=>(
              <div key={s.label} style={{ background:'#fff', border:`1px solid ${T.b1}`, borderRadius:8, padding:'12px 14px' }}>
                <p className="mono" style={{ fontSize:22, fontWeight:600, color:s.c, lineHeight:1, margin:'0 0 4px', letterSpacing:-0.5 }}>{s.v}</p>
                <p style={{ fontSize:10, color:T.t4, margin:0, letterSpacing:0.5, textTransform:'uppercase', fontWeight:500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
