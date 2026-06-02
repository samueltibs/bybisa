import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
)

const RESEND_API_KEY = process.env.RESEND_API_KEY

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { buyer_email, buyer_name, product_id, order_id } = req.body
  if (!buyer_email || !product_id) return res.status(400).json({ error: 'Missing fields' })

  try {
    // Look up product
    const { data: product } = await supabase
      .from('bybisa_products')
      .select('title, description, file_url, file_name')
      .eq('id', product_id)
      .single()

    if (!product) return res.status(404).json({ error: 'Product not found' })

    // Generate signed download URL (valid 7 days)
    let downloadUrl = ''
    if (product.file_url) {
      const { data: signedData } = await supabase.storage
        .from('products')
        .createSignedUrl(product.file_url, 7 * 24 * 3600)
      downloadUrl = signedData?.signedUrl || ''
    }

    // Send email via Resend
    if (RESEND_API_KEY && downloadUrl) {
      const emailHtml = `
        <div style="max-width:600px;margin:0 auto;font-family:Inter,sans-serif;background:#F9F9F9;padding:40px 20px;">
          <div style="background:#121212;padding:32px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;font-size:20px;font-weight:900;letter-spacing:2px;margin:0;">BY BISA</h1>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 12px 12px;">
            <p style="font-size:16px;color:#121212;">Hi ${buyer_name || 'there'},</p>
            <h2 style="font-size:22px;color:#121212;margin:16px 0 8px;">Your <span style="color:#C75B2B;">${product.title}</span> is ready!</h2>
            <p style="font-size:14px;color:#6B6B6B;line-height:1.6;">
              Thank you for your purchase. You just took a powerful step toward building your fashion empire!
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${downloadUrl}" style="display:inline-block;background:#121212;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                Download Your Product
              </a>
            </div>
            <p style="font-size:12px;color:#9B9B9B;text-align:center;">
              This download link is valid for 7 days. You can also access your purchase anytime at
              <a href="https://bybisa.com/my-purchases" style="color:#C75B2B;">bybisa.com/my-purchases</a>
            </p>
            <hr style="border:none;border-top:1px solid #E8E8E8;margin:24px 0;" />
            <p style="font-size:13px;color:#6B6B6B;line-height:1.6;">
              Remember: every tool you invest in is a shortcut past someone else's expensive mistake. You're building with intention.
            </p>
            <p style="font-size:13px;color:#6B6B6B;">
              With love,<br /><strong style="color:#121212;">Esther â ByBisa</strong>
            </p>
          </div>
          <p style="text-align:center;font-size:11px;color:#9B9B9B;margin-top:16px;">
            &copy; Bisa Group LLC &middot; <a href="https://bybisa.com" style="color:#9B9B9B;">bybisa.com</a>
          </p>
        </div>
      `

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ByBisa <bybisa@bisagroup.org>',
          to: buyer_email,
          subject: `Your ${product.title} is ready to download!`,
          html: emailHtml,
        }),
      })
    }

    return res.status(200).json({ success: true, download_url: downloadUrl })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
