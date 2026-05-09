import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Product, CartItem, Coupon } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  coupon: Coupon | null
  setCoupon: (coupon: Coupon | null) => void
  subtotal: number
  discount: number
  total: number
  currency: string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bybisa-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [coupon, setCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    localStorage.setItem('bybisa-cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) return prev // Digital products: only 1 per cart
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId)
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setCoupon(null)
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const currency = items[0]?.product.currency || 'UGX'
  
  let discount = 0
  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      discount = subtotal * (coupon.discount_value / 100)
    } else {
      discount = Math.min(coupon.discount_value, subtotal)
    }
  }
  
  const total = Math.max(0, subtotal - discount)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      coupon, setCoupon, subtotal, discount, total, currency,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
