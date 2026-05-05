import { NextResponse } from 'next/server'
import { getAllPages } from '@/lib/notion'

export async function GET() {
  try {
    const pages = await getAllPages()
    return NextResponse.json(pages)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}