import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendWelcome } from '../../src/lib/emailService'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customer_email, customer_name, product_title, product_type } = req.body

    if (!customer_email) {
      return res.status(400).json({ error: 'customer_email is required' })
    }

    const result = await sendWelcome({
      customer_email,
      customer_name: customer_name || 'Entrepreneur',
      product_title: product_title || 'Your Product',
      product_type: product_type || 'template',
    })

    return res.status(200).json({ success: true, id: result.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('send-welcome error:', message)
    return res.status(500).json({ error: message })
  }
}
