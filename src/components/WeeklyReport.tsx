'use client'
import { useState } from 'react'

export default function WeeklyReport() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('Gathering project data...')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true); setResult(null); setError('')
    setTimeout(() => setMsg('Writing report...'), 3000)
    try {
      const res = await fetch('/api/orchestrate/report', { method: 'POST' })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false); setMsg('Gathering project data...') }
  }

  const driftColor = (s: number) => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div>
      <button onClick={generate} disabled={loading} style={{ background: loading ? '#1e3a5f' : '#7c3aed', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16 }}>
        {loading ? msg : 'Generate Report Now'}
      </button>

      {error && <p style={{ color: '#ef4444', fontSize: 14 }}>Error: {error}</p>}

      {result && (
        <div>
          <div style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 12, padding: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <p style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 600, margin: 0, flex: 1 }}>{result.report.headline}</p>
              <span style={{ background: driftColor(result.report.driftScore) + '22', color: driftColor(result.report.driftScore), fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>Drift {result.report.driftScore}</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>PRD Completion</span>
                <span style={{ color: '#e2e8f0', fontSize: 12 }}>{result.stats.completion}%</span>
              </div>
              <div style={{ background: '#1e3a5f', borderRadius: 4, height: 6 }}>
                <div style={{ width: `${result.stats.completion}%`, height: 6, borderRadius: 4, background: '#3b82f6' }} />
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>{result.report.progressNarrative}</p>
            <div style={{ marginBottom: 12 }}>
              {result.report.risks.map((r: string, i: number) => (
                <p key={i} style={{ color: '#fbbf24', fontSize: 13, marginBottom: 4 }}>⚠ {r}</p>
              ))}
            </div>
            <div style={{ background: '#1e3a5f', borderRadius: 8, padding: 12 }}>
              <p style={{ color: '#60a5fa', fontSize: 13, margin: 0 }}>Recommendation: {result.report.recommendation}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[{label:'Total',val:result.stats.total},{label:'Delivered',val:result.stats.delivered},{label:'In Progress',val:result.stats.inProgress},{label:'Completion',val:result.stats.completion+'%'}].map(s => (
              <div key={s.label} style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: 0, fontFamily: 'Space Mono' }}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}