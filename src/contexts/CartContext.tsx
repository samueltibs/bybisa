import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Product, CartItem, Coupon } from '@/types'
import { getProductPrice } from '@/lib/utils'

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
  selectedCurrency: 'USD' | 'UGX'
  setSelectedCurrency: (c: 'USD' | 'UGX') => void
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
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'UGX'>('UGX')

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

  // Compute subtotal in selectedCurrency
  const subtotal = items.reduce(
    (sum, item) => sum + getProductPrice(item.product, selectedCurrency) * item.quantity,
    0
  )

  // The "native" currency for backwards compatibility (first item's currency, or selectedCurrency)
  const currency = selectedCurrency

  let discount = 0
  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      discount = subtotal * (coupon.discount_value / 100)
    } else {
      discount = coupon.discount_value
    }
  }

  const total = Math.max(0, subtotal - discount)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        coupon,
        setCoupon,
        subtotal,
        discount,
        total,
        currency,
        selectedCurrency,
        setSelectedCurrency,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
