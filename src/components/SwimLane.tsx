'use client'
import { useState, useEffect } from 'react'
import { T } from './tokens'
import { Card, Badge, Button, SectionLabel } from './ui'

const REASONS = [
  {value:'prd-stale',label:'PRD is out of date'},
  {value:'wont-fix',label:"Won't fix this cycle"},
  {value:'false-positive',label:'False positive'},
  {value:'tracked-elsewhere',label:'Tracked elsewhere'},
]

function ConfBar({ value }: { value:number }) {
  const c = value>=80?T.green:value>=60?T.amber:T.red
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ flex:1, height:4, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
        <div style={{ width:`${value}%`, height:'100%', borderRadius:999, background:c, transition:'width 600ms cubic-bezier(0.22,1,0.36,1)' }}/>
      </div>
      <span className="mono" style={{ fontSize:11, color:c, fontWeight:500, minWidth:56, textAlign:'right' }}>{value}% conf</span>
    </div>
  )
}

function FlagCard({ flag, idx, fading, onAgree, onDismiss }: any) {
  const [dismissing, setDismissing] = useState(false)
  const [reason, setReason] = useState(REASONS[0].value)
  return (
    <div style={{ background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:12, padding:16, display:'flex', flexDirection:'column', gap:12, animation:`slideInLeft 320ms ease ${idx*40}ms backwards`, opacity:fading?0.4:1, transition:'opacity 240ms ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <Badge tone="blue" style={{ fontFamily:'JetBrains Mono,monospace' }}>{flag.jiraKey}</Badge>
        <span style={{ fontSize:12, color:T.t3 }}>↔</span>
        <span style={{ fontSize:12, color:T.t3 }}>{flag.prdRef}</span>
        <span className="mono" style={{ marginLeft:'auto', fontSize:11, color:T.t3 }}>{new Date(flag.createdAt).toLocaleTimeString()}</span>
      </div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.55 }}>{flag.description}</div>
      <ConfBar value={Math.round(flag.confidence*100)}/>
      {!dismissing ? (
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="tone" tone="green" size="compact" onClick={()=>onAgree(flag.id)} disabled={fading} style={{ flex:1 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Agree · Open as work
          </Button>
          <Button variant="tone" tone="red" size="compact" onClick={()=>setDismissing(true)} disabled={fading} style={{ flex:1 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Dismiss
          </Button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8, animation:'fadeIn 200ms ease' }}>
          <select value={reason} onChange={e=>setReason(e.target.value)} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid rgba(255,255,255,0.08)`, borderRadius:8, padding:'8px 12px', color:T.t1, fontSize:13, fontFamily:'inherit', outline:'none' }}>
            {REASONS.map(r=><option key={r.value} value={r.value} style={{ background:T.bg1 }}>{r.label}</option>)}
          </select>
          <div style={{ display:'flex', gap:8 }}>
            <Button variant="secondary" size="compact" onClick={()=>{ setDismissing(false); setReason(REASONS[0].value) }} style={{ flex:1 }}>Cancel</Button>
            <Button variant="tone" tone="red" size="compact" onClick={()=>{ onDismiss(flag.id, reason); setDismissing(false) }} style={{ flex:1 }}>Confirm dismiss</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SwimLane() {
  const [flags, setFlags] = useState<any[]>([])
  const [fading, setFading] = useState<string[]>([])
  const [showResolved, setShowResolved] = useState(false)

  const fetchFlags = async () => { try { const r = await fetch('/api/swimlane'); setFlags(await r.json()) } catch {} }
  useEffect(() => { fetchFlags(); const id=setInterval(fetchFlags,10000); return ()=>clearInterval(id) }, [])

  const agree = async (id:string) => {
    setFading(f=>[...f,id])
    await fetch(`/api/swimlane/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'agree'})})
    setTimeout(()=>{ fetchFlags(); setFading(f=>f.filter(x=>x!==id)) },400)
  }
  const dismiss = async (id:string, reason:string) => {
    setFading(f=>[...f,id])
    await fetch(`/api/swimlane/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'dismiss',reason})})
    setTimeout(()=>{ fetchFlags(); setFading(f=>f.filter(x=>x!==id)) },400)
  }

  const open = flags.filter(f=>f.status==='open')
  const resolved = flags.filter(f=>f.status!=='open')

  return (
    <Card accent="red" padding="20px 24px" radius={16} style={{ display:'flex', flexDirection:'column', gap:16, minHeight:480 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:T.red, boxShadow:'0 0 0 2px rgba(239,68,68,0.2)' }}/>
        <SectionLabel color={T.red}>AI Swim Lane</SectionLabel>
        <Badge tone="red">{open.length} open</Badge>
        <span style={{ marginLeft:'auto', fontSize:11, color:T.t3 }}>flags surfaced from cross-system alignment</span>
      </div>

      {open.length===0 ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 16px', gap:12 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(34,197,94,0.10)', border:`1px solid rgba(34,197,94,0.3)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 11.5 L9.5 16 L17 7" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontSize:14, fontWeight:500, color:T.t1 }}>Engineering aligned with PRD</div>
          <div style={{ fontSize:12, color:T.t3, textAlign:'center', maxWidth:280 }}>No open flags. Seed sample flags to demo.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {open.map((f,i)=><FlagCard key={f.id} flag={f} idx={i} fading={fading.includes(f.id)} onAgree={agree} onDismiss={dismiss}/>)}
        </div>
      )}

      <div style={{ marginTop:'auto' }}>
        <button onClick={()=>setShowResolved(s=>!s)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', color:T.t3, fontSize:12, cursor:'pointer', width:'100%', background:'none', border:'none' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform:showResolved?'rotate(90deg)':'rotate(0)', transition:'transform 200ms ease' }}><path d="M3 2 L7 5 L3 8" stroke={T.t3} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Resolved</span><Badge tone="neutral">{resolved.length}</Badge>
        </button>
        {showResolved && (
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8, animation:'fadeIn 240ms ease' }}>
            {resolved.map(r=>(
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:8, fontSize:12 }}>
                <Badge tone={r.status==='agreed'?'green':'neutral'} style={{ fontFamily:'JetBrains Mono,monospace' }}>{r.jiraKey}</Badge>
                <span style={{ color:T.t2, flex:1 }}>{r.status==='agreed'?'Agreed — opened as work':`Dismissed: ${r.dismissReason}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
