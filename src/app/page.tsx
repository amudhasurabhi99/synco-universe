'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
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
      setOpenFlags(f.filter((x:any)=>x.status==='open').length)
    } catch {}
  }

  const seed = async () => { await fetch('/api/seed'); fetchFlags() }

  useEffect(()=>{
    fetchStatus(); fetchFlags()
    const s=setInterval(fetchStatus,30000)
    const f=setInterval(fetchFlags,10000)
    return()=>{ clearInterval(s); clearInterval(f) }
  },[])

  return (
    <div style={{ background:T.bg0, minHeight:'100vh' }}>
      <Nav integrations={integrations} onSeed={seed}/>
      <Hero stats={[
        {label:'Open Flags', value:`${openFlags} active`, color: openFlags>0 ? T.red : T.green},
        {label:'Jira Project', value:'KAN', color:T.orange},
        {label:'Codebase', value:'synco-universe', color:T.purple},
      ]}/>
      <main style={{ padding:'24px 32px 56px', display:'flex', flexDirection:'column', gap:20, maxWidth:1400, margin:'0 auto' }}>
        <IntelligenceScan/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <SwimLane/>
          <WeeklyReport/>
        </div>
      </main>
    </div>
  )
}
