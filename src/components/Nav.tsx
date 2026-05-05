'use client'
import { useState, useEffect } from 'react'
import { T } from './tokens'
import { Button } from './ui'

export default function Nav({ integrations, onSeed }: {
  integrations: {name:string,connected:boolean}[], onSeed: ()=>void
}) {
  const [time, setTime] = useState('')
  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-US',{hour12:false}))
    const id = setInterval(()=>setTime(new Date().toLocaleTimeString('en-US',{hour12:false})),1000)
    return ()=>clearInterval(id)
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: 52,
      background: 'rgba(245,244,239,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${T.b1}`,
      display: 'flex', alignItems: 'center',
      padding: '0 32px', gap: 16,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, flex:'1 1 auto' }}>
        <div style={{ width:24, height:24, borderRadius:6, background: T.orange, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5" fill="none"/>
            <circle cx="6" cy="6" r="1.5" fill="white"/>
          </svg>
        </div>
        <span style={{ fontSize:14, fontWeight:600, color:T.t1, letterSpacing:-0.2 }}>Snyco Universe</span>
        <span style={{ color:T.t4, fontSize:13, margin:'0 2px' }}>/</span>
        <span style={{ fontSize:13, color:T.t3 }}>Project Intelligence</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        {time && <span className="mono" style={{ fontSize:11, color:T.t4 }}>{time}</span>}
        <div style={{ width:1, height:16, background:T.b2 }}/>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {integrations.map(i=>(
            <div key={i.name} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: i.connected ? T.green : T.t4 }} />
              <span style={{ fontSize:12, color: i.connected ? T.t2 : T.t4 }}>{i.name}</span>
            </div>
          ))}
        </div>
        <div style={{ width:1, height:16, background:T.b2 }}/>
        <Button variant="secondary" size="sm" onClick={onSeed}>Seed demo</Button>
      </div>
    </header>
  )
}
