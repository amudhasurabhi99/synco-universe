'use client'
import { useState, useCallback } from 'react'
import { T } from './tokens'
import { Card, Badge, Button, SectionLabel } from './ui'
import { useCount } from './hooks'

const STEPS = ['Authenticating with Notion workspace','Fetching all PRDs from folder','Querying Jira backlog & epics','Scanning GitHub codebase','Running semantic alignment (Claude)','Identifying gaps & drift','Auto-creating & updating tickets']
const PID = process.env.NEXT_PUBLIC_NOTION_PARENT_PAGE_ID ?? ''

function ScanStep({ label, state, idx }: { label:string, state:string, idx:number }) {
  const active = state==='active', done = state==='done'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 4px' }}>
      <span style={{ width:14, height:14, borderRadius:'50%', background:done?T.green:active?T.blue:'rgba(255,255,255,0.08)', border:`1px solid ${done?T.green:active?T.blue:T.b1}`, display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto', transition:'all 200ms ease' }}>
        {done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4 L3.3 5.8 L6.5 2.2" stroke="#0a0a0f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {active && <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"><animateTransform attributeName="transform" type="rotate" from="0 4 4" to="360 4 4" dur="0.9s" repeatCount="indefinite"/></circle></svg>}
      </span>
      <span className="mono" style={{ fontSize:11, color:T.t4, width:22 }}>{String(idx+1).padStart(2,'0')}</span>
      <span style={{ fontSize:13, color:done?T.t2:active?T.t1:T.t3, transition:'color 200ms ease' }}>{label}</span>
    </div>
  )
}

function ScoreCard({ value, label, color, animate }: any) {
  const v = useCount(value, 800, animate)
  return (
    <div style={{ background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:12, padding:'20px 16px', textAlign:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:color }} />
      <div className="mono" style={{ fontSize:40, fontWeight:600, color, lineHeight:1, letterSpacing:-1 }}>{Math.round(v)}</div>
      <div style={{ fontSize:11, color:T.t3, marginTop:8, letterSpacing:0.3 }}>{label}</div>
    </div>
  )
}

function MiniMetric({ value, label, color, animate }: any) {
  const v = useCount(value, 800, animate)
  return (
    <div style={{ background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:8, padding:'14px 16px' }}>
      <div className="mono" style={{ fontSize:28, fontWeight:500, color, lineHeight:1, letterSpacing:-0.5 }}>{Math.round(v)}</div>
      <div style={{ fontSize:10, color:T.t3, marginTop:6, letterSpacing:0.5, textTransform:'uppercase' }}>{label}</div>
    </div>
  )
}

function GapsPanel({ tone, title, items }: any) {
  const dot = tone==='amber'?T.amber:T.red
  return (
    <div style={{ background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:12, padding:16, flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:dot }} />
        <span style={{ fontSize:11, fontWeight:500, letterSpacing:0.5, color:dot, textTransform:'uppercase' }}>{title}</span>
        <Badge tone={tone} style={{ marginLeft:'auto' }}>{items.length}</Badge>
      </div>
      <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
        {items.map((it:string,i:number)=>(
          <li key={i} style={{ display:'flex', gap:10, fontSize:13, color:T.t2, lineHeight:1.55 }}>
            <span style={{ color:dot, flex:'0 0 auto', marginTop:2 }}>•</span><span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function IntelligenceScan() {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(-1)
  const [showGaps, setShowGaps] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')
  const [lastScan, setLastScan] = useState<string|null>(null)

  const run = useCallback(async () => {
    setRunning(true); setStep(0); setShowGaps(false); setError('')
    let i = 0
    const interval = setInterval(()=>{ i++; if(i<STEPS.length) setStep(i) }, 600)
    try {
      const res = await fetch('/api/orchestrate/scan', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({parentPageId:PID}) })
      const data = await res.json()
      clearInterval(interval)
      if (data.error) { setError(data.error); setRunning(false); setStep(-1); return }
      const a = data.analysis
      const sc = (n:number) => n>=80?T.green:n>=60?T.amber:T.red
      setResults({
        scores:[
          {value:a.overallScore??0,label:'Drift Score',color:sc(a.overallScore)},
          {value:a.prdVsJira?.score??0,label:'PRD Coverage',color:sc(a.prdVsJira?.score)},
          {value:a.jiraVsCode?.score??0,label:'Code Alignment',color:sc(a.jiraVsCode?.score)},
        ],
        metrics:[
          {value:data.prdPages?.length??0,label:'PRDs Scanned',color:T.blue},
          {value:data.createdTickets?.length??0,label:'Tickets Created',color:T.green},
          {value:data.updatedTickets?.length??0,label:'Tickets Updated',color:T.amber},
        ],
        prdGaps:a.prdVsJira?.gaps??[],
        codeGaps:a.jiraVsCode?.gaps??[],
        recs:a.recommendations??[],
        created:data.createdTickets??[],
        updated:data.updatedTickets?.length??0,
        prdPages:data.prdPages??[],
      })
      setLastScan(new Date().toLocaleString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}))
      setStep(STEPS.length)
      setTimeout(()=>{ setRunning(false); setStep(-1) }, 400)
    } catch(e:any) { clearInterval(interval); setError(e.message); setRunning(false); setStep(-1) }
  }, [])

  const animate = !running

  return (
    <Card accent="blue" padding="20px 24px" radius={16}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:T.blue, boxShadow:'0 0 0 2px rgba(59,130,246,0.2),0 0 12px rgba(59,130,246,0.4)' }} />
        <SectionLabel color={T.blue}>Intelligence Scan</SectionLabel>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Reads PRDs, tickets, and commits — produces alignment delta</span>
        {lastScan && <span className="mono" style={{ marginLeft:'auto', fontSize:11, color:T.t3 }}>last scan · {lastScan}</span>}
      </div>

      <Button variant={running?'primary-loading':'primary'} size="hero" onClick={run} disabled={running} style={{ width:'100%', fontSize:14 }}>
        {running ? (
          <><svg width="14" height="14" viewBox="0 0 14 14" style={{ animation:'spin 1s linear infinite' }}><circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none"/><path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg><span>Scanning · {STEPS[step]||'Finalizing'}</span></>
        ) : 'Run Intelligence Scan'}
      </Button>

      {error && <div style={{ marginTop:12, background:T.redBg, border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, padding:'10px 14px', fontSize:13, color:T.red }}>{error}</div>}

      {running && (
        <div style={{ marginTop:16, background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:12, padding:'12px 16px' }}>
          {STEPS.map((s,i)=><ScanStep key={i} idx={i} label={s} state={i<step?'done':i===step?'active':'pending'}/>)}
        </div>
      )}

      {!running && results && (
        <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {results.scores.map((s:any)=><ScoreCard key={s.label} {...s} animate={animate}/>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {results.metrics.map((m:any)=><MiniMetric key={m.label} {...m} animate={animate}/>)}
          </div>
          {results.prdPages?.length>0 && (
            <div style={{ background:T.blueBg, border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, padding:'10px 14px', display:'flex', gap:12, flexWrap:'wrap', fontSize:12 }}>
              {results.prdPages.map((p:string,i:number)=><span key={i} style={{ color:T.blue }}>📄 {p}</span>)}
            </div>
          )}
          {results.created?.length>0 && (
            <div style={{ background:'rgba(34,197,94,0.10)', border:`1px solid rgba(34,197,94,0.3)`, borderRadius:8, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={T.green} strokeWidth="1.2" fill="rgba(34,197,94,0.15)"/><path d="M4 7.2 L6.2 9.2 L10 5" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              <span style={{ color:T.t1, fontWeight:500 }}>Auto-created {results.created.length} tickets</span>
              <span style={{ color:T.t3 }}>·</span>
              <span style={{ color:T.t2 }}>Updated {results.updated}:</span>
              <span className="mono" style={{ color:T.green, fontSize:11 }}>{results.created.slice(0,4).join(', ')}{results.created.length>4?` +${results.created.length-4} more`:''}</span>
            </div>
          )}
          <button onClick={()=>setShowGaps(s=>!s)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:8, cursor:'pointer', color:T.t2, fontSize:12, textAlign:'left' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform:showGaps?'rotate(90deg)':'rotate(0)', transition:'transform 200ms ease' }}><path d="M3 2 L7 5 L3 8" stroke={T.t2} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Gaps & recommendations</span>
            <Badge tone="amber" style={{ marginLeft:4 }}>{results.prdGaps.length}</Badge>
            <Badge tone="red">{results.codeGaps.length}</Badge>
            <span style={{ marginLeft:'auto', color:T.t3, fontSize:11 }}>{showGaps?'Hide':'Show'}</span>
          </button>
          {showGaps && (
            <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeIn 240ms ease' }}>
              <div style={{ display:'flex', gap:12 }}>
                <GapsPanel tone="amber" title="PRD vs JIRA GAPS" items={results.prdGaps}/>
                <GapsPanel tone="red" title="JIRA vs CODE GAPS" items={results.codeGaps}/>
              </div>
              {results.recs?.length>0 && (
                <div style={{ borderLeft:`2px solid ${T.blue}`, paddingLeft:16, display:'flex', flexDirection:'column', gap:8 }}>
                  <SectionLabel color={T.blue} style={{ marginBottom:2 }}>Recommendations</SectionLabel>
                  {results.recs.map((r:string,i:number)=>(
                    <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:T.t2, lineHeight:1.55 }}>
                      <span style={{ color:T.blue, flex:'0 0 auto' }}>→</span><span>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
