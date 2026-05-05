import { NextResponse } from 'next/server'
import { claudeJSON } from '@/lib/claude'
import { getPageText, getContextPages } from '@/lib/notion'
import { getChannelHistory, postMessage } from '@/lib/slack'
import { createIssue } from '@/lib/jira'
import { DEMO_PRD_RESPONSE } from '@/lib/demo-data'

interface AlignmentResult {
  score: number
  recommendation: 'proceed' | 'review'
  gaps: string[]
  summary: string
}

interface Ticket {
  title: string
  description: string
  priority: 'Highest' | 'High' | 'Medium' | 'Low'
  prdSection: string
  epic: string
}

const ALIGNMENT_SYSTEM = `You are a product alignment analyst for Snyco Universe.
Evaluate the PRD against the company knowledge base.
Score 90-100: well aligned. 70-89: minor gaps. Below 70: significant issues.

Respond ONLY with valid JSON — no markdown, no explanation:
{
  "score": number,
  "recommendation": "proceed" | "review",
  "gaps": [],
  "summary": string
}`

const TICKET_SYSTEM = `You are a senior product manager. Convert this PRD into actionable Jira tickets.
Each ticket must carry the WHY from the PRD, not just the WHAT.
Generate 5-12 tickets. Prioritise using language signals:
must/critical/required = Highest, should/important = High, nice-to-have/optional = Low.

Respond ONLY with a valid JSON array — no markdown, no explanation:
[{
  "title": string,
  "description": string,
  "priority": "Highest"|"High"|"Medium"|"Low",
  "prdSection": string,
  "epic": string
}]`

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.json(DEMO_PRD_RESPONSE)
  }

  try {
    const { prdPageId } = await request.json()

    const prdText = await getPageText(prdPageId)
    if (!prdText) return NextResponse.json({ error: 'Could not read Notion page' }, { status: 400 })

    const [notionContext, slackContext] = await Promise.all([
      getContextPages(),
      getChannelHistory(process.env.SLACK_PRODUCT_CHANNEL!, 100)
    ])

    const alignment = await claudeJSON<AlignmentResult>(ALIGNMENT_SYSTEM,
      `Company Context (Notion):\n${notionContext}\n\nCompany Context (Slack):\n${slackContext}\n\nPRD:\n${prdText}`
    )

    if (alignment.score < 90) {
      await postMessage(process.env.SLACK_PRODUCT_CHANNEL!,
        `⚠️ PRD alignment ${alignment.score}%. Gaps: ${alignment.gaps.join(', ')}. Human review needed.`)
      return NextResponse.json({ alignment, tickets: [], halted: true, reason: 'score_below_threshold' })
    }

    const tickets = await claudeJSON<Ticket[]>(TICKET_SYSTEM, `PRD:\n${prdText}`)

    const created = []
    for (const ticket of tickets) {
      try {
        const result = await createIssue(ticket)
        created.push({ ...ticket, jiraKey: result.key, jiraId: result.id })
      } catch {
        created.push({ ...ticket, jiraKey: null, jiraError: true })
      }
    }

    await postMessage(process.env.SLACK_PRODUCT_CHANNEL!,
      `✅ PRD aligned at ${alignment.score}%. ${created.length} tickets created in Jira.`)

    return NextResponse.json({ alignment, tickets: created, halted: false })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
