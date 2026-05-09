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

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return <Loading />

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-extrabold text-brand mb-4">Product not found</h2>
        <Link to="/shop"><Button>Back to Shop</Button></Link>
      </div>
    )
  }

  const fileSize = product.file_size_bytes
    ? product.file_size_bytes > 1048576
      ? `${(product.file_size_bytes / 1048576).toFixed(1)} MB`
      : `${Math.round(product.file_size_bytes / 1024)} KB`
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-brand mb-8">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square rounded-lg overflow-hidden bg-border-light">
          {product.preview_image_url ? (
            <img src={product.preview_image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-border-light to-border flex items-center justify-center">
              <FileText className="w-16 h-16 text-text-light" strokeWidth={1} />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
            {getCategoryLabel(product.category)}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand leading-tight">{product.title}</h1>
          
          {avgRating && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'text-amber-500 fill-amber-500' : 'text-border'}`} />
                ))}
              </div>
              <span className="text-xs text-text-muted">{avgRating} ({reviews.length})</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-2xl font-extrabold text-brand">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-text-light line-through">
                {formatPrice(product.compare_at_price, product.currency)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-text-muted leading-relaxed whitespace-pre-line text-sm">{product.description}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {product.file_type && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg rounded-full text-xs font-medium text-text-muted">
                <FileText className="w-3.5 h-3.5" /> {product.file_type.toUpperCase()}
              </span>
            )}
            {fileSize && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg rounded-full text-xs font-medium text-text-muted">
                <Download className="w-3.5 h-3.5" /> {fileSize}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 rounded-full text-xs font-medium text-success">
              <Check className="w-3.5 h-3.5" /> Instant Download
            </span>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => { if (isInCart) navigate('/cart'); else addItem(product) }}
            >
              <ShoppingCart className="w-4 h-4" />
              {isInCart ? 'View Cart' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              variant="accent"
              className="flex-1"
              onClick={() => { if (!isInCart) addItem(product); navigate('/checkout') }}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-6">Reviews</h2>
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-surface border border-border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-border'}`} />
                    ))}
                  </div>
                  {review.is_verified_purchase && <Badge variant="success">Verified</Badge>}
                </div>
                {review.review_text && <p className="text-sm text-text-muted">{review.review_text}</p>}
                <p className="text-xs text-text-light mt-2">
                  {(review as any).customer?.name || 'Customer'} &middot; {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-8">You Might Also Like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
