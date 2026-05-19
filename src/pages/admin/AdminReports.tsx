import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

export default function AdminReports() {
  const [revenue, setRevenue] = useState(0)
  const [byProduct, setByProduct] = useState<any[]>([])
  const [byMonth, setByMonth] = useState<any[]>([])
  const [topCustomers, setTopCustomers] = useState<any[]>([])
  const [expenses, setExpenses] = useState(0)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: purchases } = await supabase.from('bybisa_purchases').select('amount, currency, purchased_at, product:bybisa_products(title), customer:bybisa_customers(full_name, email)').eq('status', 'paid')
    const purch = purchases || []
    setRevenue(purch.reduce((s, p) => s + Number(p.amount), 0))

    // By product
    const prodMap: Record<string, number> = {}
    purch.forEach(p => { const t = (p.product as any)?.title || 'Unknown'; prodMap[t] = (prodMap[t] || 0) + Number(p.amount) })
    setByProduct(Object.entries(prodMap).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total))

    // By month
    const monthMap: Record<string, number> = {}
    purch.forEach(p => { const m = p.purchased_at?.substring(0, 7) || ''; monthMap[m] = (monthMap[m] || 0) + Number(p.amount) })
    setByMonth(Object.entries(monthMap).map(([month, total]) => ({ month, total })).sort((a, b) => a.month.localeCompare(b.month)))

    // Top customers
    const custMap: Record<string, { name: string; email: string; total: number }> = {}
    purch.forEach(p => {
      const c = p.customer as any
      const key = c?.email || 'unknown'
      if (!custMap[key]) custMap[key] = { name: c?.full_name || '', email: key, total: 0 }
      custMap[key].total += Number(p.amount)
    })
    setTopCustomers(Object.values(custMap).sort((a, b) => b.total - a.total).slice(0, 10))

    const { data: exp } = await supabase.from('bybisa_expenses').select('amount')
    setExpenses((exp || []).reduce((s, e) => s + Number(e.amount), 0))
  }

  const maxProduct = Math.max(...byProduct.map(p => p.total), 1)
  const maxMonth = Math.max(...byMonth.map(m => m.total), 1)

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand mb-6">Reports</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total Revenue</span>
          <p className="text-xl font-extrabold text-brand mt-1">{formatPrice(revenue, 'UGX')}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total Expenses</span>
          <p className="text-xl font-extrabold text-brand mt-1">{formatPrice(expenses, 'UGX')}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Net Profit</span>
          <p className={`text-xl font-extrabold mt-1 ${revenue - expenses >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatPrice(revenue - expenses, 'UGX')}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Profit Margin</span>
          <p className="text-xl font-extrabold text-brand mt-1">{revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : 0}%</p>
        </div>
      </div>

      {/* Revenue by Product */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">Revenue by Product</h3>
        {byProduct.length === 0 ? <p className="text-text-light text-sm">No data yet</p> : (
          <div className="space-y-3">
            {byProduct.map(p => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1"><span className="text-brand font-medium truncate mr-4">{p.name}</span><span className="font-semibold whitespace-nowrap">{formatPrice(p.total, 'UGX')}</span></div>
                <div className="h-2 bg-bg rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(p.total / maxProduct) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue by Month */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">Revenue by Month</h3>
        {byMonth.length === 0 ? <p className="text-text-light text-sm">No data yet</p> : (
          <div className="flex items-end gap-2 h-40">
            {byMonth.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-brand">{formatPrice(m.total, 'UGX')}</span>
                <div className="w-full bg-accent rounded-t" style={{ height: `${(m.total / maxMonth) * 120}px` }} />
                <span className="text-[9px] text-text-muted">{m.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Customers */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">Top Customers</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">#</th>
            <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Customer</th>
            <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total Spent</th>
          </tr></thead>
          <tbody className="divide-y divide-border-light">
            {topCustomers.map((c, i) => (
              <tr key={c.email}><td className="py-2 text-text-muted">{i + 1}</td><td className="py-2"><div className="font-medium text-brand">{c.name || 'Unnamed'}</div><div className="text-xs text-text-light">{c.email}</div></td><td className="py-2 font-semibold">{formatPrice(c.total, 'UGX')}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
