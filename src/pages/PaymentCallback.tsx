import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Download, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'

// Trigger receipt (and optionally welcome) email after successful payment
async function triggerReceiptEmail(orderNumber: string) {
  try {
    // Fetch purchase + customer + product info from Supabase
    const { data: purchase } = await supabase
      .from('bybisa_purchases')
      .select(`
        *,
        bybisa_customers ( email, full_name ),
        bybisa_products ( title, category )
      `)
      .eq('order_number', orderNumber)
      .single()

    if (!purchase) return

    const customer = purchase.bybisa_customers as { email: string; full_name: string } | null
    const product = purchase.bybisa_products as { title: string; category: string } | null
    if (!customer?.email) return

    // Build download URL
    const downloadUrl = `${window.location.origin}/download?token=${purchase.download_token}`

    // Check if this is their first purchase (for welcome email)
    const { count: purchaseCount } = await supabase
      .from('bybisa_purchases')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', purchase.customer_id)
      .eq('status', 'paid')

    const purchaseDate = new Date().toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Send receipt
    await fetch('/api/emails/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customer.email,
        name: customer.full_name || 'Valued Customer',
        orderNumber: purchase.order_number,
        productTitle: product?.title || 'Your Purchase',
        productCategory: product?.category || '',
        amount: purchase.amount,
        currency: purchase.currency,
        downloadUrl,
        purchaseDate,
      }),
    })

    // Send welcome email if first purchase (purchaseCount <= 1)
    if ((purchaseCount ?? 0) <= 1) {
      await fetch('/api/emails/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.full_name || 'Valued Customer',
          customerEmail: customer.email,
        }),
      })
    }
  } catch (err) {
    console.error('Failed to trigger receipt email:', err)
  }
}

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading')
  const [purchases, setPurchases] = useState<any[]>([])

  const ref = searchParams.get('ref') || searchParams.get('pesapal_merchant_reference')
  const trackingId = searchParams.get('OrderTrackingId') || searchParams.get('pesapal_transaction_tracking_id')
  const isPending = searchParams.get('pending') === 'true'

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    if (isPending) {
      await loadPurchases(ref)
      setStatus('pending')
      clearCart()
      return
    }

    if (trackingId) {
      try {
        const apiRes = await fetch(`/api/pesapal/transaction-status?trackingId=${encodeURIComponent(trackingId)}`)
        if (!apiRes.ok) throw new Error(`Transaction status check failed: ${apiRes.status}`)
        const txStatus = await apiRes.json()

        if (txStatus.payment_status_description === 'Completed') {
          if (ref) {
            await supabase
              .from('bybisa_purchases')
              .update({ status: 'paid', pesapal_tracking_id: trackingId, payment_method: txStatus.payment_method })
              .eq('order_number', ref)
          }
          await loadPurchases(ref)
          setStatus('success')
          clearCart()
          if (ref) await triggerReceiptEmail(ref)
        } else if (txStatus.payment_status_description === 'Failed') {
          setStatus('failed')
        } else {
          await loadPurchases(ref)
          setStatus('pending')
          clearCart()
        }
      } catch (err) {
        console.error('Payment callback error:', err)
        if (ref) {
          const { data } = await supabase
            .from('bybisa_purchases')
            .select('status')
            .eq('order_number', ref)
            .single()
          setStatus(data?.status === 'paid' ? 'success' : 'pending')
        } else {
          setStatus('failed')
        }
      }
    } else {
      setStatus('failed')
    }
  }

  async function loadPurchases(orderRef: string | null) {
    if (!orderRef) return
    const { data } = await supabase
      .from('bybisa_purchases')
      .select('*, product:bybisa_products(title, slug, file_type, download_token)')
      .eq('order_number', orderRef)
    if (data) setPurchases(data as any)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-500">Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-16">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* Status icon */}
        <div className="mb-6">
          {status === 'success' && <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />}
          {status === 'failed' && <XCircle className="w-20 h-20 text-red-500 mx-auto" />}
          {status === 'pending' && <Clock className="w-20 h-20 text-yellow-500 mx-auto" />}
        </div>

        <h1 className="text-3xl font-bold text-[#121212] mb-2">
          {status === 'success' && 'Payment Successful!'}
          {status === 'failed' && 'Payment Failed'}
          {status === 'pending' && 'Payment Processing'}
        </h1>

        <p className="text-gray-500 mb-8">
          {status === 'success' && 'A receipt has been sent to your email.'}
          {status === 'failed' && 'Your payment was not successful. Please try again.'}
          {status === 'pending' && 'Your payment is being verified. You will receive an email once confirmed.'}
        </p>

        {/* Downloads for successful payments */}
        {status === 'success' && purchases.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm text-left">
            <h2 className="text-lg font-semibold text-[#121212] mb-4">Your Downloads</h2>
            {purchases.map(p => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-[#121212]">{p.product?.title}</p>
                  <p className="text-xs text-gray-400">Order: {p.order_number} Â· {p.product?.file_type?.toUpperCase()}</p>
                </div>
                <a
                  href={`/download?token=${p.download_token}`}
                  className="flex items-center gap-1 text-sm font-medium text-[#C75B2B] hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Pending order reference */}
        {status === 'pending' && purchases.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm">
            <p className="text-sm text-gray-500">Order Reference: <span className="font-mono font-medium text-[#121212]">{purchases[0]?.order_number}</span></p>
          </div>
        )}

        {/* Failed retry button */}
        {status === 'failed' && (
          <div className="mb-8">
            <Link to="/checkout">
              <Button variant="primary" size="lg">Try Again</Button>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#121212] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link to="/purchases" className="flex items-center gap-2 text-sm font-medium text-[#C75B2B] hover:underline">
            My Purchases
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
