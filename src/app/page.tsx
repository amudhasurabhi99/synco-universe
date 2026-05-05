'use client'
import { useState, useEffect } from 'react'
import AlignmentDashboard from '@/components/AlignmentDashboard'
import SwimLane from '@/components/SwimLane'
import WeeklyReport from '@/components/WeeklyReport'

export default function Home() {
  const [status, setStatus] = useState({ notion: false, slack: false, jira: false, claude: false })
  const [seeded, setSeeded] = useState(false)

  const fetchStatus = async () => {
    try { const res = await fetch('/api/orchestrate/status'); setStatus(await res.json()) } catch {}
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const seed = async () => {
    await fetch('/api/seed')
    setSeeded(true)
    setTimeout(() => setSeeded(false), 3000)
  }

  const Dot = ({ ok, label }: { ok: boolean; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444' }} />
      <span style={{ color: '#94a3b8', fontSize: 12 }}>{label}</span>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0A1628', fontFamily: 'Space Mono, monospace' }}>
      <div style={{ background: '#0d1e35', borderBottom: '1px solid #1e3a5f', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: 2 }}>SNYCO UNIVERSE</h1>
          <p style={{ color: '#475569', fontSize: 11, margin: '2px 0 0' }}>Autonomous Project Intelligence Agent</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Dot ok={status.notion} label="Notion" />
          <Dot ok={status.slack} label="Slack" />
          <Dot ok={status.jira} label="Jira" />
          <Dot ok={status.claude} label="Claude" />
          <button onClick={seed} style={{ background: seeded ? '#15803d' : '#1e3a5f', color: seeded ? '#86efac' : '#94a3b8', border: '1px solid #2d4a6b', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
            {seeded ? 'Seeded!' : 'Seed Demo Data'}
          </button>
        </div>
      </div>

      <div style={{ padding: 32 }}>
        <div style={{ background: '#0d1e35', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>PRD Alignment Intelligence</h2>
            <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>Cross-checks Notion PRD vs Jira tickets vs GitHub codebase — auto-updates tickets with AI comments</p>
          </div>
          <AlignmentDashboard />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#0d1e35', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24 }}>
            <h2 style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>AI Swim Lane</h2>
            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 16px' }}>Silent misalignment flags from GitHub PRs</p>
            <SwimLane />
          </div>
          <div style={{ background: '#0d1e35', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24 }}>
            <h2 style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>Weekly Report</h2>
            <p style={{ color: '#475569', fontSize: 12, margin: '0 0 16px' }}>AI-generated from live Jira + swim lane data</p>
            <WeeklyReport />
          </div>
        </div>
      </div>
    </main>
  )
}