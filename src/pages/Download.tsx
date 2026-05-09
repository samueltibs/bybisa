import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Download as DownloadIcon, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'

interface PurchaseWithProduct {
  id: string
  order_number: string
  download_token: string
  download_count: number
  max_downloads: number
  status: string
  product: {
    id: string
    title: string
    slug: string
    file_url: string
    file_type: string
    file_size_bytes: number
    preview_image_url: string | null
  }
}

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>()
  const [purchase, setPurchase] = useState<PurchaseWithProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) loadPurchase(token)
  }, [token])

  async function loadPurchase(token: string) {
    const { data, error: err } = await supabase
      .from('bybisa_purchases')
      .select('*, product:bybisa_products(id, title, slug, file_url, file_type, file_size_bytes, preview_image_url)')
      .eq('download_token', token)
      .single()

    if (err || !data) {
      setError('Invalid or expired download link')
      setLoading(false)
      return
    }

    if (data.status !== 'paid') {
      setError('Payment has not been confirmed yet. Please wait or contact support.')
      setLoading(false)
      return
    }

    setPurchase(data)
    setLoading(false)
  }

  async function handleDownload() {
    if (!purchase) return
    
    if (purchase.download_count >= purchase.max_downloads) {
      setError(`Maximum downloads reached (${purchase.max_downloads}). Please contact support.`)
      return
    }

    setDownloading(true)

    try {
      // Increment download count
      await supabase
        .from('bybisa_purchases')
        .update({ download_count: purchase.download_count + 1 })
        .eq('id', purchase.id)

      // Log the download
      await supabase.from('bybisa_downloads').insert({
        purchase_id: purchase.id,
        user_agent: navigator.userAgent,
      })

      // Track analytics
      await supabase.from('bybisa_analytics').insert({
        event_type: 'download',
        product_id: purchase.product.id,
      })

      // Get signed URL from storage
      if (purchase.product.file_url) {
        // If file_url is a storage path, get signed URL
        const storagePath = purchase.product.file_url.replace('bybisa-files/', '')
        const { data: signedData, error: signErr } = await supabase.storage
          .from('bybisa-files')
          .createSignedUrl(storagePath, 300) // 5 min expiry

        if (signErr || !signedData) {
          // Fallback: try direct URL
          window.open(purchase.product.file_url, '_blank')
        } else {
          window.open(signedData.signedUrl, '_blank')
        }
      }

      // Update local state
      setPurchase(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null)
    } catch (err) {
      setError('Download failed. Please try again.')
    }

    setDownloading(false)
  }

  if (loading) return <Loading />

  if (error && !purchase) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-secondary mb-2">Download Unavailable</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/shop"><Button variant="outline">Browse Products</Button></Link>
      </div>
    )
  }

  if (!purchase) return null

  const remaining = purchase.max_downloads - purchase.download_count
  const fileSize = purchase.product.file_size_bytes
    ? purchase.product.file_size_bytes > 1048576
      ? `${(purchase.product.file_size_bytes / 1048576).toFixed(1)} MB`
      : `${Math.round(purchase.product.file_size_bytes / 1024)} KB`
    : null

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-warm-border p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-secondary mb-1">Your Download</h1>
        <p className="text-sm text-gray-500 mb-6">Order: {purchase.order_number}</p>

        {/* Product info */}
        <div className="bg-warm-surface rounded-xl p-4 mb-6">
          {purchase.product.preview_image_url && (
            <img
              src={purchase.product.preview_image_url}
              alt={purchase.product.title}
              className="w-20 h-20 rounded-lg object-cover mx-auto mb-3"
            />
          )}
          <h3 className="font-heading font-semibold text-secondary">{purchase.product.title}</h3>
          <div className="flex items-center justify-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {purchase.product.file_type?.toUpperCase()}
            </span>
            {fileSize && <span>{fileSize}</span>}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={handleDownload}
          loading={downloading}
          disabled={remaining <= 0}
        >
          <DownloadIcon className="w-5 h-5" />
          {remaining > 0 ? 'Download Now' : 'No Downloads Remaining'}
        </Button>

        <p className="text-xs text-gray-400 mt-3">
          {remaining} of {purchase.max_downloads} downloads remaining
        </p>
      </div>
    </div>
  )
}
