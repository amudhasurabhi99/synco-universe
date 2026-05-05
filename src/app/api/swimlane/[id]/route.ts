import { NextResponse } from 'next/server'
import { updateFlag, swimLane } from '@/lib/store'
import { createIssue } from '@/lib/jira'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { action, reason } = await request.json()

  if (action === 'agree') {
    const flag = swimLane.find(f => f.id === id)
    if (flag) {
      await createIssue({
        title: `[Swim Lane] ${flag.jiraKey}: ${flag.prdRef}`,
        description: flag.description,
        priority: 'High'
      })
    }
    updateFlag(id, { status: 'agreed' })
  } else if (action === 'dismiss') {
    updateFlag(id, { status: 'dismissed', dismissReason: reason })
  }

  return NextResponse.json(swimLane.find(f => f.id === id))
}
