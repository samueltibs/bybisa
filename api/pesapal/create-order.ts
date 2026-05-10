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
  if (!data.token) throw new Error(`PesaPal auth: no token in response: ${JSON.stringify(data)}`)
  return data.token
}

async function registerIPN(token: string, origin: string): Promise<string> {
  const ipnUrl = process.env.VITE_PESAPAL_IPN_URL || `${origin}/api/pesapal/ipn`
  const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: 'GET',
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PesaPal IPN registration failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  return data.ipn_id || ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS from bybisa domains
  const origin = req.headers.origin || 'https://bybisa.com'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id, currency, amount, description, billing_address } = req.body

    if (!id || !currency || !amount || !description || !billing_address?.email_address) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // 1. Get PesaPal auth token
    const token = await getAuthToken()

    // 2. Register IPN (get notification ID)
    let ipnId = ''
    try {
      ipnId = await registerIPN(token, 'https://bybisa.com')
    } catch (ipnErr) {
      // IPN registration failure is non-fatal â continue without it
      console.error('IPN registration failed (non-fatal):', ipnErr)
    }

    // 3. Submit order to PesaPal
    const orderPayload = {
      id,
      currency,
      amount,
      description,
      callback_url: `https://bybisa.com/payment-callback?ref=${id}`,
      notification_id: ipnId || undefined,
      billing_address,
    }

    const submitRes = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    })

    if (!submitRes.ok) {
      const text = await submitRes.text()
      throw new Error(`PesaPal submit order failed (${submitRes.status}): ${text}`)
    }

    const data = await submitRes.json()

    if (!data.redirect_url) {
      throw new Error(`PesaPal: no redirect_url in response: ${JSON.stringify(data)}`)
    }

    return res.status(200).json({
      redirect_url: data.redirect_url,
      order_tracking_id: data.order_tracking_id,
    })
  } catch (err: any) {
    console.error('PesaPal create-order error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
