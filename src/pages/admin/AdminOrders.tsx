import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadOrders() }, [filter])

  async function loadOrders() {
    let query = supabase
      .from('bybisa_purchases')
      .select('*, customer:bybisa_customers(name, email, phone), product:bybisa_products(title)')
      .order('purchased_at', { ascending: false })
    
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setOrders(data || [])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand">Orders</h1>
        <div className="flex gap-2">
          {['all', 'paid', 'pending', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filter === f ? 'bg-brand text-white' : 'bg-surface border border-border text-text-muted hover:text-brand'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Order</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Customer</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Product</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Amount</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Status</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-bg transition-colors">
                <td className="px-4 py-3 font-medium text-brand">{o.order_number}</td>
                <td className="px-4 py-3">
                  <div className="text-brand text-xs font-medium">{o.customer?.name}</div>
                  <div className="text-text-light text-xs">{o.customer?.email}</div>
                </td>
                <td className="px-4 py-3 text-text-muted">{o.product?.title}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(o.amount, o.currency)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    o.status === 'paid' ? 'bg-success/10 text-success' :
                    o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'
                  }`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs">{new Date(o.purchased_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
