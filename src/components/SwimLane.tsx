'use client'
import { useState, useEffect } from 'react'
import { T } from './tokens'
import { Card, Badge, Button, Label } from './ui'

const REASONS = [
  {value:'prd-stale', label:'PRD is out of date'},
  {value:'wont-fix', label:"Won't fix this cycle"},
  {value:'false-positive', label:'False positive'},
  {value:'tracked-elsewhere', label:'Tracked elsewhere'},
]

function ConfBar({ value }: { value: number }) {
  const color = value>=80 ? T.green : value>=60 ? T.amber : T.red
  const bg = value>=80 ? T.greenBg : value>=60 ? T.amberBg : T.redBg
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ flex:1, height:4, borderRadius:999, background:T.bg3 }}>
        <div style={{ width:`${value}%`, height:'100%', borderRadius:999, background:color, transition:'width 500ms ease' }}/>
      </div>
      <span className="mono" style={{ fontSize:11, color, fontWeight:500, minWidth:52, textAlign:'right' }}>{value}% conf</span>
    </div>
  )
}

function FlagCard({ flag, idx, fading, onAgree, onDismiss }: any) {
  const [dismissing, setDismissing] = useState(false)
  const [reason, setReason] = useState(REASONS[0].value)

  return (
    <div style={{
      background:'#fff', border:`1px solid ${T.b1}`, borderRadius:10, padding:16,
      display:'flex', flexDirection:'column', gap:12,
      animation:`slideIn 280ms ease ${idx*40}ms backwards`,
      opacity: fading ? 0.3 : 1, transition:'opacity 250ms ease',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <Badge tone="blue" style={{ fontFamily:'JetBrains Mono,monospace' }}>{flag.jiraKey}</Badge>
        <span style={{ fontSize:12, color:T.t4 }}>↔</span>
        <span style={{ fontSize:12, color:T.t3 }}>{flag.prdRef}</span>
        <span className="mono" style={{ marginLeft:'auto', fontSize:11, color:T.t4 }}>{new Date(flag.createdAt).toLocaleTimeString()}</span>
      </div>
      <p style={{ fontSize:13, color:T.t2, lineHeight:1.6, margin:0 }}>{flag.description}</p>
      <ConfBar value={Math.round(flag.confidence*100)}/>
      {!dismissing ? (
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="success" size="sm" onClick={()=>onAgree(flag.id)} disabled={fading} style={{ flex:1 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5 L4.5 8 L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Agree
          </Button>
          <Button variant="danger" size="sm" onClick={()=>setDismissing(true)} disabled={fading} style={{ flex:1 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2.5 2.5 L8.5 8.5 M8.5 2.5 L2.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Dismiss
          </Button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8, animation:'fadeIn 150ms ease' }}>
          <select value={reason} onChange={e=>setReason(e.target.value)} style={{
            background:'#fff', border:`1px solid ${T.b2}`, borderRadius:8,
            padding:'7px 12px', color:T.t1, fontSize:13, fontFamily:'inherit', outline:'none',
          }}>
            {REASONS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <div style={{ display:'flex', gap:8 }}>
            <Button variant="ghost" size="sm" onClick={()=>setDismissing(false)} style={{ flex:1, border:`1px solid ${T.b2}` }}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={()=>{ onDismiss(flag.id,reason); setDismissing(false) }} style={{ flex:1 }}>Confirm</Button>
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

  const fetchFlags = async () => { try { const r=await fetch('/api/swimlane'); setFlags(await r.json()) } catch {} }
  useEffect(()=>{ fetchFlags(); const id=setInterval(fetchFlags,10000); return()=>clearInterval(id) },[])

  const agree = async (id:string) => {
    setFading(f=>[...f,id])
    await fetch(`/api/swimlane/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'agree'})})
    setTimeout(()=>{ fetchFlags(); setFading(f=>f.filter(x=>x!==id)) },300)
  }
  const dismiss = async (id:string,reason:string) => {
    setFading(f=>[...f,id])
    await fetch(`/api/swimlane/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'dismiss',reason})})
    setTimeout(()=>{ fetchFlags(); setFading(f=>f.filter(x=>x!==id)) },300)
  }

  const open = flags.filter(f=>f.status==='open')
  const resolved = flags.filter(f=>f.status!=='open')

  return (
    <Card style={{ display:'flex', flexDirection:'column', gap:16, minHeight:480 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background: open.length>0 ? T.red : T.green }}/>
        <Label color={ open.length>0 ? T.red : T.green}>AI Swim Lane</Label>
        {open.length>0 && <Badge tone="red">{open.length} open</Badge>}
        <span style={{ marginLeft:'auto', fontSize:12, color:T.t4 }}>flags from cross-system alignment</span>
      </div>

      {open.length===0 ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 16px', gap:10 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:T.greenBg, border:`1px solid ${T.greenBorder}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10.5 L8.5 15 L16 6" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p style={{ fontSize:14, fontWeight:500, color:T.t1, margin:0 }}>Engineering aligned with PRD</p>
          <p style={{ fontSize:12, color:T.t3, margin:0, textAlign:'center' }}>No open flags. Seed sample flags to demo.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {open.map((f,i)=><FlagCard key={f.id} flag={f} idx={i} fading={fading.includes(f.id)} onAgree={agree} onDismiss={dismiss}/>)}
        </div>
      )}

      <div style={{ marginTop:'auto' }}>
        <button onClick={()=>setShowResolved(s=>!s)} style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'6px 0', color:T.t3, fontSize:12,
          cursor:'pointer', width:'100%', background:'none', border:'none',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform:showResolved?'rotate(90deg)':'none', transition:'transform 200ms' }}>
            <path d="M3 2 L7 5 L3 8" stroke={T.t4} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          </svg>
          <span>Resolved</span>
          <span style={{ fontSize:11, background:T.bg3, color:T.t3, borderRadius:20, padding:'1px 7px' }}>{resolved.length}</span>
        </button>
        {showResolved && (
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8, animation:'fadeIn 200ms ease' }}>
            {resolved.map(r=>(
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:T.bg2, border:`1px solid ${T.b1}`, borderRadius:8, fontSize:12 }}>
                <Badge tone={r.status==='agreed'?'green':'neutral'} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10 }}>{r.jiraKey}</Badge>
                <span style={{ color:T.t2, flex:1 }}>{r.status==='agreed'?'Agreed — opened as work':`Dismissed: ${r.dismissReason}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
