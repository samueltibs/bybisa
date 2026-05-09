import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Download, Clock, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAuthToken, getTransactionStatus } from '@/lib/pesapal'
import { useCart } from '@/contexts/CartContext'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'

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
      // Order created but PesaPal redirect failed
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
          // Update purchase to paid
          if (ref) {
            await supabase
              .from('bybisa_purchases')
              .update({ status: 'paid', pesapal_tracking_id: trackingId, payment_method: txStatus.payment_method })
              .eq('order_number', ref)
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
      } catch {
        await loadPurchases(ref)
        setStatus('pending')
        clearCart()
      }
    } else if (ref) {
      await loadPurchases(ref)
      // Check if already paid
      const { data } = await supabase
        .from('bybisa_purchases')
        .select('status')
        .eq('order_number', ref)
        .single()
      setStatus(data?.status === 'paid' ? 'success' : 'pending')
      clearCart()
    } else {
      setStatus('failed')
    }
  }

  async function loadPurchases(orderRef: string | null) {
    if (!orderRef) return
    const { data } = await supabase
      .from('bybisa_purchases')
      .select('*, product:bybisa_products(title, slug, file_type)')
      .eq('order_number', orderRef)
    setPurchases(data || [])
  }

  if (status === 'loading') return <Loading />

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-secondary mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-8">Your purchase is ready for download.</p>
          
          <div className="bg-white rounded-xl border border-warm-border p-6 text-left space-y-4 mb-8">
            <h3 className="font-heading font-semibold text-secondary">Your Downloads</h3>
            {purchases.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-warm-surface rounded-lg">
                <div>
                  <p className="font-medium text-secondary">{p.product?.title}</p>
                  <p className="text-xs text-gray-500">Order: {p.order_number} &middot; {p.product?.file_type?.toUpperCase()}</p>
                </div>
                <Link to={`/download/${p.download_token}`}>
                  <Button size="sm">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            A download link has also been sent to your email. You can download up to 5 times.
          </p>
        </>
      )}

      {status === 'pending' && (
        <>
          <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-secondary mb-2">Payment Processing</h1>
          <p className="text-gray-500 mb-8">
            Your payment is being processed. You will receive an email with your download link once confirmed.
          </p>
          {purchases.length > 0 && (
            <p className="text-sm text-gray-500 mb-4">Order Reference: {purchases[0]?.order_number}</p>
          )}
        </>
      )}

      {status === 'failed' && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-secondary mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-8">Something went wrong with your payment. Please try again.</p>
          <Link to="/cart"><Button>Try Again</Button></Link>
        </>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <Link to="/shop"><Button variant="outline">Continue Shopping <ArrowRight className="w-4 h-4" /></Button></Link>
        <Link to="/my-purchases"><Button variant="ghost">My Purchases</Button></Link>
      </div>
    </div>
  )
}
