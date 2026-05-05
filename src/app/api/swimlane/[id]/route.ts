import { NextResponse } from 'next/server'
import { updateFlag, swimLane } from '@/lib/store'
import { createIssue } from '@/lib/jira'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { action, reason } = await request.json()
  const { id } = params

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

  const updated = swimLane.find(f => f.id === id)
  return NextResponse.json(updated)
}
