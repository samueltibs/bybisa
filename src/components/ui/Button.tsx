import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-brand text-white hover:bg-brand-light focus:ring-brand rounded-full',
      secondary: 'bg-surface text-brand border border-border hover:bg-border-light focus:ring-brand rounded-full',
      outline: 'border-2 border-brand text-brand hover:bg-brand hover:text-white focus:ring-brand rounded-full',
      ghost: 'text-brand hover:bg-border-light focus:ring-brand rounded-lg',
      accent: 'bg-accent text-white hover:bg-accent-light focus:ring-accent rounded-full',
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-xs gap-1.5 tracking-wide uppercase',
      md: 'px-6 py-3 text-sm gap-2 tracking-wide uppercase',
      lg: 'px-8 py-4 text-sm gap-2.5 tracking-wide uppercase',
    }
    
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
