import type { VercelRequest, VercelResponse } from '@vercel/node'

const PESAPAL_BASE = 'https://pay.pesapal.com/v3'

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      consumer_key: process.env.VITE_PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.VITE_PESAPAL_CONSUMER_SECRET,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PesaPal auth failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  if (!data.token) throw new Error(`PesaPal auth: no token in response`)
  return data.token
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || 'https://bybisa.com'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { trackingId } = req.query

  if (!trackingId || typeof trackingId !== 'string') {
    return res.status(400).json({ error: 'Missing trackingId query parameter' })
  }

  try {
    const token = await getAuthToken()

    const statusRes = await fetch(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!statusRes.ok) {
      const text = await statusRes.text()
      throw new Error(`PesaPal status check failed (${statusRes.status}): ${text}`)
    }

    const data = await statusRes.json()
    return res.status(200).json(data)
  } catch (err: any) {
    console.error('PesaPal transaction-status error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
