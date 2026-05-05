'use client'
interface Props { score: number; summary: string; gaps: string[] }
export default function AlignmentResult({ score, summary, gaps }: Props) {
  const color = score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 12, padding: 24, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <span style={{ fontSize: 56, fontWeight: 700, color, fontFamily: 'Space Mono' }}>{score}%</span>
        <span style={{ color: '#94a3b8', fontSize: 14 }}>{summary}</span>
      </div>
      {gaps.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <p style={{ color: '#f59e0b', fontSize: 13, marginBottom: 6 }}>Gaps identified:</p>
          {gaps.map((g, i) => <p key={i} style={{ color: '#cbd5e1', fontSize: 13, marginLeft: 12 }}>• {g}</p>)}
        </div>
      )}
    </div>
  )
}