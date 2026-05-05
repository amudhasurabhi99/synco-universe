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
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json'
    }
  })
  const data = await res.json()
  return { title: data.title, body: data.body, merged: data.merged }
}
