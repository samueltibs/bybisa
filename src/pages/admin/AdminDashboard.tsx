import { useEffect, useState } from 'react'
import { DollarSign, ShoppingBag, Users, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, downloads: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const [purchases, customers, downloads] = await Promise.all([
      supabase.from('bybisa_purchases').select('amount, status'),
      supabase.from('bybisa_customers').select('id', { count: 'exact', head: true }),
      supabase.from('bybisa_downloads').select('id', { count: 'exact', head: true }),
    ])

    const paidPurchases = (purchases.data || []).filter(p => p.status === 'paid')
    setStats({
      revenue: paidPurchases.reduce((sum, p) => sum + Number(p.amount), 0),
      orders: (purchases.data || []).length,
      customers: customers.count || 0,
      downloads: downloads.count || 0,
    })

    const { data: recent } = await supabase
      .from('bybisa_purchases')
      .select('*, customer:bybisa_customers(name, email), product:bybisa_products(title)')
      .order('purchased_at', { ascending: false })
      .limit(10)
    setRecentOrders(recent || [])
  }

  const cards = [
    { label: 'Revenue', value: formatPrice(stats.revenue, 'UGX'), icon: DollarSign },
    { label: 'Orders', value: stats.orders.toString(), icon: ShoppingBag },
    { label: 'Customers', value: stats.customers.toString(), icon: Users },
    { label: 'Downloads', value: stats.downloads.toString(), icon: Download },
  ]

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <card.icon className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{card.label}</span>
            </div>
            <p className="text-xl font-extrabold text-brand">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">Recent Orders</h2>
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Order</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Customer</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Product</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Amount</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {recentOrders.map(order => (
              <tr key={order.id} className="hover:bg-bg transition-colors">
                <td className="px-4 py-3 font-medium text-brand">{order.order_number}</td>
                <td className="px-4 py-3 text-text-muted">{order.customer?.name || order.customer?.email}</td>
                <td className="px-4 py-3 text-text-muted">{order.product?.title}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(order.amount, order.currency)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    order.status === 'paid' ? 'bg-success/10 text-success' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-text-light">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
