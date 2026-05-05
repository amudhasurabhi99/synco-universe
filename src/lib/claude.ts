export async function claudeJSON<T>(system: string, user: string): Promise<T> {
  const call = async () => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: user }]
      })
    })
    const data = await res.json()
    return data.content[0].text
  }
  try {
    const text = await call()
    return JSON.parse(text)
  } catch {
    const text = await call()
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('Claude returned invalid JSON')
    }
  }
}

export async function claudeText(system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }]
    })
  })
  const data = await res.json()
  return data.content[0].text
}
