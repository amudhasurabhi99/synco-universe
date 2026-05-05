'use client'
import { useState } from 'react'

const STEPS = [
  'Fetching all PRDs from Notion folder...',
  'Scanning entire GitHub codebase...',
  'Loading all Jira tickets...',
  'Running AI cross-check analysis...',
  'Auto-creating missing tickets...',
  'Updating existing tickets...',
  'Posting report to Slack...'
]

export default function IntelligenceScan({ parentPageId }: { parentPageId: string }) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const runScan = async () => {
    setLoading(true); setResult(null); setError(''); setStep(0)
    
    const stepInterval = setInterval(() => {
      setStep(s => s < STEPS.length - 1 ? s + 1 : s)
    }, 3000)

    try {
      const res = await fetch('/api/orchestrate/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPageId })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { clearInterval(stepInterval); setLoading(false) }
  }

  const score = (n: number) => {
    const color = n >= 80 ? '#22c55e' : n >= 60 ? '#f59e0b' : n >= 40 ? '#f97316' : '#ef4444'
    return color
  }

  return (
    <div>
      <button
        onClick={runScan}
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #3b82f6, #7c3aed)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          padding: '16px 24px',
          fontSize: 16,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: 1,
          marginBottom: 16
        }}
      >
        {loading ? 'Scanning...' : 'Run Intelligence Scan'}
      </button>

      {loading && (
        <div style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: i < step ? '#22c55e' : i === step ? '#3b82f6' : '#1e3a5f'
              }} />
              <span style={{ color: i < step ? '#22c55e' : i === step ? '#e2e8f0' : '#475569', fontSize: 13 }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: '#450a0a', border: '1px solid #ef4444', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <p style={{ color: '#ef4444', fontSize: 14, margin: 0 }}>Error: {error}</p>
        </div>
      )}

      {result && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Overall Alignment', score: result.analysis?.overallScore ?? 0 },
              { label: 'PRD vs Jira', score: result.analysis?.prdVsJira?.score ?? 0 },
              { label: 'Jira vs Code', score: result.analysis?.jiraVsCode?.score ?? 0 }
            ].map(s => (
              <div key={s.label} style={{ background: '#0f2040', border: `1px solid ${score(s.score)}44`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 6px', letterSpacing: 1 }}>{s.label.toUpperCase()}</p>
                <p style={{ color: score(s.score), fontSize: 32, fontWeight: 700, margin: 0, fontFamily: 'Space Mono' }}>{s.score}%</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px' }}>PRDs SCANNED</p>
              <p style={{ color: '#60a5fa', fontSize: 24, fontWeight: 700, margin: 0 }}>{result.prdPages?.length ?? 0}</p>
            </div>
            <div style={{ background: '#0f2040', border: '1px solid #22c55e44', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px' }}>TICKETS CREATED</p>
              <p style={{ color: '#22c55e', fontSize: 24, fontWeight: 700, margin: 0 }}>{result.createdTickets?.length ?? 0}</p>
            </div>
            <div style={{ background: '#0f2040', border: '1px solid #f59e0b44', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px' }}>TICKETS UPDATED</p>
              <p style={{ color: '#f59e0b', fontSize: 24, fontWeight: 700, margin: 0 }}>{result.updatedTickets?.length ?? 0}</p>
            </div>
          </div>

          {result.prdPages?.length > 0 && (
            <div style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 600, letterSpacing: 2, margin: '0 0 8px' }}>PRDs SCANNED</p>
              {result.prdPages.map((p: string, i: number) => (
                <p key={i} style={{ color: '#e2e8f0', fontSize: 13, margin: '0 0 4px' }}>📄 {p}</p>
              ))}
            </div>
          )}

          {result.analysis?.prdVsJira?.gaps?.length > 0 && (
            <div style={{ background: '#0f2040', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600, letterSpacing: 2, margin: '0 0 8px' }}>PRD → JIRA GAPS</p>
              {result.analysis.prdVsJira.gaps.slice(0, 8).map((g: string, i: number) => (
                <p key={i} style={{ color: '#cbd5e1', fontSize: 13, margin: '0 0 4px' }}>• {g}</p>
              ))}
            </div>
          )}

          {result.analysis?.jiraVsCode?.gaps?.length > 0 && (
            <div style={{ background: '#0f2040', border: '1px solid #ef444444', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ color: '#ef4444', fontSize: 11, fontWeight: 600, letterSpacing: 2, margin: '0 0 8px' }}>JIRA → CODE GAPS</p>
              {result.analysis.jiraVsCode.gaps.slice(0, 8).map((g: string, i: number) => (
                <p key={i} style={{ color: '#cbd5e1', fontSize: 13, margin: '0 0 4px' }}>• {g}</p>
              ))}
            </div>
          )}

          {result.analysis?.recommendations?.length > 0 && (
            <div style={{ background: '#1e3a5f', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 600, letterSpacing: 2, margin: '0 0 8px' }}>RECOMMENDATIONS</p>
              {result.analysis.recommendations.slice(0, 5).map((r: string, i: number) => (
                <p key={i} style={{ color: '#e2e8f0', fontSize: 13, margin: '0 0 4px' }}>→ {r}</p>
              ))}
            </div>
          )}

          {result.createdTickets?.length > 0 && (
            <div style={{ background: '#0f2040', border: '1px solid #22c55e', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>
                Auto-created {result.createdTickets.length} new Jira tickets: {result.createdTickets.join(', ')}
              </p>
            </div>
          )}

          {result.codebaseFiles?.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ color: '#475569', fontSize: 12, cursor: 'pointer', padding: '8px 0' }}>
                {result.fileCount} files scanned in GitHub repo
              </summary>
              <div style={{ background: '#0a1628', borderRadius: 8, padding: 12, marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
                {result.codebaseFiles.map((f: string, i: number) => (
                  <p key={i} style={{ color: '#475569', fontSize: 11, margin: '2px 0', fontFamily: 'Space Mono' }}>{f}</p>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}