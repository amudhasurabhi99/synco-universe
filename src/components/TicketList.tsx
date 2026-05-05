'use client'
interface Ticket { title: string; description: string; priority: string; prdSection: string; epic: string; jiraKey?: string; jiraError?: boolean }
const priorityColor: Record<string, string> = { Highest: '#ef4444', High: '#f97316', Medium: '#3b82f6', Low: '#22c55e' }
export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  const epics = [...new Set(tickets.map(t => t.epic))]
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>{tickets.length} tickets created in Jira</p>
      {epics.map(epic => (
        <div key={epic} style={{ marginBottom: 24 }}>
          <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{epic}</p>
          {tickets.filter(t => t.epic === epic).map((t, i) => (
            <div key={i} style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, padding: 16, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {t.jiraKey && <span style={{ background: '#1e3a5f', color: '#60a5fa', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontFamily: 'Space Mono' }}>{t.jiraKey}</span>}
                <span style={{ background: priorityColor[t.priority] + '22', color: priorityColor[t.priority], fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>{t.priority}</span>
                <span style={{ color: '#475569', fontSize: 11 }}>{t.prdSection}</span>
              </div>
              <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{t.title}</p>
              <p style={{ color: '#64748b', fontSize: 13 }}>{t.description}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}