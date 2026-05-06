'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import IntelligenceScan from '@/components/IntelligenceScan'
import SwimLane from '@/components/SwimLane'
import WeeklyReport from '@/components/WeeklyReport'
import { T } from '@/components/tokens'

export default function Home() {
  const [integrations, setIntegrations] = useState([
    {name:'Notion',connected:false},{name:'Slack',connected:false},
    {name:'Jira',connected:false},{name:'Claude',connected:false},
  ])
  const [openFlags, setOpenFlags] = useState(0)
  const [flagsResolved, setFlagsResolved] = useState(0)
  const [ticketsCreated, setTicketsCreated] = useState(0)

  const fetchStatus = async () => {
    try {
      const r = await fetch('/api/orchestrate/status')
      const d = await r.json()
      setIntegrations([
        {name:'Notion',connected:d.notion},{name:'Slack',connected:d.slack},
        {name:'Jira',connected:d.jira},{name:'Claude',connected:d.claude},
      ])
    } catch {}
  }

  const fetchFlags = async () => {
    try {
      const r = await fetch('/api/swimlane')
      const f = await r.json()
      setOpenFlags(f.filter((x:any) => x.status === 'open').length)
      setFlagsResolved(f.filter((x:any) => x.status !== 'open').length)
    } catch {}
  }

  const seed = async () => { await fetch('/api/seed'); fetchFlags() }

  useEffect(() => {
    fetchStatus(); fetchFlags()
    const s = setInterval(fetchStatus, 30000)
    const f = setInterval(fetchFlags, 10000)
    return () => { clearInterval(s); clearInterval(f) }
  }, [])

  const hrsSaved = ticketsCreated > 0 ? Math.round(ticketsCreated * 0.33) : 7
  const moneySaved = ticketsCreated > 0 ? hrsSaved * 50 : 91000

  const impactItems = [
    {
      metric: ticketsCreated > 0 ? String(ticketsCreated) : '—',
      label: 'tickets auto-created',
      sub: ticketsCreated > 0 ? 'this scan' : 'run a scan first',
      color: T.orange,
    },
    {
      metric: hrsSaved + ' hrs',
      label: 'saved this sprint',
      sub: 'per PM estimate',
      color: T.green,
    },
    {
      metric: moneySaved >= 1000 ? '$' + Math.round(moneySaved/1000) + 'k' : '$' + moneySaved,
      label: 'annual saving',
      sub: 'at $50/hr loaded',
      color: T.blue,
    },
    {
      metric: String(flagsResolved),
      label: 'flags resolved',
      sub: 'via swim lane',
      color: T.purple,
    },
  ]

  return (
    <div style={{ background:T.bg0, minHeight:'100vh' }}>
      <Nav integrations={integrations} onSeed={seed}/>

      <div style={{ padding:'32px 32px 0', display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:24 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:500, letterSpacing:1, textTransform:'uppercase', color:T.t4, margin:'0 0 8px' }}>Intelligence Layer</p>
          <h1 style={{ fontSize:30, fontWeight:600, color:T.t1, margin:0, letterSpacing:-0.5, lineHeight:1.2 }}>Product Intelligence Agent</h1>
          <p style={{ fontSize:14, color:T.t3, margin:'6px 0 0' }}>Notion · GitHub · Jira · Slack — autonomous alignment, zero manual input</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            {label:'Open Flags', value: openFlags + ' active', color: openFlags > 0 ? T.red : T.green},
            {label:'Jira Project', value:'KAN', color:T.orange},
            {label:'Codebase', value:'synco-universe', color:T.purple},
          ].map(s=>(
            <div key={s.label} style={{ background:'#fff', border:`1px solid ${T.b1}`, borderRadius:10, padding:'10px 16px', minWidth:110 }}>
              <p style={{ fontSize:10, color:T.t4, letterSpacing:0.6, textTransform:'uppercase', margin:'0 0 4px', fontWeight:500 }}>{s.label}</p>
              <p className="mono" style={{ fontSize:13, fontWeight:500, color:s.color, margin:0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <main style={{ padding:'20px 32px 56px', display:'flex', flexDirection:'column', gap:16, maxWidth:1400, margin:'0 auto' }}>
        <IntelligenceScan onScanComplete={(count:number) => setTicketsCreated(count)}/>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, background:'#fff', border:`1px solid ${T.b1}`, borderRadius:10, padding:'14px 20px' }}>
          {impactItems.map(s=>(
            <div key={s.label} style={{ display:'flex', flexDirection:'column', gap:2 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                <span className="mono" style={{ fontSize:20, fontWeight:600, color:s.color, letterSpacing:-0.5 }}>{s.metric}</span>
                <span style={{ fontSize:11, color:T.t3 }}>{s.label}</span>
              </div>
              <span style={{ fontSize:11, color:T.t4 }}>{s.sub}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <SwimLane/>
          <WeeklyReport/>
        </div>
      </main>
    </div>
  )
}
