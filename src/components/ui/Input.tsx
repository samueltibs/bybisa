import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-text uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-surface text-text placeholder:text-text-light text-sm',
            'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors',
            error ? 'border-red-400' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
