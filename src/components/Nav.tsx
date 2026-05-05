'use client'
import { useState, useEffect } from 'react'
import { T } from './tokens'
import { Dot, Button, Divider } from './ui'

export default function Nav({ integrations, onSeed }: { integrations:{name:string,connected:boolean}[], onSeed:()=>void }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(id) }, [])
  const allConnected = integrations.every(i=>i.connected)
  return (
    <header style={{ position:'sticky', top:0, zIndex:50, height:52, background:'rgba(10,10,15,0.8)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderBottom:`1px solid ${T.b1}`, display:'flex', alignItems:'center', padding:'0 32px', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, flex:'1 1 auto' }}>
        <Dot size={8} color={T.green} pulse={allConnected} />
        <span style={{ fontSize:15, fontWeight:500, color:T.t1, letterSpacing:-0.1 }}>Snyco Universe</span>
        <span style={{ color:T.t4, fontSize:14 }}>/</span>
        <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Project Intelligence</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <span className="mono" style={{ fontSize:11, color:T.t3 }}>{now.toLocaleTimeString('en-US',{hour12:false})} UTC</span>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {integrations.map(i=>(
            <div key={i.name} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:i.connected?T.green:T.red, boxShadow:i.connected?'0 0 0 1.5px rgba(34,197,94,0.2)':'0 0 0 1.5px rgba(239,68,68,0.2)' }} />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{i.name}</span>
            </div>
          ))}
        </div>
        <Divider vertical style={{ height:20, background:'rgba(255,255,255,0.08)' }} />
        <Button variant="secondary" size="compact" onClick={onSeed}>Seed</Button>
      </div>
    </header>
  )
}
