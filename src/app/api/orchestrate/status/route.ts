import { NextResponse } from 'next/server'
import { ping as notionPing } from '@/lib/notion'
import { ping as slackPing } from '@/lib/slack'
import { ping as jiraPing } from '@/lib/jira'

async function claudePing(): Promise<boolean> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      }
    })
    return res.ok
  } catch { return false }
}

export async function GET() {
  const [notion, slack, jira, claude] = await Promise.all([
    notionPing(), slackPing(), jiraPing(), claudePing()
  ])
  return NextResponse.json({ notion, slack, jira, claude })
}
