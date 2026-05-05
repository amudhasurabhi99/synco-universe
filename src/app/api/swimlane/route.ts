import { NextResponse } from 'next/server'
import { swimLane } from '@/lib/store'

export async function GET() {
  const sorted = [...swimLane].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return NextResponse.json(sorted)
}
