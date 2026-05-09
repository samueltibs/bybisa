import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'dark'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-border-light text-text-muted',
    accent: 'bg-accent text-white',
    success: 'bg-success/10 text-success',
    dark: 'bg-brand text-white',
  }
  
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
