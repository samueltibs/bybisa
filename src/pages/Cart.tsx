import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, getProductPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function Cart() {
  const navigate = useNavigate()
  const {
    items,
    removeItem,
    subtotal,
    discount,
    total,
    currency,
    selectedCurrency,
    setSelectedCurrency,
    coupon,
    setCoupon,
    clearCart,
  } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')

    const { data, error } = await supabase
      .from('bybisa_coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      setCouponError('Invalid coupon code')
      setCouponLoading(false)
      return
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('This coupon has expired')
      setCouponLoading(false)
      return
    }

    if (data.max_uses && data.uses_count >= data.max_uses) {
      setCouponError('This coupon has reached its usage limit')
      setCouponLoading(false)
      return
    }

    if (data.min_order && subtotal < data.min_order) {
      setCouponError(`Minimum order of ${formatPrice(data.min_order, currency)} required`)
      setCouponLoading(false)
      return
    }

    setCoupon(data)
    setCouponLoading(false)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="w-16 h-16 text-text-muted" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-text-muted">Browse our collection of digital products</p>
        <Button variant="primary" onClick={() => navigate('/shop')}>Start Shopping</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-8">Shopping Cart</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.product.id} className="bg-white rounded-xl p-4 border border-border flex gap-4">
                <div className="w-16 h-16 bg-surface-alt rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                  {item.product.preview_image_url
                    ? <img src={item.product.preview_image_url} alt={item.product.title} className="w-full h-full object-cover" />
                    : (item.product.category === 'template' ? 'ð' : item.product.category === 'guide' ? 'ð' : 'ð¦')
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text text-sm line-clamp-2">{item.product.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {item.product.file_type?.toUpperCase()} â¢ Digital Download
                  </p>

                  {/* Dual price per item */}
                  {item.product.currency === 'USD' && item.product.price_ugx ? (
                    <div className="mt-1">
                      <span className="text-sm font-bold text-brand">{formatPrice(item.product.price, 'USD')}</span>
                      <span className="text-xs text-text-muted ml-2">{formatPrice(item.product.price_ugx, 'UGX')}</span>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-brand mt-1">
                      {formatPrice(item.product.price, item.product.currency)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-border">
              <h3 className="font-bold text-text mb-4">Order Summary</h3>

              {/* Currency toggle */}
              <div className="mb-4">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Pay in</p>
                <div className="flex rounded-lg overflow-hidden border border-border">
                  <button
                    onClick={() => setSelectedCurrency('UGX')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${selectedCurrency === 'UGX' ? 'bg-brand text-white' : 'bg-white text-text-muted hover:bg-surface-alt'}`}
                  >
                    UGX
                  </button>
                  <button
                    onClick={() => setSelectedCurrency('USD')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${selectedCurrency === 'USD' ? 'bg-brand text-white' : 'bg-white text-text-muted hover:bg-surface-alt'}`}
                  >
                    USD
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span className="font-medium">{formatPrice(subtotal, selectedCurrency)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-muted">Discount ({coupon.code})</span>
                  <span className="text-green-600 font-medium">-{formatPrice(discount, selectedCurrency)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold border-t border-border pt-3 mt-3">
                <span>Total</span>
                <span>{formatPrice(total, selectedCurrency)}</span>
              </div>

              {/* Coupon */}
              {!coupon && (
                <div className="mt-4 space-y-2">
                  <Input
                    label="Coupon Code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={applyCoupon} loading={couponLoading} className="w-full">
                    <Tag className="w-3.5 h-3.5" />
                    Apply
                  </Button>
                  {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                </div>
              )}
            </div>

            <Button variant="primary" className="w-full" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
