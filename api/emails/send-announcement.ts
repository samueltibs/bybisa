import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendProductAnnouncement } from '../../src/lib/emailService'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      customer_emails,
      product_title,
      product_description,
      product_image,
      price,
      currency,
      shop_url,
      target_audience,
    } = req.body

    if (!customer_emails || !Array.isArray(customer_emails) || customer_emails.length === 0) {
      return res.status(400).json({ error: 'customer_emails array is required' })
    }

    const results = await sendProductAnnouncement({
      customer_emails,
      product_title: product_title || 'New Product',
      product_description: product_description || '',
      product_image: product_image || '',
      price: price || '0',
      currency: currency || 'UGX',
      shop_url: shop_url || 'https://bybisa.vercel.app/shop',
      target_audience: target_audience || 'fashion entrepreneurs',
    })

    return res.status(200).json({ success: true, sent: results.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('send-announcement error:', message)
    return res.status(500).json({ error: message })
  }
}
