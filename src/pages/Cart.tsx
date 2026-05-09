import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeItem, subtotal, discount, total, currency, coupon, setCoupon, clearCart } = useCart()
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-secondary mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our collection of digital products</p>
        <Link to="/shop"><Button>Start Shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-secondary mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="bg-white rounded-xl border border-warm-border p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {item.product.preview_image_url ? (
                  <img src={item.product.preview_image_url} alt={item.product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                    ð
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`} className="font-semibold text-secondary hover:text-primary transition-colors line-clamp-2">
                  {item.product.title}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">{item.product.file_type?.toUpperCase()} â¢ Digital Download</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-secondary">
                    {formatPrice(item.product.price, item.product.currency)}
                  </span>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-warm-border p-6 h-fit sticky top-24">
          <h3 className="font-heading text-lg font-semibold text-secondary mb-4">Order Summary</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
              <span className="font-medium">{formatPrice(subtotal, currency)}</span>
            </div>
            
            {coupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({coupon.code})</span>
                <span>-{formatPrice(discount, currency)}</span>
              </div>
            )}
            
            <div className="border-t border-warm-border pt-3 flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
          </div>

          {/* Coupon */}
          {!coupon && (
            <div className="mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="text-sm"
                />
                <Button size="sm" variant="outline" onClick={applyCoupon} loading={couponLoading}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            </div>
          )}

          <Button className="w-full mt-6" size="lg" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
