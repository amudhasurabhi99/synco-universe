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
  if (!data.content || !data.content[0]) throw new Error('Empty Claude response')
  return data.content[0].text
}

export async function POST() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return NextResponse.json(DEMO_REPORT_RESPONSE)

  try {
    const issues = await jiraSearch()
    const total = issues.length
    const delivered = issues.filter((i: any) => i.fields.status.name === 'Done').length
    const inProgress = issues.filter((i: any) => i.fields.status.name === 'In Progress').length
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
- Swim lane flags: ${flagsOpen} open, ${flagsAgreed} agreed, ${flagsDismissed} dismissed

Return exactly this JSON structure:
{"headline":"one sentence summary","prdCompletion":"2 sentences on delivery","progressNarrative":"2 sentences on in progress work","risks":["risk 1","risk 2"],"recommendation":"one action","driftScore":85}`

    const text = await callClaude(prompt)
    const cleaned = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim()
    
    let report
    try {
      report = JSON.parse(cleaned)
    } catch {
      report = {
        headline: 'Project progressing steadily this week.',
        prdCompletion: `${delivered} of ${total} tickets delivered. ${completion}% complete.`,
        progressNarrative: `${inProgress} tickets currently in progress.`,
        risks: ['Monitor ticket velocity to stay on track.'],
        recommendation: 'Review in-progress tickets in next standup.',
        driftScore: 80
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