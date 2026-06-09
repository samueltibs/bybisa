import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const UGX_PER_USD = 3737

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

export function convertToUGX(usdAmount: number): number {
  return Math.round(usdAmount * UGX_PER_USD)
}

export function convertToUSD(ugxAmount: number): number {
  return Math.round((ugxAmount / UGX_PER_USD) * 100) / 100
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
    template: 'file',
    guide: 'book',
    formula: 'calculator',
    course: 'graduation',
    bundle: 'package',
  }
  return icons[category] || 'file'
}


export function getProductPrice(product: { price: number; currency: string; price_ugx?: number | null }, selectedCurrency: 'USD' | 'UGX'): number {
  if (selectedCurrency === 'UGX') {
    if (product.currency === 'UGX') return product.price
    if (product.price_ugx) return product.price_ugx
    return convertToUGX(product.price)
  } else {
    if (product.currency === 'USD') return product.price
    return convertToUSD(product.price)
  }
}
