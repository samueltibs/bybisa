import { cn, getCategoryLabel } from '@/lib/utils'

const CATEGORIES = ['all', 'template', 'guide', 'formula', 'course', 'bundle'] as const

interface CategoryFilterProps {
  selected: string
  onChange: (category: string) => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-all',
            selected === cat
              ? 'bg-brand text-white'
              : 'bg-surface text-text-muted border border-border hover:border-brand hover:text-brand'
          )}
        >
          {cat === 'all' ? 'All' : getCategoryLabel(cat)}
        </button>
      ))}
    </div>
  )
}
