export async function getChannelHistory(channelId: string, limit = 100): Promise<string> {
  const res = await fetch(`https://slack.com/api/conversations.history?channel=${channelId}&limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}` }
  })
  const data = await res.json()
  if (!data.ok) return ''
  return (data.messages ?? [])
    .filter((m: any) => !m.subtype)
    .map((m: any) => m.text)
    .join('\n')
}

export async function postMessage(channelId: string, text: string): Promise<void> {
  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ channel: channelId, text })
  })
}

export async function ping(): Promise<boolean> {
  try {
    const res = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}` }
    })
    const data = await res.json()
    return data.ok === true
  } catch { return false }
}
