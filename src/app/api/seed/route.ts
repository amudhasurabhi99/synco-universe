import { NextResponse } from 'next/server'
import { addFlag, swimLane } from '@/lib/store'

export async function GET() {
  // Clear existing flags first, then add fresh ones
  swimLane.length = 0

  addFlag({ jiraKey: 'KAN-3', prdRef: 'Section 2 — Authentication', description: 'PR implements basic auth but PRD requires OAuth 2.0 with SSO support.', confidence: 0.87, status: 'open' })
  addFlag({ jiraKey: 'KAN-7', prdRef: 'Section 4 — Payments', description: 'PR only handles Stripe. PRD requires Stripe and PayPal.', confidence: 0.91, status: 'open' })
  addFlag({ jiraKey: 'KAN-2', prdRef: 'Section 1 — Onboarding', description: 'Missing email verification step specified in PRD.', confidence: 0.78, status: 'dismissed', dismissReason: 'Acceptable variation' })

  return NextResponse.json({ seeded: true, flagCount: swimLane.length })
}
