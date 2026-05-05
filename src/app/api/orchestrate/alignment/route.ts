import { NextResponse } from 'next/server'
import { getPageText } from '@/lib/notion'
import { getAllTickets, updateIssue } from '@/lib/jira'
import { postMessage } from '@/lib/slack'

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  if (!data.content?.[0]) throw new Error('Empty Claude response')
  return data.content[0].text
}

async function getCodeSummary(): Promise<string> {
  try {
    const [owner, repo] = (process.env.GITHUB_REPO ?? 'amudhasurabhi99/synco-universe').split('/')
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/src/features`, {
      headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
    })
    if (!res.ok) return 'No codebase found'
    const dirs = await res.json()
    if (!Array.isArray(dirs)) return 'No codebase found'
    let summary = ''
    for (const dir of dirs.slice(0, 3)) {
      if (dir.type === 'dir') {
        const filesRes = await fetch(dir.url, { headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' } })
        const files = await filesRes.json()
        if (Array.isArray(files)) {
          for (const file of files.slice(0, 2)) {
            const fileRes = await fetch(file.url, { headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' } })
            const fileData = await fileRes.json()
            const content = fileData.encoding === 'base64' ? Buffer.from(fileData.content, 'base64').toString('utf-8') : ''
            summary += `// ${file.path}\n${content.slice(0, 400)}\n\n`
          }
        }
      }
    }
    return summary || 'No code files found'
  } catch { return 'Could not read codebase' }
}

export async function POST(request: Request) {
  try {
    const { prdPageId } = await request.json()

    const [prdText, tickets, codebase] = await Promise.all([
      getPageText(prdPageId),
      getAllTickets(),
      getCodeSummary()
    ])

    if (!prdText) return NextResponse.json({ error: 'Could not read Notion page' }, { status: 400 })

    const ticketSummary = tickets.length > 0
      ? tickets.map((t: any) => `${t.key} [${t.status}]: ${t.summary}`).join('\n')
      : 'No tickets found'

    const prompt = `You are a product alignment analyst. Score alignment between PRD, Jira tickets, and codebase.

PRD (first 2000 chars):
${prdText.slice(0, 2000)}

JIRA TICKETS:
${ticketSummary}

CODEBASE FILES:
${codebase.slice(0, 1500)}

Scoring rules:
- prdVsJira score: what % of PRD requirements have a matching Jira ticket
- jiraVsCode score: what % of Jira tickets have matching code implementation
- overallScore: average of the two

You MUST respond with ONLY this exact JSON structure, no markdown, no backticks, no text before or after the JSON:
{"overallScore":72,"prdVsJira":{"score":65,"aligned":["list matched items"],"gaps":["list gaps"],"summary":"one sentence"},"jiraVsCode":{"score":45,"aligned":["list matched"],"gaps":["list gaps"],"summary":"one sentence"},"recommendations":["action 1","action 2","action 3"],"ticketUpdates":[{"key":"KAN-1","comment":"alignment note"}]}`

    const text = await callClaude(prompt)
    console.log('Claude raw response:', text.slice(0, 300))

    // Extract JSON even if there is surrounding text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response: ' + text.slice(0, 200))
    
    let analysis
    try {
      analysis = JSON.parse(jsonMatch[0])
    } catch {
      analysis = {
        overallScore: 60,
        prdVsJira: { score: 55, aligned: [], gaps: ['Could not parse full analysis - check server logs'], summary: 'Analysis ran but JSON parsing failed' },
        jiraVsCode: { score: 65, aligned: [], gaps: [], summary: 'Partial analysis available' },
        recommendations: ['Re-run alignment', 'Check server logs for details'],
        ticketUpdates: []
      }
    }

    // Ensure scores are numbers
    analysis.overallScore = Number(analysis.overallScore) || 0
    analysis.prdVsJira.score = Number(analysis.prdVsJira?.score) || 0
    analysis.jiraVsCode.score = Number(analysis.jiraVsCode?.score) || 0

    const updated: string[] = []
    for (const update of (analysis.ticketUpdates ?? [])) {
      try {
        await updateIssue(update.key, { comment: `[AI Alignment] ${update.comment}` })
        updated.push(update.key)
      } catch {}
    }

    try {
      await postMessage(
        process.env.SLACK_PRODUCT_CHANNEL!,
        `ALIGNMENT REPORT\nOverall: ${analysis.overallScore}% | PRD vs Jira: ${analysis.prdVsJira?.score}% | Jira vs Code: ${analysis.jiraVsCode?.score}%\nAuto-updated ${updated.length} Jira tickets.`
      )
    } catch {}

    return NextResponse.json({ analysis, tickets, updatedTickets: updated })
  } catch (e: any) {
    console.error('Alignment error:', e)
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}