'use client'
import { useState, useEffect } from 'react'

interface SwimFlag { id: string; jiraKey: string; prdRef: string; description: string; confidence: number; status: string; dismissReason?: string; createdAt: string }

const DISMISS_REASONS = ['Acceptable variation', 'PRD changed', 'False positive', 'Other']

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minutes ago`
  return `${Math.floor(mins / 60)} hours ago`
}

export default function SwimLane() {
  const [flags, setFlags] = useState<SwimFlag[]>([])
  const [dismissing, setDismissing] = useState<string | null>(null)
  const [dismissReason, setDismissReason] = useState('Acceptable variation')

  const fetchFlags = async () => {
    const res = await fetch('/api/swimlane')
    const data = await res.json()
    setFlags(data)
  }

  useEffect(() => {
    fetchFlags()
    const interval = setInterval(fetchFlags, 10000)
    return () => clearInterval(interval)
  }, [])

  const agree = async (id: string) => {
    await fetch(`/api/swimlane/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'agree' }) })
    fetchFlags()
  }

  const dismiss = async (id: string) => {
    await fetch(`/api/swimlane/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'dismiss', reason: dismissReason }) })
    setDismissing(null)
    fetchFlags()
  }

  const open = flags.filter(f => f.status === 'open')
  const resolved = flags.filter(f => f.status !== 'open')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2 style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 600, margin: 0 }}>AI Swim Lane</h2>
        {open.length > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12 }}>{open.length} open</span>}
      </div>

      {open.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: '#22c55e', fontSize: 14 }}>
          No flags. Engineering is aligned with the PRD.
        </div>
      )}

      {open.map(flag => (
        <div key={flag.id} style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ background: '#1e3a5f', color: '#60a5fa', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontFamily: 'Space Mono' }}>{flag.jiraKey}</span>
            <span style={{ color: '#475569', fontSize: 11 }}>{flag.prdRef}</span>
            <span style={{ marginLeft: 'auto', color: '#475569', fontSize: 11 }}>{timeAgo(flag.createdAt)}</span>
          </div>
          <p style={{ color: '#e2e8f0', fontSize: 14, marginBottom: 10 }}>{flag.description}</p>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#64748b', fontSize: 11 }}>Confidence</span>
              <span style={{ color: flag.confidence >= 0.8 ? '#22c55e' : flag.confidence >= 0.6 ? '#f59e0b' : '#ef4444', fontSize: 11 }}>{Math.round(flag.confidence * 100)}%</span>
            </div>
            <div style={{ background: '#1e3a5f', borderRadius: 4, height: 4 }}>
              <div style={{ width: `${flag.confidence * 100}%`, height: 4, borderRadius: 4, background: flag.confidence >= 0.8 ? '#22c55e' : flag.confidence >= 0.6 ? '#f59e0b' : '#ef4444' }} />
            </div>
          </div>
          {dismissing === flag.id ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={dismissReason} onChange={e => setDismissReason(e.target.value)} style={{ background: '#0a1628', color: '#e2e8f0', border: '1px solid #1e3a5f', borderRadius: 6, padding: '6px 10px', fontSize: 13, flex: 1 }}>
                {DISMISS_REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={() => dismiss(flag.id)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Confirm</button>
              <button onClick={() => setDismissing(null)} style={{ background: 'transparent', color: '#64748b', border: '1px solid #1e3a5f', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => agree(flag.id)} style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>Agree</button>
              <button onClick={() => setDismissing(flag.id)} style={{ background: '#7f1d1d', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>Dismiss</button>
            </div>
          )}
        </div>
      ))}

      {resolved.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: '#475569', fontSize: 12, marginBottom: 8 }}>RESOLVED ({resolved.length})</p>
          {resolved.map(flag => (
            <div key={flag.id} style={{ background: '#0a1628', border: '1px solid #1e3a5f', borderRadius: 8, padding: 12, marginBottom: 8, opacity: 0.6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ background: '#1e3a5f', color: '#60a5fa', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>{flag.jiraKey}</span>
                <span style={{ color: flag.status === 'agreed' ? '#22c55e' : '#64748b', fontSize: 11 }}>{flag.status === 'agreed' ? 'Agreed — ticket created' : `Dismissed: ${flag.dismissReason}`}</span>
              </div>
              <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>{flag.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}