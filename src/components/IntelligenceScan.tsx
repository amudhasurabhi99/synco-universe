'use client'
import { useState, useCallback } from 'react'
import { T } from './tokens'
import { Card, Badge, Button, Label } from './ui'
import { useCount } from './hooks'

const STEPS = [
  'Authenticating with Notion workspace',
  'Fetching all PRDs from folder',
  'Querying Jira backlog & epics',
  'Scanning GitHub codebase',
  'Running semantic alignment with Claude',
  'Identifying gaps & drift',
  'Auto-creating & updating tickets',
]

const PID = process.env.NEXT_PUBLIC_NOTION_PARENT_PAGE_ID ?? ''

function ScoreCard({ value, label, color, animate }: any) {
  const v = useCount(value, 700, animate)
  const bgMap: Record<string,string> = {
    [T.green]: T.greenBg,
    [T.amber]: T.amberBg,
    [T.red]: T.redBg,
    [T.orange]: T.orangeLight,
  }
  const bg = bgMap[color] ?? T.bg2
  return (
    <div style={{
      background: bg,
      border: `1px solid ${T.b1}`,
      borderRadius: 10, padding: '16px 20px',
      textAlign: 'center',
    }}>
      <p className="mono" style={{ fontSize: 36, fontWeight: 600, color, lineHeight: 1, margin: '0 0 6px', letterSpacing: -1 }}>{v}%</p>
      <p style={{ fontSize: 11, color: T.t3, margin: 0, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

function MetricCard({ value, label, color, animate }: any) {
  const v = useCount(value, 700, animate)
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.b1}`, borderRadius: 10, padding: '14px 18px' }}>
      <p className="mono" style={{ fontSize: 26, fontWeight: 600, color, lineHeight: 1, margin: '0 0 6px', letterSpacing: -0.5 }}>{v}</p>
      <p style={{ fontSize: 11, color: T.t3, margin: 0, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

function GapList({ title, items, tone }: any) {
  const colors: any = {
    amber: { dot: T.amber, bg: T.amberBg, border: T.amberBorder, text: T.amber },
    red: { dot: T.red, bg: T.redBg, border: T.redBorder, text: T.red },
  }
  const c = colors[tone]
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, flex: 1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:c.dot, flexShrink:0 }}/>
        <Label color={c.text}>{title}</Label>
        <span style={{ marginLeft:'auto', fontSize:11, color:c.text, fontWeight:600 }}>{items.length}</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {items.map((it:string,i:number)=>(
          <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:T.t2, lineHeight:1.5 }}>
            <span style={{ color:c.dot, flexShrink:0, marginTop:2 }}>•</span>
            <span>{it}</span>
          </div>
        ))}
      </div>
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
    const iv = setInterval(()=>{ i++; if(i<STEPS.length) setStep(i) }, 700)
    try {
      const res = await fetch('/api/orchestrate/scan', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ parentPageId: PID })
      })
      const data = await res.json()
      clearInterval(iv)
      if (data.error) { setError(data.error); setRunning(false); setStep(-1); return }
      const a = data.analysis
      const sc = (n:number) => n>=80 ? T.green : n>=60 ? T.amber : T.red
      setResults({
        scores:[
          {value:a.overallScore??0, label:'Overall Alignment', color:sc(a.overallScore)},
          {value:a.prdVsJira?.score??0, label:'PRD vs Jira', color:sc(a.prdVsJira?.score)},
          {value:a.jiraVsCode?.score??0, label:'Jira vs Code', color:sc(a.jiraVsCode?.score)},
        ],
        metrics:[
          {value:data.prdPages?.length??0, label:'PRDs Scanned', color:T.orange},
          {value:data.createdTickets?.length??0, label:'Tickets Created', color:T.green},
          {value:data.updatedTickets?.length??0, label:'Tickets Updated', color:T.blue},
        ],
        prdGaps: a.prdVsJira?.gaps??[],
        codeGaps: a.jiraVsCode?.gaps??[],
        recs: a.recommendations??[],
        created: data.createdTickets??[],
        updated: data.updatedTickets?.length??0,
        prdPages: data.prdPages??[],
      })
      setLastScan(new Date().toLocaleString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}))
      setStep(STEPS.length)
      setTimeout(()=>{ setRunning(false); setStep(-1) }, 300)
    } catch(e:any) { clearInterval(iv); setError(e.message); setRunning(false); setStep(-1) }
  }, [])

  const animate = !running

  return (
    <Card style={{ animation: results ? 'fadeIn 300ms ease' : 'none' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:T.orange }}/>
            <Label color={T.orange}>Intelligence Scan</Label>
          </div>
          <p style={{ fontSize:13, color:T.t3, margin:0 }}>Reads all Notion PRDs · Scans GitHub codebase · Cross-checks Jira · Auto-creates missing tickets</p>
        </div>
        {lastScan && <span className="mono" style={{ fontSize:11, color:T.t4 }}>Last scan {lastScan}</span>}
      </div>

      <Button
        variant={running ? 'primary-loading' : 'primary'}
        size="lg"
        onClick={run}
        disabled={running}
        style={{ width:'100%', fontSize:14, fontWeight:600 }}
      >
        {running ? (
          <><svg width="14" height="14" viewBox="0 0 14 14" style={{animation:'spin 1s linear infinite'}}><circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none"/><path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>Scanning — {STEPS[step] ?? 'Finalizing'}</>
        ) : 'Run Intelligence Scan'}
      </Button>

      {running && (
        <div style={{ marginTop:16, background:T.bg2, borderRadius:10, border:`1px solid ${T.b1}`, padding:'10px 16px' }}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'5px 0' }}>
              <span style={{ width:12, height:12, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background: i<step ? T.green : i===step ? T.orange : T.b2,
                border: `1px solid ${i<step ? T.greenBorder : i===step ? T.orangeBorder : T.b2}`,
              }}>
                {i < step && <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1.5 3.5 L3 5 L5.5 2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
              <span style={{ fontSize:13, color: i<=step ? T.t1 : T.t4, transition:'color 200ms' }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ marginTop:14, background:T.redBg, border:`1px solid ${T.redBorder}`, borderRadius:8, padding:'10px 14px', fontSize:13, color:T.red }}>{error}</div>
      )}

      {!running && results && (
        <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:16, animation:'fadeIn 400ms ease' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {results.scores.map((s:any)=><ScoreCard key={s.label} {...s} animate={animate}/>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {results.metrics.map((m:any)=><MetricCard key={m.label} {...m} animate={animate}/>)}
          </div>

          {results.prdPages?.length>0 && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {results.prdPages.map((p:string,i:number)=>(
                <span key={i} style={{ fontSize:12, color:T.t2, background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:20, padding:'3px 10px' }}>📄 {p}</span>
              ))}
            </div>
          )}

          {results.created?.length>0 && (
            <div style={{ background:T.greenBg, border:`1px solid ${T.greenBorder}`, borderRadius:8, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={T.green} strokeWidth="1.2" fill={T.greenBg}/><path d="M4 7.2 L6 9 L10 5" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              <span style={{ fontSize:13, color:T.green, fontWeight:500 }}>Auto-created {results.created.length} tickets</span>
              <span style={{ color:T.t4 }}>·</span>
              <span style={{ fontSize:13, color:T.t3 }}>Updated {results.updated} existing</span>
              <span className="mono" style={{ fontSize:11, color:T.green }}>{results.created.slice(0,5).join(', ')}{results.created.length>5?` +${results.created.length-5} more`:''}</span>
            </div>
          )}

          <button onClick={()=>setShowGaps(s=>!s)} style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'10px 14px', background:T.bg2, border:`1px solid ${T.b1}`,
            borderRadius:8, cursor:'pointer', color:T.t2, fontSize:13, textAlign:'left',
            transition:'all 150ms',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform:showGaps?'rotate(90deg)':'rotate(0)', transition:'transform 200ms ease', flexShrink:0 }}>
              <path d="M3 2 L7 5 L3 8" stroke={T.t3} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Gaps & recommendations</span>
            <span style={{ marginLeft:4, fontSize:11, background:T.amberBg, color:T.amber, border:`1px solid ${T.amberBorder}`, borderRadius:20, padding:'2px 7px', fontWeight:500 }}>{results.prdGaps.length}</span>
            <span style={{ fontSize:11, background:T.redBg, color:T.red, border:`1px solid ${T.redBorder}`, borderRadius:20, padding:'2px 7px', fontWeight:500 }}>{results.codeGaps.length}</span>
            <span style={{ marginLeft:'auto', fontSize:12, color:T.t4 }}>{showGaps?'Hide':'Show'}</span>
          </button>

          {showGaps && (
            <div style={{ display:'flex', flexDirection:'column', gap:14, animation:'fadeIn 200ms ease' }}>
              <div style={{ display:'flex', gap:12 }}>
                <GapList tone="amber" title="PRD → Jira Gaps" items={results.prdGaps}/>
                <GapList tone="red" title="Jira → Code Gaps" items={results.codeGaps}/>
              </div>
              {results.recs?.length>0 && (
                <div style={{ borderLeft:`2px solid ${T.orange}`, paddingLeft:16, display:'flex', flexDirection:'column', gap:6 }}>
                  <Label color={T.orange} style={{ marginBottom:4 }}>Recommendations</Label>
                  {results.recs.map((r:string,i:number)=>(
                    <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:T.t2, lineHeight:1.55 }}>
                      <span style={{ color:T.orange, flexShrink:0 }}>→</span><span>{r}</span>
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
