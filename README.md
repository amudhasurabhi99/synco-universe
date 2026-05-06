# Snyco Universe — Product Intelligence Agent

> Catches the gap between what your PM wrote, what your team planned, and what your engineers actually built — before it becomes a problem.

## What it does

Snyco Universe is an autonomous agent that connects Notion, GitHub, Jira, and Slack and keeps them honest with each other. One click triggers a full cross-system alignment check — no forms, no manual input, no chasing people.

**In a single scan it:**
- Reads every PRD in your Notion workspace
- Scans your entire GitHub codebase
- Fetches all Jira tickets (open, in-progress, done)
- Scores alignment between all three using Claude AI
- Auto-creates missing tickets in Jira
- Flags misalignments in the swim lane dashboard
- Posts a full report to Slack

## The problem it solves

Product teams waste 7+ hours per sprint manually bridging four tools that don't talk to each other. Snyco eliminates that entirely.

| Task | Before | After |
|------|--------|-------|
| Writing tickets from PRD | 3 hrs | 0 — auto-created |
| Alignment checking | 2 hrs | 0 — auto-scored |
| Weekly status report | 2 hrs | 0 — auto-generated |
| **Total per PM per sprint** | **7 hrs** | **~2 min** |

## Architecture
- **Next.js 14** API routes — pure orchestration, no external queue
- **Claude AI** — semantic alignment scoring, ticket generation, report writing
- **Self-correction Gate 1** — sub-90% alignment score halts ticket creation, alerts Slack
- **Self-correction Gate 2** — sub-70% confidence flags are silently discarded

## Tech stack

- Next.js 14 + TypeScript + App Router
- Tailwind CSS (inline styles design system)
- Anthropic Claude API (claude-sonnet-4-5)
- Notion API, Jira REST API, GitHub API, Slack Web API
- Deployed on Vercel

## Getting started

```bash
git clone https://github.com/amudhasurabhi99/synco-universe.git
cd synco-universe
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment variables

```bash
ANTHROPIC_API_KEY=
NOTION_API_KEY=
NOTION_CONTEXT_PAGE_IDS=
NEXT_PUBLIC_NOTION_PARENT_PAGE_ID=
SLACK_BOT_TOKEN=
SLACK_PRODUCT_CHANNEL=
SLACK_SWIMLANE_CHANNEL=
JIRA_BASE_URL=
JIRA_EMAIL=
JIRA_API_TOKEN=
JIRA_PROJECT_KEY=
GITHUB_TOKEN=
GITHUB_REPO=
GITHUB_WEBHOOK_SECRET=
NEXT_PUBLIC_DEMO_MODE=false
```

## Live demo

[synco-universe.vercel.app](https://synco-universe.vercel.app)

## Built for

Snyco Hackathon 2025 — Track 2: Autonomous Project Intelligence
