const auth = () => Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')

export async function createIssue(ticket: {
  title: string, description: string,
  priority: 'Highest'|'High'|'Medium'|'Low', epic?: string
}): Promise<{ id: string, key: string }> {
  const res = await fetch(`${process.env.JIRA_BASE_URL}/rest/api/3/issue`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        project: { key: process.env.JIRA_PROJECT_KEY },
        summary: ticket.title,
        description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: ticket.description }] }] },
        priority: { name: ticket.priority },
        issuetype: { name: 'Task' }
      }
    })
  })
  const data = await res.json()
  return { id: data.id, key: data.key }
}

export async function updateIssue(key: string, update: { status?: string, comment?: string }): Promise<void> {
  if (update.comment) {
    await fetch(`${process.env.JIRA_BASE_URL}/rest/api/3/issue/${key}/comment`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: update.comment }] }] } })
    })
  }
  if (update.status) {
    const transRes = await fetch(`${process.env.JIRA_BASE_URL}/rest/api/3/issue/${key}/transitions`, {
      headers: { 'Authorization': `Basic ${auth()}` }
    })
    const transData = await transRes.json()
    const transition = transData.transitions?.find((t: any) => t.name.toLowerCase().includes(update.status!.toLowerCase()))
    if (transition) {
      await fetch(`${process.env.JIRA_BASE_URL}/rest/api/3/issue/${key}/transitions`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ transition: { id: transition.id } })
      })
    }
  }
}

export async function getAllTickets(): Promise<any[]> {
  const res = await fetch(
    `${process.env.JIRA_BASE_URL}/rest/api/3/search?jql=project=${process.env.JIRA_PROJECT_KEY}&maxResults=50&fields=summary,description,status,priority`,
    { headers: { 'Authorization': `Basic ${auth()}` } }
  )
  const data = await res.json()
  return (data.issues ?? []).map((i: any) => ({
    key: i.key,
    summary: i.fields.summary,
    status: i.fields.status.name,
    priority: i.fields.priority?.name,
    description: i.fields.description?.content?.[0]?.content?.[0]?.text ?? ''
  }))
}

export async function getIssueByKey(key: string): Promise<{ summary: string, description: string }> {
  const res = await fetch(`${process.env.JIRA_BASE_URL}/rest/api/3/issue/${key}`, {
    headers: { 'Authorization': `Basic ${auth()}` }
  })
  const data = await res.json()
  return {
    summary: data.fields?.summary ?? '',
    description: data.fields?.description?.content?.[0]?.content?.[0]?.text ?? ''
  }
}

export async function jiraSearch(): Promise<any[]> {
  const res = await fetch(
    `${process.env.JIRA_BASE_URL}/rest/api/3/search?jql=project=${process.env.JIRA_PROJECT_KEY}&maxResults=100`,
    { headers: { 'Authorization': `Basic ${auth()}` } }
  )
  const data = await res.json()
  return data.issues ?? []
}

export async function ping(): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.JIRA_BASE_URL}/rest/api/3/myself`, {
      headers: { 'Authorization': `Basic ${auth()}` }
    })
    return res.ok
  } catch { return false }
}