import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search products...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" strokeWidth={1.5} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-full border border-border bg-surface text-text text-sm placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-brand"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
