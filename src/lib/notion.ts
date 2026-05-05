const NOTION_VERSION = '2022-06-28'

export async function getPageText(pageId: string): Promise<string> {
  const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION
    }
  })
  const data = await res.json()
  if (!data.results) return ''
  return data.results.map((block: any) => {
    const type = block.type
    const supported = ['paragraph','heading_1','heading_2','heading_3','bulleted_list_item','numbered_list_item']
    if (!supported.includes(type)) return ''
    const rich = block[type]?.rich_text ?? []
    return rich.map((r: any) => r.plain_text).join('')
  }).filter(Boolean).join('\n')
}

export async function getContextPages(): Promise<string> {
  const ids = (process.env.NOTION_CONTEXT_PAGE_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const pages = await Promise.all(ids.map(getPageText))
  return pages.join('\n\n---\n\n')
}

export async function ping(): Promise<boolean> {
  try {
    const res = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION
      }
    })
    return res.ok
  } catch { return false }
}
