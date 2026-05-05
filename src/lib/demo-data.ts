export const DEMO_PRD_RESPONSE = {
  alignment: {
    score: 92,
    recommendation: 'proceed',
    gaps: [],
    summary: 'PRD aligns well with company strategy and existing work.'
  },
  tickets: [
    { title: 'Implement OAuth 2.0 authentication flow', jiraKey: 'KAN-1', priority: 'Highest', prdSection: 'Section 1 — Auth', epic: 'Authentication', description: 'Build OAuth 2.0 login with Google. Required for all user-facing flows.' },
    { title: 'Build user onboarding wizard', jiraKey: 'KAN-2', priority: 'High', prdSection: 'Section 2 — Onboarding', epic: 'Onboarding', description: 'Step-by-step onboarding flow for new users. Reduces drop-off rate.' },
    { title: 'Integrate Stripe payment gateway', jiraKey: 'KAN-3', priority: 'Highest', prdSection: 'Section 3 — Payments', epic: 'Payments', description: 'Stripe integration for subscription billing. Core revenue feature.' },
    { title: 'Add PayPal as payment option', jiraKey: 'KAN-4', priority: 'High', prdSection: 'Section 3 — Payments', epic: 'Payments', description: 'PayPal checkout alongside Stripe. Increases conversion by 15%.' },
    { title: 'Build dashboard analytics view', jiraKey: 'KAN-5', priority: 'Medium', prdSection: 'Section 4 — Analytics', epic: 'Analytics', description: 'Usage metrics dashboard for admins. Needed for reporting.' },
    { title: 'Set up email notification system', jiraKey: 'KAN-6', priority: 'High', prdSection: 'Section 5 — Notifications', epic: 'Notifications', description: 'Transactional emails for key user events. Required for activation.' },
    { title: 'Implement role-based access control', jiraKey: 'KAN-7', priority: 'High', prdSection: 'Section 1 — Auth', epic: 'Authentication', description: 'Admin and user roles with permission gates. Security requirement.' },
    { title: 'Add export to CSV feature', jiraKey: 'KAN-8', priority: 'Low', prdSection: 'Section 4 — Analytics', epic: 'Analytics', description: 'Let users export their data. Nice-to-have for power users.' }
  ],
  halted: false
}

export const DEMO_REPORT_RESPONSE = {
  report: {
    headline: 'Strong week — 3 tickets delivered, PRD 37% complete, no critical drift.',
    prdCompletion: 'Three of eight requirements shipped this sprint. Payments epic on track.',
    progressNarrative: 'Auth and onboarding tickets are in progress. Two PRs open.',
    risks: [
      'Payment integration complexity may push delivery by 2 days.',
      'Swim lane flag on KAN-4 unresolved — needs PM decision.'
    ],
    recommendation: 'Resolve KAN-4 swim lane flag before next sprint planning.',
    driftScore: 88
  },
  stats: { total: 8, delivered: 3, inProgress: 2, completion: 37 }
}
