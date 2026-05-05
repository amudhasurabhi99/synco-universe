import { NextResponse } from 'next/server'
import { jiraSearch } from '@/lib/jira'
import { postMessage } from '@/lib/slack'
import { swimLane } from '@/lib/store'
import { DEMO_REPORT_RESPONSE } from '@/lib/demo-data'

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
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!data.content?.[0]) throw new Error('Empty Claude response')
  return data.content[0].text
}

export async function POST() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return NextResponse.json(DEMO_REPORT_RESPONSE)

  try {
    const issues = await jiraSearch()
    
    const total = issues.length
    const delivered = issues.filter((i: any) => {
      const status = i?.fields?.status?.name ?? ''
      return status === 'Done'
    }).length
    const inProgress = issues.filter((i: any) => {
      const status = i?.fields?.status?.name ?? ''
      return status === 'In Progress'
    }).length
    const completion = total > 0 ? Math.round((delivered / total) * 100) : 0

    const flagsOpen = swimLane.filter(f => f.status === 'open').length
    const flagsAgreed = swimLane.filter(f => f.status === 'agreed').length
    const flagsDismissed = swimLane.filter(f => f.status === 'dismissed').length

    const prompt = `You are a project intelligence analyst. Generate a weekly status report as JSON only.
No markdown, no backticks, no explanation. Return only raw JSON.

Project data:
- Total tickets: ${total}
- Done: ${delivered}
- In Progress: ${inProgress}
- Completion: ${completion}%
- Swim lane: ${flagsOpen} open flags, ${flagsAgreed} agreed, ${flagsDismissed} dismissed

Return exactly this JSON:
{"headline":"one sentence summary of the week","prdCompletion":"2 sentences on delivery progress","progressNarrative":"2 sentences on what is in progress","risks":["risk 1","risk 2"],"recommendation":"one clear action to take","driftScore":82}`

    const text = await callClaude(prompt)
    const cleaned = text.replace(/```json/g,'').replace(/```/g,'').trim()
    
    let report
    try {
      report = JSON.parse(cleaned)
    } catch {
      report = {
        headline: `Project has ${total} tickets, ${delivered} delivered, ${completion}% complete.`,
        prdCompletion: `${delivered} of ${total} tickets delivered this sprint.`,
        progressNarrative: `${inProgress} tickets currently in progress across the team.`,
        risks: ['Monitor ticket velocity to stay on track.'],
        recommendation: 'Review in-progress tickets in next standup.',
        driftScore: 75
      }
    }

    try {
      await postMessage(
        process.env.SLACK_PRODUCT_CHANNEL!,
        `SNYCO UNIVERSE WEEKLY REPORT
${report.headline}
PRD Completion: ${completion}%
Recommendation: ${report.recommendation}`
      )
    } catch {}

    return NextResponse.json({ report, stats: { total, delivered, inProgress, completion } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
