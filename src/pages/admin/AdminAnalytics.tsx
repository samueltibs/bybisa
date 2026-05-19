import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ views: 0, addToCart: 0, purchases: 0, downloads: 0 })
  const [topViewed, setTopViewed] = useState<any[]>([])
  const [topSold, setTopSold] = useState<any[]>([])
  const [topDownloaded, setTopDownloaded] = useState<any[]>([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: events } = await supabase.from('bybisa_analytics').select('event_type, product_id')
    const ev = events || []
    setStats({
      views: ev.filter(e => e.event_type === 'view').length,
      addToCart: ev.filter(e => e.event_type === 'add_to_cart').length,
      purchases: ev.filter(e => e.event_type === 'purchase').length,
      downloads: ev.filter(e => e.event_type === 'download').length,
    })

    // Top viewed products
    const viewCounts: Record<string, number> = {}
    ev.filter(e => e.event_type === 'view' && e.product_id).forEach(e => { viewCounts[e.product_id!] = (viewCounts[e.product_id!] || 0) + 1 })
    const viewIds = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

    // Top sold
    const soldCounts: Record<string, number> = {}
    ev.filter(e => e.event_type === 'purchase' && e.product_id).forEach(e => { soldCounts[e.product_id!] = (soldCounts[e.product_id!] || 0) + 1 })
    const soldIds = Object.entries(soldCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

    // Top downloaded
    const dlCounts: Record<string, number> = {}
    ev.filter(e => e.event_type === 'download' && e.product_id).forEach(e => { dlCounts[e.product_id!] = (dlCounts[e.product_id!] || 0) + 1 })
    const dlIds = Object.entries(dlCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

    // Fetch product names for all
    const allIds = [...new Set([...viewIds.map(v => v[0]), ...soldIds.map(s => s[0]), ...dlIds.map(d => d[0])])]
    const { data: products } = await supabase.from('bybisa_products').select('id, title').in('id', allIds)
    const prodMap: Record<string, string> = {}
    ;(products || []).forEach(p => { prodMap[p.id] = p.title })

    setTopViewed(viewIds.map(([id, count]) => ({ name: prodMap[id] || id.slice(0, 8), count })))
    setTopSold(soldIds.map(([id, count]) => ({ name: prodMap[id] || id.slice(0, 8), count })))
    setTopDownloaded(dlIds.map(([id, count]) => ({ name: prodMap[id] || id.slice(0, 8), count })))
  }

  const conversionRate = stats.views > 0 ? ((stats.purchases / stats.views) * 100).toFixed(1) : '0'
  const cartRate = stats.views > 0 ? ((stats.addToCart / stats.views) * 100).toFixed(1) : '0'

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Product Views', value: stats.views.toLocaleString() },
          { label: 'Add to Cart', value: stats.addToCart.toLocaleString() },
          { label: 'Purchases', value: stats.purchases.toLocaleString() },
          { label: 'Downloads', value: stats.downloads.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-border rounded-lg p-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{s.label}</span>
            <p className="text-xl font-extrabold text-brand mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Add-to-Cart Rate</span>
          <p className="text-2xl font-extrabold text-accent mt-1">{cartRate}%</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Conversion Rate</span>
          <p className="text-2xl font-extrabold text-accent mt-1">{conversionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: 'Most Viewed', data: topViewed },
          { title: 'Top Sellers', data: topSold },
          { title: 'Most Downloaded', data: topDownloaded },
        ].map(section => (
          <div key={section.title} className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">{section.title}</h3>
            {section.data.length === 0 ? <p className="text-text-light text-sm">No data yet</p> : (
              <div className="space-y-3">
                {section.data.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-brand truncate mr-2">{item.name}</span>
                    <span className="font-bold text-text-muted whitespace-nowrap">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
