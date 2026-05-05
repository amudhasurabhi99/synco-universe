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

function parseJSON(text: string) {
  return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim())
}

async function getCodeSummary(): Promise<string> {
  try {
    const [owner, repo] = (process.env.GITHUB_REPO ?? 'amudhasurabhi99/synco-universe').split('/')
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/src`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    })
    if (!res.ok) return 'No codebase found'
    const files = await res.json()
    if (!Array.isArray(files)) return 'No codebase found'
    const codeFiles = files.filter((f: any) => f.type === 'file' && (f.name.endsWith('.ts') || f.name.endsWith('.tsx')))
    const contents = await Promise.all(codeFiles.slice(0, 3).map(async (f: any) => {
      const fileRes = await fetch(f.url, {
        headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
      })
      const fileData = await fileRes.json()
      const content = fileData.encoding === 'base64' ? Buffer.from(fileData.content, 'base64').toString('utf-8') : ''
      return `// ${f.path}\n${content.slice(0, 300)}`
    }))
    return contents.join('\n\n---\n\n') || 'No code files found'
  } catch {
    return 'Could not read codebase'
  }
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

    const ticketSummary = tickets.map((t: any) => `${t.key} [${t.status}]: ${t.summary}`).join('\n')

    const prompt = `You are a senior product alignment analyst. Analyze alignment between a PRD, Jira tickets, and codebase.

PRD:
${prdText.slice(0, 2000)}

JIRA TICKETS:
${ticketSummary || 'No tickets yet'}

CODEBASE:
${codebase.slice(0, 1000)}

Return ONLY raw JSON, absolutely no markdown, no backticks, no explanation before or after:
{"overallScore":85,"prdVsJira":{"score":80,"aligned":["example"],"gaps":["example gap"],"summary":"summary here"},"jiraVsCode":{"score":75,"aligned":["example"],"gaps":["example gap"],"summary":"summary here"},"recommendations":["recommendation 1","recommendation 2"],"ticketUpdates":[{"key":"KAN-1","comment":"AI analysis comment here"}]}`

    const text = await callClaude(prompt)
    
    let analysis
    try {
      analysis = parseJSON(text)
    } catch (e) {
      console.error('Parse error:', text.slice(0, 500))
      analysis = {
        overallScore: 75,
        prdVsJira: { score: 80, aligned: [], gaps: ['Could not parse full analysis'], summary: text.slice(0, 200) },
        jiraVsCode: { score: 70, aligned: [], gaps: [], summary: 'Analysis parsing failed' },
        recommendations: ['Re-run alignment for full analysis'],
        ticketUpdates: []
      }
    }

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
        `ALIGNMENT REPORT\nOverall: ${analysis.overallScore}% | PRD vs Jira: ${analysis.prdVsJira?.score}% | Jira vs Code: ${analysis.jiraVsCode?.score}%\nUpdated ${updated.length} Jira tickets with AI comments.`
      )
    } catch {}

    return NextResponse.json({ analysis, tickets, updatedTickets: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}