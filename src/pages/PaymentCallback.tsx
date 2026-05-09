import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Download, Clock, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAuthToken, getTransactionStatus } from '@/lib/pesapal'
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
        customer_email: customer.email,
        customer_name: customer.full_name || 'Entrepreneur',
        order_number: purchase.order_number,
        product_title: product?.title || 'Your Product',
        amount: String(purchase.amount),
        currency: purchase.currency || 'UGX',
        payment_method: purchase.payment_method || 'PesaPal',
        payment_reference: purchase.pesapal_tracking_id || '',
        download_url: downloadUrl,
        remaining_downloads: purchase.downloads_remaining ?? 5,
        purchase_date: purchaseDate,
      }),
    })

    // Send welcome email for first-time buyers
    if ((purchaseCount ?? 0) <= 1) {
      await fetch('/api/emails/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: customer.email,
          customer_name: customer.full_name || 'Entrepreneur',
          product_title: product?.title || 'Your Product',
          product_type: product?.category || 'template',
        }),
      })
    }
  } catch (err) {
    // Non-fatal: email errors should not break the payment flow
    console.error('Email trigger failed:', err)
  }
}

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading')
  const [purchases, setPurchases] = useState([])

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
        const token = await getAuthToken()
        const txStatus = await getTransactionStatus(token, trackingId)

        if (txStatus.payment_status_description === 'Completed') {
          if (ref) {
            await supabase
              .from('bybisa_purchases')
              .update({ status: 'paid', pesapal_tracking_id: trackingId, payment_method: txStatus.payment_method })
              .eq('order_number', ref)

            // Trigger receipt + welcome emails
            await triggerReceiptEmail(ref)
          }
          await loadPurchases(ref)
          setStatus('success')
          clearCart()
        } else if (txStatus.payment_status_description === 'Failed') {
          setStatus('failed')
        } else {
          await loadPurchases(ref)
          setStatus('pending')
          clearCart()
        }
      } catch (err) {
        console.error('Callback error:', err)
        await loadPurchases(ref)
        setStatus('pending')
        clearCart()
      }
    } else if (ref) {
      // No tracking ID Ã¢ÂÂ check DB status
      const { data } = await supabase
        .from('bybisa_purchases')
        .select('status')
        .eq('order_number', ref)
        .single()
      setStatus(data?.status === 'paid' ? 'success' : 'pending')
      await loadPurchases(ref)
      clearCart()
    }
  }

  async function loadPurchases(orderRef: string | null) {
    if (!orderRef) return
    const { data } = await supabase
      .from('bybisa_purchases')
      .select('*, bybisa_products(title, file_type)')
      .eq('order_number', orderRef)
    if (data) setPurchases(data as any)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Status Header */}
        <div className={`p-8 text-center ${
          status === 'success' ? 'bg-green-50' :
          status === 'failed' ? 'bg-red-50' :
          'bg-amber-50'
        }`}>
          {status === 'success' && <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />}
          {status === 'failed' && <XCircle className="mx-auto w-16 h-16 text-red-500 mb-4" />}
          {status === 'pending' && <Clock className="mx-auto w-16 h-16 text-amber-500 mb-4" />}

          <h1 className="text-2xl font-bold text-[#121212] mb-2">
            {status === 'success' && 'Payment Confirmed! Ã°ÂÂÂ'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'pending' && 'Payment Pending'}
          </h1>
          <p className="text-gray-600">
            {status === 'success' && 'Your purchase is confirmed. A receipt has been sent to your email.'}
            {status === 'failed' && 'Your payment was not successful. Please try again.'}
            {status === 'pending' && 'Your payment is being processed. We will email you once confirmed.'}
          </p>
        </div>

        {/* Purchases */}
        {purchases.length > 0 && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-[#121212] mb-4">Your Purchase{purchases.length > 1 ? 's' : ''}</h2>
            <div className="space-y-3">
              {(purchases as any[]).map((purchase: any) => (
                <div key={purchase.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-[#121212] text-sm">{purchase.bybisa_products?.title}</p>
                    <p className="text-xs text-gray-500">{purchase.order_number}</p>
                  </div>
                  {status === 'success' && purchase.download_token && (
                    <Link
                      to={`/download?token=${purchase.download_token}`}
                      className="flex items-center gap-1.5 bg-[#C75B2B] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#b34d21] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 flex flex-col gap-3">
          {status === 'success' && (
            <Link to="/my-purchases" className="flex items-center justify-center gap-2 w-full bg-[#121212] text-white font-semibold py-3 rounded-full hover:bg-gray-800 transition-colors">
              View All My Purchases <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {status === 'failed' && (
            <Button onClick={() => window.history.back()} variant="primary">
              Try Again
            </Button>
          )}
          <Link to="/shop" className="text-center text-sm text-gray-600 hover:text-[#C75B2B] transition-colors py-2">
            Continue Shopping Ã¢ÂÂ
          </Link>
        </div>
      </div>
    </div>
  )
}
