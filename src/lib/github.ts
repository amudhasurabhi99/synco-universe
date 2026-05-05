import crypto from 'crypto'

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const sig = Buffer.from(signature, 'utf8')
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!)
  const digest = Buffer.from('sha256=' + hmac.update(payload).digest('hex'), 'utf8')
  if (sig.length !== digest.length) return false
  return crypto.timingSafeEqual(digest, sig)
}

export async function getPRDetails(owner: string, repo: string, prNumber: number) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
  })
  const data = await res.json()
  return { title: data.title, body: data.body, merged: data.merged }
}

async function getFilesRecursive(owner: string, repo: string, path: string, depth: number): Promise<{path: string, url: string}[]> {
  if (depth > 3) return []
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
  })
  if (!res.ok) return []
  const items = await res.json()
  if (!Array.isArray(items)) return []
  
  const files: {path: string, url: string}[] = []
  for (const item of items) {
    if (item.type === 'file' && (
      item.name.endsWith('.ts') || item.name.endsWith('.tsx') ||
      item.name.endsWith('.js') || item.name.endsWith('.py') ||
      item.name.endsWith('.jsx')
    )) {
      // Skip config and node_modules
      if (!item.path.includes('node_modules') && !item.path.includes('.config.') && !item.path.includes('next-env')) {
        files.push({ path: item.path, url: item.url })
      }
    } else if (item.type === 'dir' && !item.name.includes('node_modules') && !item.name.startsWith('.')) {
      const subFiles = await getFilesRecursive(owner, repo, item.path, depth + 1)
      files.push(...subFiles)
    }
  }
  return files
}

export async function getFullCodeSummary(owner: string, repo: string): Promise<{summary: string, fileCount: number, files: string[]}> {
  try {
    const allFiles = await getFilesRecursive(owner, repo, '', 0)
    const fileNames = allFiles.map(f => f.path)
    
    // Read up to 8 most relevant files
    const relevantFiles = allFiles
      .filter(f => !f.path.includes('layout') && !f.path.includes('page.tsx') && !f.path.includes('route.ts'))
      .slice(0, 8)
    
    const contents = await Promise.all(relevantFiles.map(async f => {
      try {
        const res = await fetch(f.url, {
          headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
        })
        const data = await res.json()
        const content = data.encoding === 'base64' ? Buffer.from(data.content, 'base64').toString('utf-8') : ''
        return `// FILE: ${f.path}\n${content.slice(0, 600)}`
      } catch { return `// FILE: ${f.path} (could not read)` }
    }))

    return {
      summary: contents.join('\n\n---\n\n'),
      fileCount: allFiles.length,
      files: fileNames
    }
  } catch (e: any) {
    return { summary: 'Could not read codebase: ' + e.message, fileCount: 0, files: [] }
  }
}