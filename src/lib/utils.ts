import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Product } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency: string = 'UGX'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get the price for a product in the selected display currency.
 * Falls back to native price if no UGX conversion is available.
 */
export function getProductPrice(product: Product, currency: 'USD' | 'UGX'): number {
  if (currency === 'UGX') {
    // If product is already in UGX, use its price directly
    if (product.currency === 'UGX') return product.price
    // Otherwise use the pre-computed UGX price
    return product.price_ugx ?? product.price * 3750
  } else {
    // If product is already in USD, use its price directly
    if (product.currency === 'USD') return product.price
    // UGX product priced in USD: convert back (approximate)
    return Math.ceil((product.price / 3750) * 100) / 100
  }
}

/**
 * Format dual-currency price string, e.g. "$49.99 / UGX 187,500"
 */
export function formatDualPrice(product: Product): string {
  if (product.currency === 'USD') {
    const ugx = product.price_ugx ?? Math.round(product.price * 3750 / 500) * 500
    return `${formatPrice(product.price, 'USD')} / ${formatPrice(ugx, 'UGX')}`
  }
  // UGX-native product â just show UGX
  return formatPrice(product.price, 'UGX')
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    template: 'Template',
    guide: 'Guide',
    formula: 'Formula',
    course: 'Course',
    bundle: 'Bundle',
  }
  return labels[category] || category
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    template: 'ð',
    guide: 'ð',
    formula: 'ð',
    course: 'ð',
    bundle: 'ð¦',
  }
  return icons[category] || 'ð'
}
