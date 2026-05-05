import { NextResponse } from 'next/server'
import { getChildPages, getPageText } from '@/lib/notion'
import { getAllTickets, createIssue, updateIssue } from '@/lib/jira'
import { getFullCodeSummary } from '@/lib/github'
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

function parseJSON(text: string) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found')
  return JSON.parse(match[0])
}

export async function POST(request: Request) {
  try {
    const { parentPageId } = await request.json()
    const [owner, repo] = (process.env.GITHUB_REPO ?? 'amudhasurabhi99/synco-universe').split('/')

    // Step 1 - fetch all PRD pages, tickets, and codebase in parallel
    const [prdPages, existingTickets, codebase] = await Promise.all([
      getChildPages(parentPageId),
      getAllTickets(),
      getFullCodeSummary(owner, repo)
    ])

    if (prdPages.length === 0) {
      return NextResponse.json({ error: 'No PRD pages found inside this folder. Make sure child pages are shared with your integration.' }, { status: 400 })
    }

    // Step 2 - fetch all PRD texts in parallel
    const prdTexts = await Promise.all(
      prdPages.map(async p => ({
        id: p.id,
        title: p.title,
        text: await getPageText(p.id)
      }))
    )

    const ticketSummary = existingTickets.length > 0
      ? existingTickets.map((t: any) => `${t.key} [${t.status}]: ${t.summary}`).join('\n')
      : 'No existing tickets'

    const prdSummary = prdTexts.map(p => `=== PRD: ${p.title} ===\n${p.text.slice(0, 1500)}`).join('\n\n')

    // Step 3 - run full cross-check analysis
    const analysisPrompt = `You are a senior product alignment analyst. Analyze ALL PRDs against Jira tickets and codebase.

ALL PRDs:
${prdSummary}

EXISTING JIRA TICKETS:
${ticketSummary}

CODEBASE (${codebase.fileCount} files found):
${codebase.summary.slice(0, 2000)}

Tasks:
1. Score overall alignment (0-100)
2. Find gaps — requirements in PRDs with no Jira ticket
3. Find code gaps — tickets with no code implementation
4. List tickets to CREATE (missing from Jira)
5. List tickets to UPDATE (exist but need comments)

Return ONLY raw JSON no markdown no backticks:
{
  "overallScore": 65,
  "prdVsJira": {
    "score": 70,
    "aligned": ["list of matched requirements"],
    "gaps": ["list of PRD requirements missing from Jira"],
    "summary": "one sentence"
  },
  "jiraVsCode": {
    "score": 45,
    "aligned": ["list of implemented tickets"],
    "gaps": ["list of tickets with no code"],
    "summary": "one sentence"
  },
  "recommendations": ["action 1", "action 2"],
  "ticketsToCreate": [
    {"title": "ticket title", "description": "what and why", "priority": "High", "prdRef": "which PRD"}
  ],
  "ticketUpdates": [
    {"key": "KAN-1", "comment": "alignment note"}
  ]
}`

    const analysisText = await callClaude(analysisPrompt)
    let analysis
    try {
      analysis = parseJSON(analysisText)
    } catch {
      analysis = {
        overallScore: 50,
        prdVsJira: { score: 50, aligned: [], gaps: ['Could not parse analysis'], summary: 'Analysis incomplete' },
        jiraVsCode: { score: 50, aligned: [], gaps: [], summary: 'Analysis incomplete' },
        recommendations: ['Re-run scan'],
        ticketsToCreate: [],
        ticketUpdates: []
      }
    }

    // Ensure scores are numbers
    analysis.overallScore = Number(analysis.overallScore) || 0
    analysis.prdVsJira.score = Number(analysis.prdVsJira?.score) || 0
    analysis.jiraVsCode.score = Number(analysis.jiraVsCode?.score) || 0

    // Step 4 - auto-create missing tickets
    const createdTickets: string[] = []
    for (const ticket of (analysis.ticketsToCreate ?? [])) {
      try {
        const result = await createIssue({
          title: ticket.title,
          description: `[Auto-created by Snyco Intelligence]\nPRD: ${ticket.prdRef}\n\n${ticket.description}`,
          priority: ticket.priority ?? 'Medium'
        })
        createdTickets.push(result.key)
      } catch {}
    }

    // Step 5 - auto-update existing tickets
    const updatedTickets: string[] = []
    for (const update of (analysis.ticketUpdates ?? [])) {
      try {
        await updateIssue(update.key, { comment: `[AI Alignment Scan] ${update.comment}` })
        updatedTickets.push(update.key)
      } catch {}
    }

    // Step 6 - post to Slack
    try {
      await postMessage(
        process.env.SLACK_PRODUCT_CHANNEL!,
        `SNYCO INTELLIGENCE SCAN COMPLETE\n` +
        `PRDs scanned: ${prdPages.length} | Overall alignment: ${analysis.overallScore}%\n` +
        `PRD vs Jira: ${analysis.prdVsJira?.score}% | Jira vs Code: ${analysis.jiraVsCode?.score}%\n` +
        `Auto-created ${createdTickets.length} tickets | Updated ${updatedTickets.length} tickets\n` +
        `New tickets: ${createdTickets.join(', ') || 'none'}`
      )
    } catch {}

    return NextResponse.json({
      analysis,
      prdPages: prdPages.map(p => p.title),
      existingTickets,
      createdTickets,
      updatedTickets,
      codebaseFiles: codebase.files,
      fileCount: codebase.fileCount
    })

  } catch (e: any) {
    console.error('Scan error:', e)
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}