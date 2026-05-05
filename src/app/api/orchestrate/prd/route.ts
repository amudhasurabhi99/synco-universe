import { NextResponse } from 'next/server'
import { getPageText, getContextPages } from '@/lib/notion'
import { getChannelHistory, postMessage } from '@/lib/slack'
import { createIssue } from '@/lib/jira'
import { DEMO_PRD_RESPONSE } from '@/lib/demo-data'

interface AlignmentResult { score: number; recommendation: string; gaps: string[]; summary: string }
interface Ticket { title: string; description: string; priority: 'Highest'|'High'|'Medium'|'Low'; prdSection: string; epic: string }

const ALIGNMENT_SYSTEM = `You are a product alignment analyst. Evaluate the PRD against company context. Score 0-100 how well aligned it is. Respond ONLY with this exact JSON format, no markdown, no backticks: {"score": 92, "recommendation": "proceed", "gaps": [], "summary": "one sentence summary here"}`

const TICKET_SYSTEM = `You are a senior product manager. Convert this PRD into 5-8 actionable Jira tickets. Respond ONLY with a JSON array, no markdown, no backticks, no explanation: [{"title": "short action title", "description": "what and why", "priority": "High", "prdSection": "section name", "epic": "epic name"}]`

async function callClaude(system: string, user: string): Promise<string> {
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
      system,
      messages: [{ role: 'user', content: user }]
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  if (!data.content || !data.content[0]) throw new Error('Empty response from Claude: ' + JSON.stringify(data))
  return data.content[0].text
}

function parseJSON(text: string) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned)
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return NextResponse.json(DEMO_PRD_RESPONSE)

  try {
    const { prdPageId } = await request.json()

    const prdText = await getPageText(prdPageId)
    if (!prdText) return NextResponse.json({ error: 'Could not read Notion page — make sure the page is shared with your integration' }, { status: 400 })

    const [notionContext, slackContext] = await Promise.all([
      getContextPages(),
      getChannelHistory(process.env.SLACK_PRODUCT_CHANNEL!, 100)
    ])

    const alignmentText = await callClaude(ALIGNMENT_SYSTEM,
      `Company Context:\n${notionContext || 'No context available'}\n\nSlack Context:\n${slackContext || 'No slack messages'}\n\nPRD to evaluate:\n${prdText}`)

    let alignment: AlignmentResult
    try { alignment = parseJSON(alignmentText) }
    catch { alignment = { score: 85, recommendation: 'review', gaps: ['Could not parse alignment'], summary: alignmentText.slice(0, 200) } }

    if (alignment.score < 90) {
      try { await postMessage(process.env.SLACK_PRODUCT_CHANNEL!, `PRD alignment ${alignment.score}%. Gaps: ${alignment.gaps.join(', ')}. Human review needed.`) } catch {}
      return NextResponse.json({ alignment, tickets: [], halted: true, reason: 'score_below_threshold' })
    }

    const ticketsText = await callClaude(TICKET_SYSTEM, `PRD:\n${prdText}`)
    let tickets: Ticket[]
    try { tickets = parseJSON(ticketsText) }
    catch { return NextResponse.json({ error: 'Could not parse tickets: ' + ticketsText.slice(0, 200) }, { status: 502 }) }

    const created = []
    for (const ticket of tickets) {
      try { const result = await createIssue(ticket); created.push({ ...ticket, jiraKey: result.key, jiraId: result.id }) }
      catch (e: any) { created.push({ ...ticket, jiraKey: null, jiraError: true, jiraErrorMsg: e.message }) }
    }

    try { await postMessage(process.env.SLACK_PRODUCT_CHANNEL!, `PRD aligned at ${alignment.score}%. ${created.length} tickets created in Jira.`) } catch {}

    return NextResponse.json({ alignment, tickets: created, halted: false })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}