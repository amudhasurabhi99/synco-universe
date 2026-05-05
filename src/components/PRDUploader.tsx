'use client'
import { useState, useEffect, useRef } from 'react'
import AlignmentResult from './AlignmentResult'
import TicketList from './TicketList'

const STATUS_MESSAGES = [
  'Reading PRD from Notion...',
  'Fetching company context...',
  'Scoring alignment with Claude...',
  'Generating tickets...',
  'Creating tickets in Jira...'
]

export default function PRDUploader() {
  const [pageId, setPageId] = useState('')
  const [loading, setLoading] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    if (loading) {
      intervalRef.current = setInterval(() => setMsgIdx(i => (i + 1) % STATUS_MESSAGES.length), 2000)
    } else {
      clearInterval(intervalRef.current)
      setMsgIdx(0)
    }
    return () => clearInterval(intervalRef.current)
  }, [loading])

  const run = async () => {
    if (!pageId.trim()) return
    setLoading(true); setResult(null); setError('')
    try {
      const res = await fetch('/api/orchestrate/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prdPageId: pageId.trim() })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <input
            value={pageId}
            onChange={e => setPageId(e.target.value)}
            placeholder="Paste Notion Page ID (32-character ID from page URL)"
            style={{ width: '100%', background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
          <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>Find it in the Notion page URL after the last /</p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          style={{ background: loading ? '#1e3a5f' : '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
        >
          {loading ? 'Running...' : 'Run Alignment & Create Tickets'}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: '#0f2040', borderRadius: 8, border: '1px solid #1e3a5f' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1s infinite' }} />
          <span style={{ color: '#94a3b8', fontSize: 14 }}>{STATUS_MESSAGES[msgIdx]}</span>
        </div>
      )}

      {error && (
        <div style={{ background: '#450a0a', border: '1px solid #ef4444', borderRadius: 8, padding: 14, marginTop: 12 }}>
          <p style={{ color: '#ef4444', fontSize: 14 }}>Error: {error}</p>
        </div>
      )}

      {result?.halted && (
        <div style={{ background: '#450a0a', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginTop: 12 }}>
          <p style={{ color: '#ef4444', fontSize: 16, fontWeight: 600 }}>Alignment score too low — {result.alignment.score}%</p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Ticket creation halted. Review required before proceeding.</p>
          {result.alignment.gaps?.length > 0 && result.alignment.gaps.map((g: string, i: number) => (
            <p key={i} style={{ color: '#fca5a5', fontSize: 13, marginTop: 4 }}>• {g}</p>
          ))}
        </div>
      )}

      {result && !result.halted && (
        <>
          <AlignmentResult score={result.alignment.score} summary={result.alignment.summary} gaps={result.alignment.gaps ?? []} />
          <TicketList tickets={result.tickets} />
        </>
      )}
    </div>
  )
}