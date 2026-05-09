import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendReceipt } from '../../src/lib/emailService'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      customer_email,
      customer_name,
      order_number,
      product_title,
      amount,
      currency,
      payment_method,
      payment_reference,
      download_url,
      remaining_downloads,
      purchase_date,
    } = req.body

    if (!customer_email || !order_number) {
      return res.status(400).json({ error: 'customer_email and order_number are required' })
    }

    const result = await sendReceipt({
      customer_email,
      customer_name: customer_name || 'Entrepreneur',
      order_number,
      product_title: product_title || 'Your Product',
      amount: amount || '0',
      currency: currency || 'UGX',
      payment_method: payment_method || 'PesaPal',
      payment_reference: payment_reference || '',
      download_url: download_url || '',
      remaining_downloads: remaining_downloads ?? 5,
      purchase_date: purchase_date || new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' }),
    })

    return res.status(200).json({ success: true, id: result.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('send-receipt error:', message)
    return res.status(500).json({ error: message })
  }
}
