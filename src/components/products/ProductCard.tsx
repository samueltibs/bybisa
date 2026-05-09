import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, getProductPrice, getCategoryLabel } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const { addItem, items } = useCart()
  const isInCart = items.some(item => item.product.id === product.id)

  // Determine dual price display
  const hasUgxPrice = product.price_ugx !== null && product.price_ugx !== undefined
  const showDualPrice = product.currency === 'USD' && hasUgxPrice

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-md transition-all duration-200 cursor-pointer">
      <div onClick={() => navigate(`/products/${product.slug}`)}>
        {/* Image */}
        <div className="aspect-[4/3] bg-surface-alt overflow-hidden relative">
          {product.preview_image_url ? (
            <img
              src={product.preview_image_url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {product.category === 'template' ? 'Ã°ÂÂÂ' : product.category === 'guide' ? 'Ã°ÂÂÂ' : product.category === 'formula' ? 'Ã°ÂÂÂ' : product.category === 'course' ? 'Ã°ÂÂÂ' : 'Ã°ÂÂÂ¦'}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.compare_at_price && product.compare_at_price > product.price && (
              <Badge variant="accent">Sale</Badge>
            )}
            {product.is_featured && (
              <Badge variant="dark">Get It Now</Badge>
            )}
          </div>

          {/* Quick add on hover */}
          <button
            onClick={e => {
              e.stopPropagation()
              if (isInCart) navigate('/cart')
              else addItem(product)
            }}
            className="absolute bottom-3 right-3 w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-light transition-colors opacity-0 group-hover:opacity-100"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Info Ã¢ÂÂ minimal, left-aligned */}
        <div className="p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            {getCategoryLabel(product.category)}
          </p>
          <h3 className="font-semibold text-text text-sm leading-snug mb-2 line-clamp-2">
            {product.title}
          </h3>

          {/* Price display */}
          <div className="flex flex-col gap-0.5">
            {showDualPrice ? (
              <>
                <span className="text-base font-bold text-brand">
                  {formatPrice(product.price, 'USD')}
                </span>
                <span className="text-xs text-text-muted font-medium">
                  {formatPrice(product.price_ugx!, 'UGX')}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-brand">
                {formatPrice(product.price, product.currency)}
              </span>
            )}
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-text-muted line-through">
                {formatPrice(product.compare_at_price, product.currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
