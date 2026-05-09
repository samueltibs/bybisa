import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import ProductGrid from '@/components/products/ProductGrid'
import CategoryFilter from '@/components/products/CategoryFilter'
import SearchBar from '@/components/products/SearchBar'

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  
  const category = searchParams.get('category') || 'all'

  useEffect(() => {
    loadProducts()
  }, [category, sort])

  async function loadProducts() {
    setLoading(true)
    let query = supabase
      .from('bybisa_products')
      .select('*')
      .eq('is_active', true)

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    switch (sort) {
      case 'newest': query = query.order('created_at', { ascending: false }); break
      case 'price-asc': query = query.order('price', { ascending: true }); break
      case 'price-desc': query = query.order('price', { ascending: false }); break
      case 'popular': query = query.order('sort_order', { ascending: true }); break
    }

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = search
    ? products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.short_description?.toLowerCase().includes(search.toLowerCase())
      )
    : products

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand">Shop</h1>
        <p className="text-text-muted mt-2 text-sm">
          Digital tools and templates for your fashion business
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="px-4 py-3 rounded-full border border-border bg-surface text-xs font-semibold text-text uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      <div className="mb-8">
        <CategoryFilter
          selected={category}
          onChange={cat => {
            if (cat === 'all') searchParams.delete('category')
            else searchParams.set('category', cat)
            setSearchParams(searchParams)
          }}
        />
      </div>

      <p className="text-xs text-text-light uppercase tracking-wider mb-6">
        {filtered.length} product{filtered.length !== 1 ? 's' : ''}
      </p>

      <ProductGrid products={filtered} loading={loading} />
    </div>
  )
}
