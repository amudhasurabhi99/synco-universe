import { NextResponse } from 'next/server'
import { claudeJSON } from '@/lib/claude'
import { jiraSearch } from '@/lib/jira'
import { postMessage } from '@/lib/slack'
import { swimLane } from '@/lib/store'
import { DEMO_REPORT_RESPONSE } from '@/lib/demo-data'

interface WeeklyReport {
  headline: string
  prdCompletion: string
  progressNarrative: string
  risks: string[]
  recommendation: string
  driftScore: number
}

const REPORT_SYSTEM = `You are a project intelligence analyst for Snyco Universe.
Generate a concise weekly status report based on the project data provided.
Be specific with numbers. Write in professional but readable prose.

Respond ONLY with valid JSON — no markdown:
{
  "headline": string,
  "prdCompletion": string,
  "progressNarrative": string,
  "risks": string[],
  "recommendation": string,
  "driftScore": number
}`

export async function POST() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.json(DEMO_REPORT_RESPONSE)
  }

  try {
    const issues = await jiraSearch()
    const total = issues.length
    const delivered = issues.filter((i: any) => i.fields.status.name === 'Done').length
    const inProgress = issues.filter((i: any) => i.fields.status.name === 'In Progress').length
    const completion = total > 0 ? Math.round((delivered / total) * 100) : 0

    const flags = swimLane
    const flagsOpen = flags.filter(f => f.status === 'open').length
    const flagsAgreed = flags.filter(f => f.status === 'agreed').length
    const flagsDismissed = flags.filter(f => f.status === 'dismissed').length

    const report = await claudeJSON<WeeklyReport>(REPORT_SYSTEM,
      `Project: Snyco Universe\nTickets: ${total} total, ${delivered} done, ${inProgress} in progress\nPRD Completion: ${completion}%\nSwim Lane: ${flagsOpen} open, ${flagsAgreed} agreed, ${flagsDismissed} dismissed`
    )

    await postMessage(process.env.SLACK_PRODUCT_CHANNEL!,
      `📊 *SNYCO UNIVERSE — WEEKLY INTELLIGENCE REPORT*\n${report.headline}\n\n📦 PRD Completion: ${completion}%\n${report.prdCompletion}\n\n💡 Recommendation: ${report.recommendation}`
    )

    return NextResponse.json({ report, stats: { total, delivered, inProgress, completion } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
