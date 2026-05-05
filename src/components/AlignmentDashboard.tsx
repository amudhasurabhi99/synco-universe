'use client'
import { useState, useEffect } from 'react'

export default function AlignmentDashboard() {
  const [pages, setPages] = useState<{id: string, title: string}[]>([])
  const [selectedPage, setSelectedPage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loadingPages, setLoadingPages] = useState(true)

  useEffect(() => {
    fetch('/api/notion/pages')
      .then(r => r.json())
      .then(data => { setPages(Array.isArray(data) ? data : []); setLoadingPages(false) })
      .catch(() => setLoadingPages(false))
  }, [])

  const run = async () => {
    if (!selectedPage) return
    setLoading(true); setResult(null); setError('')
    try {
      const res = await fetch('/api/orchestrate/alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prdPageId: selectedPage })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const ScoreBar = ({ label, score }: { label: string, score: number }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>{label}</span>
        <span style={{ color: score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444', fontSize: 12, fontWeight: 600 }}>{score}%</span>
      </div>
      <div style={{ background: '#1e3a5f', borderRadius: 4, height: 6 }}>
        <div style={{ width: `${score}%`, height: 6, borderRadius: 4, background: score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select
          value={selectedPage}
          onChange={e => setSelectedPage(e.target.value)}
          style={{ flex: 1, background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: '10px 14px', color: selectedPage ? '#e2e8f0' : '#475569', fontSize: 14, outline: 'none' }}
        >
          <option value="">{loadingPages ? 'Loading pages...' : 'Select a Notion page...'}</option>
          {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <button
          onClick={run}
          disabled={loading || !selectedPage}
          style={{ background: loading ? '#1e3a5f' : '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: loading || !selectedPage ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
        >
          {loading ? 'Analysing...' : 'Run Full Alignment'}
        </button>
      </div>

      {loading && (
        <div style={{ padding: 16, background: '#0f2040', borderRadius: 8, border: '1px solid #1e3a5f' }}>
          <p style={{ color: '#60a5fa', fontSize: 13, margin: 0 }}>Reading PRD from Notion...</p>
          <p style={{ color: '#475569', fontSize: 12, margin: '4px 0 0' }}>Fetching Jira tickets + GitHub codebase in parallel...</p>
        </div>
      )}

      {error && <div style={{ background: '#450a0a', border: '1px solid #ef4444', borderRadius: 8, padding: 14, marginTop: 8 }}><p style={{ color: '#ef4444', fontSize: 14, margin: 0 }}>Error: {error}</p></div>}

      {result && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Overall', score: result.analysis?.overallScore ?? 0 },
              { label: 'PRD vs Jira', score: result.analysis?.prdVsJira?.score ?? 0 },
              { label: 'Jira vs Code', score: result.analysis?.jiraVsCode?.score ?? 0 }
            ].map(s => (
              <div key={s.label} style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ color: s.score >= 80 ? '#22c55e' : s.score >= 60 ? '#f59e0b' : '#ef4444', fontSize: 28, fontWeight: 700, margin: 0 }}>{s.score}%</p>
              </div>
            ))}
          </div>

          {result.analysis?.prdVsJira?.gaps?.length > 0 && (
            <div style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600, margin: '0 0 8px' }}>PRD → JIRA GAPS</p>
              {result.analysis.prdVsJira.gaps.map((g: string, i: number) => <p key={i} style={{ color: '#cbd5e1', fontSize: 13, margin: '0 0 4px' }}>• {g}</p>)}
            </div>
          )}

          {result.analysis?.jiraVsCode?.gaps?.length > 0 && (
            <div style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 600, margin: '0 0 8px' }}>JIRA → CODE GAPS</p>
              {result.analysis.jiraVsCode.gaps.map((g: string, i: number) => <p key={i} style={{ color: '#cbd5e1', fontSize: 13, margin: '0 0 4px' }}>• {g}</p>)}
            </div>
          )}

          {result.analysis?.recommendations?.length > 0 && (
            <div style={{ background: '#1e3a5f', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600, margin: '0 0 8px' }}>RECOMMENDATIONS</p>
              {result.analysis.recommendations.map((r: string, i: number) => <p key={i} style={{ color: '#e2e8f0', fontSize: 13, margin: '0 0 4px' }}>→ {r}</p>)}
            </div>
          )}

          {result.updatedTickets?.length > 0 && (
            <div style={{ background: '#0f2040', border: '1px solid #22c55e', borderRadius: 8, padding: 12 }}>
              <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>Auto-updated {result.updatedTickets.length} Jira tickets with AI analysis comments: {result.updatedTickets.join(', ')}</p>
            </div>
          )}

          {result.tickets?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: 2, margin: '0 0 8px' }}>JIRA TICKETS ({result.tickets.length})</p>
              {result.tickets.map((t: any) => (
                <div key={t.key} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #1e3a5f' }}>
                  <span style={{ background: '#1e3a5f', color: '#60a5fa', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontFamily: 'Space Mono', flexShrink: 0 }}>{t.key}</span>
                  <span style={{ color: '#e2e8f0', fontSize: 13, flex: 1 }}>{t.summary}</span>
                  <span style={{ color: t.status === 'Done' ? '#22c55e' : t.status === 'In Progress' ? '#f59e0b' : '#64748b', fontSize: 11, flexShrink: 0 }}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}