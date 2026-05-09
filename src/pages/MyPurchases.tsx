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

  const statusColors: Record<string, 'default' | 'accent' | 'success' | 'dark'> = {
    paid: 'success',
    pending: 'accent',
    failed: 'default',
    refunded: 'dark',
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand mb-2">My Purchases</h1>
          <p className="text-text-muted">Enter your email to access your digital downloads</p>
        </div>

        {/* Email lookup */}
        <div className="bg-white border border-border-light rounded-2xl p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
              />
            </div>
            <Button onClick={handleLookup} loading={loading}>
              Look Up
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {/* Purchases list */}
        {searched && purchases.length > 0 && (
          <div>
            <p className="text-sm text-text-muted mb-4">
              <Package className="inline w-4 h-4 mr-1" />
              {purchases.length} purchase{purchases.length !== 1 ? 's' : ''} found
            </p>
            <div className="space-y-4">
              {purchases.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white border border-border-light rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand">{p.product?.title}</h3>
                      <p className="text-sm text-text-muted mt-1">
                        {p.order_number} Â· {new Date(p.purchased_at).toLocaleDateString()} Â· {formatPrice(p.amount, p.currency)}
                      </p>
                    </div>
                    <Badge variant={statusColors[p.status] || 'default'}>
                      {p.status}
                    </Badge>
                  </div>
                  {p.status === 'paid' && p.download_token && (
                    <div className="mt-4 pt-4 border-t border-border-light">
                      <Link
                        to={`/download/${p.download_token}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download ({p.download_count || 0}/5 used)
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searched && purchases.length === 0 && !error && (
          <div className="text-center py-12 text-text-muted">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No purchases found for this email</p>
          </div>
        )}
      </div>
    </div>
  )
}
