import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/github'
import { claudeJSON } from '@/lib/claude'
import { getIssueByKey } from '@/lib/jira'
import { postMessage } from '@/lib/slack'
import { addFlag } from '@/lib/store'

interface MisalignCheck {
  aligned: boolean
  confidence: number
  description: string
  prdRef: string
}

const MISALIGN_SYSTEM = `You are a code review alignment analyst for Snyco Universe.
Compare a GitHub pull request against the Jira ticket it claims to implement.
Flag only significant divergences — minor implementation choices are acceptable.

Respond ONLY with valid JSON — no markdown:
{
  "aligned": boolean,
  "confidence": number,
  "description": string,
  "prdRef": string
}`

export async function POST(request: Request) {
  const sig = request.headers.get('x-hub-signature-256') ?? ''
  const body = await request.text()

  if (!verifyWebhookSignature(body, sig)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(body)
  const { action, pull_request: pr } = payload

  if (action === 'opened') {
    const jiraKey = pr.title.match(/([A-Z]+-[0-9]+)/)?.[1]
    if (!jiraKey) return NextResponse.json({ skipped: 'no jira key in PR title' })

    try {
      const issue = await getIssueByKey(jiraKey)
      const check = await claudeJSON<MisalignCheck>(MISALIGN_SYSTEM,
        `Ticket requirement: ${issue.summary}\n${issue.description}\n\nPR Title: ${pr.title}\nPR Body: ${pr.body ?? 'No description'}`
      )

      if (!check.aligned && check.confidence >= 0.7) {
        addFlag({
          jiraKey, prdRef: check.prdRef,
          description: check.description,
          confidence: check.confidence,
          status: 'open'
        })
      }

      return NextResponse.json({ checked: true, flagged: !check.aligned && check.confidence >= 0.7 })
    } catch {
      return NextResponse.json({ error: 'check failed' }, { status: 502 })
    }
  }

  if (action === 'closed' && pr?.merged) {
    await postMessage(process.env.SLACK_PRODUCT_CHANNEL!,
      `🚀 PR #${pr.number} merged: ${pr.title}. Update Jira ticket ${pr.title.match(/[A-Z]+-[0-9]+/)?.[0] ?? ''} to Done.`
    )
    return NextResponse.json({ merged: true })
  }

  return NextResponse.json({ skipped: 'unhandled action' })
}
