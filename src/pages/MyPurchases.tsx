import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Download, Package, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'

export default function MyPurchases() {
  const [email, setEmail] = useState('')
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function handleLookup() {
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const { data: customer } = await supabase
      .from('bybisa_customers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!customer) {
      setError('No purchases found for this email')
      setPurchases([])
      setSearched(true)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('bybisa_purchases')
      .select('*, product:bybisa_products(title, slug, preview_image_url, file_type)')
      .eq('customer_id', customer.id)
      .order('purchased_at', { ascending: false })

    setPurchases(data || [])
    setSearched(true)
    setLoading(false)
  }

  const statusColors: Record<string, 'success' | 'warning' | 'default'> = {
    paid: 'success',
    pending: 'warning',
    failed: 'default',
    refunded: 'default',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-secondary mb-2">My Purchases</h1>
      <p className="text-gray-500 mb-8">Enter your email to access your digital downloads</p>

      {/* Email lookup */}
      <div className="bg-white rounded-xl border border-warm-border p-6 mb-8">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
            />
          </div>
          <Button onClick={handleLookup} loading={loading}>
            <Mail className="w-4 h-4" /> Look Up
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Purchases list */}
      {searched && purchases.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-semibold text-secondary">
            {purchases.length} purchase{purchases.length !== 1 ? 's' : ''} found
          </h3>
          {purchases.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-warm-border p-4 flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {p.product?.preview_image_url ? (
                  <img src={p.product.preview_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-secondary line-clamp-1">{p.product?.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.order_number} &middot; {new Date(p.purchased_at).toLocaleDateString()} &middot; {formatPrice(p.amount, p.currency)}
                    </p>
                  </div>
                  <Badge variant={statusColors[p.status] || 'default'}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </Badge>
                </div>
                {p.status === 'paid' && (
                  <div className="mt-2">
                    <Link to={`/download/${p.download_token}`}>
                      <Button size="sm">
                        <Download className="w-4 h-4" /> Download ({p.max_downloads - p.download_count} left)
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && purchases.length === 0 && !error && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No purchases found for this email.</p>
          <Link to="/shop"><Button variant="outline">Browse Products <ArrowRight className="w-4 h-4" /></Button></Link>
        </div>
      )}
    </div>
  )
}
