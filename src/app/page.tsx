'use client'
import { useState, useEffect } from 'react'
import IntelligenceScan from '@/components/IntelligenceScan'
import SwimLane from '@/components/SwimLane'
import WeeklyReport from '@/components/WeeklyReport'

const PARENT_PAGE_ID = process.env.NEXT_PUBLIC_NOTION_PARENT_PAGE_ID ?? ''

export default function Home() {
  const [status, setStatus] = useState({ notion: false, slack: false, jira: false, claude: false })
  const [seeded, setSeeded] = useState(false)
  const [time, setTime] = useState('')

  const fetchStatus = async () => {
    try { const res = await fetch('/api/orchestrate/status'); setStatus(await res.json()) } catch {}
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    const tick = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => { clearInterval(interval); clearInterval(tick) }
  }, [])

  const seed = async () => {
    await fetch('/api/seed')
    setSeeded(true)
    setTimeout(() => setSeeded(false), 3000)
  }

  const allConnected = status.notion && status.slack && status.jira && status.claude

  const Dot = ({ ok, label }: { ok: boolean; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: ok ? '#22c55e' : '#ef4444',
        boxShadow: ok ? '0 0 6px #22c55e88' : 'none'
      }} />
      <span style={{ color: ok ? '#94a3b8' : '#64748b', fontSize: 12 }}>{label}</span>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#060f1e', fontFamily: 'Space Mono, monospace' }}>

      {/* Top bar */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid #1e3a5f', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: allConnected ? '#22c55e' : '#ef4444', boxShadow: allConnected ? '0 0 8px #22c55e' : 'none' }} />
          <h1 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: 3 }}>SNYCO UNIVERSE</h1>
          <span style={{ color: '#1e3a5f', fontSize: 12 }}>|</span>
          <span style={{ color: '#475569', fontSize: 11 }}>Autonomous Project Intelligence</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ color: '#1e3a5f', fontSize: 11, fontFamily: 'Space Mono' }}>{time}</span>
          <Dot ok={status.notion} label="Notion" />
          <Dot ok={status.slack} label="Slack" />
          <Dot ok={status.jira} label="Jira" />
          <Dot ok={status.claude} label="Claude" />
          <button onClick={seed} style={{
            background: seeded ? '#15803d22' : 'transparent',
            color: seeded ? '#86efac' : '#475569',
            border: '1px solid',
            borderColor: seeded ? '#22c55e44' : '#1e3a5f',
            borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer'
          }}>
            {seeded ? '✓ Seeded' : 'Seed Demo'}
          </button>
        </div>
      </div>

      {/* Hero section */}
      <div style={{ padding: '24px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#475569', fontSize: 11, letterSpacing: 3, margin: '0 0 4px', textTransform: 'uppercase' }}>Intelligence Layer</p>
          <h2 style={{ color: '#e2e8f0', fontSize: 24, fontWeight: 700, margin: 0 }}>Project Alignment Dashboard</h2>
          <p style={{ color: '#475569', fontSize: 13, margin: '6px 0 0' }}>Notion PRDs · GitHub Codebase · Jira Tickets — all in sync</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'PRD Folder', value: 'Connected', ok: status.notion },
            { label: 'Codebase', value: 'synco-universe', ok: true },
            { label: 'Jira Project', value: 'KAN', ok: status.jira }
          ].map(s => (
            <div key={s.label} style={{ background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: 8, padding: '10px 16px', textAlign: 'center', minWidth: 100 }}>
              <p style={{ color: '#475569', fontSize: 10, margin: '0 0 4px', letterSpacing: 1 }}>{s.label.toUpperCase()}</p>
              <p style={{ color: s.ok ? '#22c55e' : '#64748b', fontSize: 12, fontWeight: 600, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 32, display: 'grid', gap: 24 }}>

        {/* Main scan panel */}
        <div style={{
          background: '#0a1628',
          border: '1px solid #1e3a5f',
          borderRadius: 16,
          padding: 28,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3b82f6, #7c3aed, #3b82f6)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                <h3 style={{ color: '#60a5fa', fontSize: 11, fontWeight: 600, letterSpacing: 3, margin: 0, textTransform: 'uppercase' }}>Intelligence Scan</h3>
              </div>
              <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>
                Reads all Notion PRDs · Scans entire GitHub repo · Cross-checks Jira · Auto-creates missing tickets
              </p>
            </div>
          </div>
          <IntelligenceScan parentPageId={PARENT_PAGE_ID} />
        </div>

        {/* Bottom two panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{
            background: '#0a1628',
            border: '1px solid #1e3a5f',
            borderRadius: 16,
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef444488' }} />
              <h3 style={{ color: '#f87171', fontSize: 11, fontWeight: 600, letterSpacing: 3, margin: 0, textTransform: 'uppercase' }}>AI Swim Lane</h3>
            </div>
            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 16px' }}>Silent misalignment flags from GitHub PRs</p>
            <SwimLane />
          </div>

          <div style={{
            background: '#0a1628',
            border: '1px solid #1e3a5f',
            borderRadius: 16,
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #7c3aed, #3b82f6)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px #7c3aed88' }} />
              <h3 style={{ color: '#a78bfa', fontSize: 11, fontWeight: 600, letterSpacing: 3, margin: 0, textTransform: 'uppercase' }}>Weekly Report</h3>
            </div>
            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 16px' }}>AI-generated from live Jira + swim lane data</p>
            <WeeklyReport />
          </div>
        </div>
      </div>
    </main>
  )
}