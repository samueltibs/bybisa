import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, getCategoryLabel } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const { addItem, items } = useCart()
  const isInCart = items.some(item => item.product.id === product.id)

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/products/${product.slug}`)}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-border-light mb-4">
        {product.preview_image_url ? (
          <img
            src={product.preview_image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-border-light to-border flex items-center justify-center">
            <span className="text-5xl opacity-30">{product.category === 'template' ? 'ð' : product.category === 'guide' ? 'ð' : product.category === 'formula' ? 'ð' : product.category === 'course' ? 'ð' : 'ð¦'}</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.compare_at_price && product.compare_at_price > product.price && (
            <Badge variant="accent">Sale</Badge>
          )}
          {product.is_featured && (
            <Badge variant="accent">Get It Now</Badge>
          )}
        </div>

        {/* Quick add on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (isInCart) navigate('/cart')
              else addItem(product)
            }}
            className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-light transition-colors"
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Info â minimal, left-aligned like bybisa.com */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1">
          {getCategoryLabel(product.category)}
        </p>
        <h3 className="font-semibold text-brand text-sm leading-snug line-clamp-2 group-hover:underline">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-bold text-brand">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-text-light line-through">
              {formatPrice(product.compare_at_price, product.currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
