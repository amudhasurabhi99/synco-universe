'use client'
import { useState, useEffect } from 'react'
import PRDUploader from '@/components/PRDUploader'
import SwimLane from '@/components/SwimLane'
import WeeklyReport from '@/components/WeeklyReport'

export default function Home() {
  const [status, setStatus] = useState({ notion: false, slack: false, jira: false, claude: false })
  const [seeded, setSeeded] = useState(false)
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

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
    <main style={{ minHeight: '100vh', background: '#0A1628', fontFamily: 'Space Mono, monospace', padding: 0 }}>
      {isDemoMode && (
        <div style={{ background: '#7c3aed', padding: '8px 24px', textAlign: 'center' }}>
          <span style={{ color: 'white', fontSize: 13 }}>Demo Mode — API calls return cached data</span>
        </div>
      )}

      <div style={{ background: '#0d1e35', borderBottom: '1px solid #1e3a5f', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: 2 }}>SNYCO UNIVERSE</h1>
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

      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ gridColumn: '1 / -1', background: '#0d1e35', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, margin: '0 0 16px' }}>PRD Intake & Alignment</h2>
          <PRDUploader />
        </div>

        <div style={{ background: '#0d1e35', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>AI Swim Lane</h2>
          <SwimLane />
        </div>

        <div style={{ background: '#0d1e35', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>Weekly Report</h2>
          <WeeklyReport />
        </div>
      </div>
    </main>
  )
}