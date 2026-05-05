'use client'
import { useState } from 'react'
import { T } from './tokens'
import { Card, Badge, Button, SectionLabel } from './ui'
import { useCount } from './hooks'

export default function WeeklyReport() {
  const [state, setState] = useState<'ready'|'loading'|'done'>('ready')
  const [stage, setStage] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const generate = async () => {
    setState('loading'); setStage(0); setError('')
    setTimeout(()=>setStage(1),2000)
    try {
      const res = await fetch('/api/orchestrate/report',{method:'POST'})
      const data = await res.json()
      if (data.error) { setError(data.error); setState('ready'); return }
      setResult(data); setState('done')
    } catch(e:any) { setError(e.message); setState('ready') }
  }

  const isLoading = state==='loading'
  const completion = useCount(result?.stats?.completion??0,800,state==='done')

  return (
    <Card accent="purple" padding="20px 24px" radius={16} style={{ display:'flex', flexDirection:'column', gap:16, minHeight:480 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:T.purple, boxShadow:'0 0 0 2px rgba(139,92,246,0.2)' }}/>
        <SectionLabel color={T.purple}>Weekly Report</SectionLabel>
        <span style={{ marginLeft:'auto', fontSize:11, color:T.t3 }}>AI-generated from live Jira data</span>
      </div>

      <Button variant={isLoading?'purple-grad-loading':'purple-grad'} size="hero" onClick={generate} disabled={isLoading} style={{ width:'100%' }}>
        {isLoading ? (
          <><svg width="14" height="14" viewBox="0 0 14 14" style={{ animation:'spin 1s linear infinite' }}><circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none"/><path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg><span>{['Gathering data...','Writing report...'][stage]}</span></>
        ) : state==='done'?'Regenerate Report':'Generate Report Now'}
      </Button>

      {error && <div style={{ background:T.redBg, border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, padding:'10px 14px', fontSize:13, color:T.red }}>{error}</div>}

      {state==='done' && result && (
        <div style={{ background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:12, padding:18, display:'flex', flexDirection:'column', gap:14, animation:'fadeIn 300ms ease' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ flex:1, fontSize:16, fontWeight:500, color:'rgba(255,255,255,0.9)', lineHeight:1.4 }}>{result.report.headline}</div>
            <Badge tone={result.report.driftScore>=80?'green':result.report.driftScore>=60?'amber':'red'} style={{ flexShrink:0 }}>Drift {result.report.driftScore}</Badge>
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:11, color:T.t3, letterSpacing:0.4, textTransform:'uppercase' }}>Completion</span>
              <span className="mono" style={{ fontSize:11, color:T.blue }}>{Math.round(completion)}%</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:999, overflow:'hidden' }}>
              <div style={{ width:`${completion}%`, height:'100%', background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', borderRadius:999, transition:'width 200ms ease' }}/>
            </div>
          </div>
          <div style={{ fontSize:13, color:T.t2, lineHeight:1.7 }}>{result.report.progressNarrative}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <SectionLabel color={T.amber}>Risks</SectionLabel>
            {result.report.risks.map((r:string,i:number)=>(
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:13, color:T.t2 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ flex:'0 0 auto', marginTop:2 }}>
                  <path d="M7 1.5 L13 12 L1 12 Z" stroke={T.amber} strokeWidth="1.3" fill="rgba(245,158,11,0.12)" strokeLinejoin="round"/>
                  <path d="M7 5.5 L7 8.5" stroke={T.amber} strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="7" cy="10.3" r="0.7" fill={T.amber}/>
                </svg>
                <span>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ borderLeft:`2px solid ${T.blue}`, paddingLeft:14, fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.6 }}>
            <SectionLabel color={T.blue} style={{ display:'block', marginBottom:4 }}>Recommendation</SectionLabel>
            {result.report.recommendation}
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:'auto' }}>
        {[
          {v:result?.stats?.delivered??0,label:'Shipped',c:T.green},
          {v:result?.stats?.inProgress??0,label:'In flight',c:T.blue},
          {v:result?.stats?.total??0,label:'Total',c:T.t2},
          {v:result?.stats?.completion??0,label:'% Done',c:T.purple},
        ].map(s=>(
          <div key={s.label} style={{ background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:8, padding:'12px 14px' }}>
            <div className="mono" style={{ fontSize:24, fontWeight:500, color:s.c, lineHeight:1, letterSpacing:-0.5 }}>{s.v}</div>
            <div style={{ fontSize:10, color:T.t3, marginTop:6, letterSpacing:0.5, textTransform:'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
