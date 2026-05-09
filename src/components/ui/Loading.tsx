import { cn } from '@/lib/utils'

interface LoadingProps {
  fullScreen?: boolean
  className?: string
}

export default function Loading({ fullScreen, className }: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-border border-t-brand rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-border-light rounded', className)} />
  )
}
