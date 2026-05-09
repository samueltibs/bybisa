import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendReviewRequest } from '../../src/lib/emailService'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customer_email, customer_name, product_title, product_id } = req.body

    if (!customer_email || !product_id) {
      return res.status(400).json({ error: 'customer_email and product_id are required' })
    }

    const result = await sendReviewRequest({
      customer_email,
      customer_name: customer_name || 'Entrepreneur',
      product_title: product_title || 'Your Product',
      product_id,
    })

    return res.status(200).json({ success: true, id: result.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('send-review-request error:', message)
    return res.status(500).json({ error: message })
  }
}
