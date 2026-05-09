import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendDownloadReminder } from '../../src/lib/emailService'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customer_email, customer_name, product_title, download_url } = req.body

    if (!customer_email || !download_url) {
      return res.status(400).json({ error: 'customer_email and download_url are required' })
    }

    const result = await sendDownloadReminder({
      customer_email,
      customer_name: customer_name || 'Entrepreneur',
      product_title: product_title || 'Your Product',
      download_url,
    })

    return res.status(200).json({ success: true, id: result.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('send-reminder error:', message)
    return res.status(500).json({ error: message })
  }
}
