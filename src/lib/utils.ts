import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
