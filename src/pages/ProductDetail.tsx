import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Download, FileText, Star, ArrowLeft, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product, Review } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, getCategoryLabel } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ProductGrid from '@/components/products/ProductGrid'
import Loading from '@/components/ui/Loading'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem, items } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const isInCart = product ? items.some(item => item.product.id === product.id) : false

  useEffect(() => {
    if (slug) loadProduct(slug)
  }, [slug])

  async function loadProduct(productSlug: string) {
    setLoading(true)
    const { data: prod } = await supabase
      .from('bybisa_products')
      .select('*')
      .eq('slug', productSlug)
      .eq('is_active', true)
      .single()

    if (!prod) { setLoading(false); return }
    setProduct(prod)

    await supabase.from('bybisa_analytics').insert({ event_type: 'view', product_id: prod.id })

    const { data: revs } = await supabase
      .from('bybisa_reviews')
      .select('*, customer:bybisa_customers(name)')
      .eq('product_id', prod.id)
      .order('created_at', { ascending: false })
    setReviews(revs || [])

    const { data: rel } = await supabase
      .from('bybisa_products')
      .select('*')
      .eq('is_active', true)
      .eq('category', prod.category)
      .neq('id', prod.id)
      .limit(3)
    setRelated(rel || [])

    setLoading(false)
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return <Loading />

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Link to="/shop" className="text-brand underline">Back to Shop</Link>
      </div>
    )
  }

  const fileSize = product.file_size_bytes
    ? product.file_size_bytes > 1048576
      ? `${(product.file_size_bytes / 1048576).toFixed(1)} MB`
      : `${Math.round(product.file_size_bytes / 1024)} KB`
    : null

  const hasUgxPrice = product.price_ugx !== null && product.price_ugx !== undefined
  const showDualPrice = product.currency === 'USD' && hasUgxPrice

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-brand mb-8">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-surface-alt aspect-square">
            {product.preview_image_url ? (
              <img src={product.preview_image_url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {product.category === 'template' ? 'Ã°ÂÂÂ' : product.category === 'guide' ? 'Ã°ÂÂÂ' : product.category === 'formula' ? 'Ã°ÂÂÂ' : product.category === 'course' ? 'Ã°ÂÂÂ' : 'Ã°ÂÂÂ¦'}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {getCategoryLabel(product.category)}
            </p>
            <h1 className="text-3xl font-bold text-text mb-3">{product.title}</h1>

            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-text-muted">{avgRating} ({reviews.length})</span>
              </div>
            )}

            {/* Dual Price Display */}
            <div className="mb-6">
              {showDualPrice ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-brand">
                      {formatPrice(product.price, 'USD')}
                    </span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-lg text-text-muted line-through">
                        {formatPrice(product.compare_at_price, 'USD')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted font-medium">
                    Also available at <span className="text-text font-semibold">{formatPrice(product.price_ugx!, 'UGX')}</span>
                    &nbsp;-- select your preferred currency at checkout
                  </p>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-brand">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="text-lg text-text-muted line-through">
                      {formatPrice(product.compare_at_price, product.currency)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* File info */}
            <div className="flex flex-wrap gap-3 mb-6 text-xs text-text-muted">
              {product.file_type && (
                <span className="bg-surface-alt px-3 py-1.5 rounded-full font-medium">{product.file_type.toUpperCase()}</span>
              )}
              {fileSize && (
                <span className="bg-surface-alt px-3 py-1.5 rounded-full font-medium">{fileSize}</span>
              )}
              <span className="bg-surface-alt px-3 py-1.5 rounded-full font-medium">Instant Download</span>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag: string) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { if (isInCart) navigate('/cart'); else addItem(product) }}
              >
                <ShoppingCart className="w-4 h-4" />
                {isInCart ? 'View Cart' : 'Add to Cart'}
              </Button>
              <Button
                variant="primary"
                onClick={() => { if (!isInCart) addItem(product); navigate('/checkout') }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-text mb-6">Reviews</h2>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    {review.is_verified_purchase && <Badge variant="success">Verified</Badge>}
                  </div>
                  {review.review_text &&
                    <p className="text-sm text-text-muted mb-2">{review.review_text}</p>
                  }
                  <p className="text-xs text-text-muted">
                    {(review as any).customer?.name || 'Customer'} ÃÂ· {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-text mb-6">You May Also Like</h2>
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </div>
  )
}
