import { useEffect, useState } from 'react'
import { Search, Download, ChevronLeft, Edit, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', whatsapp_number: '', notes: '' })

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    const { data } = await supabase.from('bybisa_customers').select('*').order('created_at', { ascending: false })
    setCustomers(data || [])
  }

  async function viewCustomer(c: any) {
    setSelected(c)
    setEditForm({ full_name: c.full_name || '', phone: c.phone || '', whatsapp_number: c.whatsapp_number || '', notes: c.notes || '' })
    const { data } = await supabase.from('bybisa_purchases')
      .select('*, product:bybisa_products(title)').eq('customer_id', c.id).order('purchased_at', { ascending: false })
    setPurchases(data || [])
  }

  async function saveEdit() {
    await supabase.from('bybisa_customers').update(editForm).eq('id', selected.id)
    setEditing(false)
    setSelected({ ...selected, ...editForm })
    loadCustomers()
  }

  function exportCSV() {
    const header = 'Email,Name,Phone,WhatsApp,Total Purchases,Total Spent,First Purchase,Last Purchase\n'
    const rows = customers.map(c =>
      `"${c.email}","${c.full_name || ''}","${c.phone || ''}","${c.whatsapp_number || ''}",${c.total_purchases},${c.total_spent},"${c.first_purchase_at || ''}","${c.last_purchase_at || ''}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bybisa-customers.csv'; a.click()
  }

  const filtered = search
    ? customers.filter(c => c.email?.toLowerCase().includes(search.toLowerCase()) || c.full_name?.toLowerCase().includes(search.toLowerCase()))
    : customers

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-brand mb-6">
          <ChevronLeft className="w-3 h-3" /> Back to Customers
        </button>
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-brand">{selected.full_name || 'Unnamed'}</h2>
              <p className="text-sm text-text-muted">{selected.email}</p>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 bg-bg border border-border rounded-full text-xs font-semibold text-text-muted hover:text-brand">
                <Edit className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded-full text-xs font-semibold"><Save className="w-3 h-3" /> Save</button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 bg-bg border border-border rounded-full text-xs font-semibold text-text-muted"><X className="w-3 h-3" /> Cancel</button>
              </div>
            )}
          </div>
          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1">Name</label><input className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" value={editForm.full_name} onChange={e => setEditForm(f => ({...f, full_name: e.target.value}))} /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1">Phone</label><input className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" value={editForm.phone} onChange={e => setEditForm(f => ({...f, phone: e.target.value}))} /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1">WhatsApp</label><input className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" value={editForm.whatsapp_number} onChange={e => setEditForm(f => ({...f, whatsapp_number: e.target.value}))} /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1">Notes</label><input className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm" value={editForm.notes} onChange={e => setEditForm(f => ({...f, notes: e.target.value}))} /></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted block">Phone</span>{selected.phone || 'â'}</div>
              <div><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted block">WhatsApp</span>{selected.whatsapp_number || 'â'}</div>
              <div><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted block">Total Spent</span>{formatPrice(selected.total_spent || 0, 'UGX')}</div>
              <div><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted block">Purchases</span>{selected.total_purchases || 0}</div>
            </div>
          )}
          {selected.notes && !editing && <p className="text-sm text-text-muted mt-4 italic">{selected.notes}</p>}
        </div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">Purchase History</h3>
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Order</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Product</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Amount</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Status</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-border-light">
              {purchases.map(p => (
                <tr key={p.id}><td className="px-4 py-3 font-medium">{p.order_number}</td><td className="px-4 py-3 text-text-muted">{p.product?.title}</td><td className="px-4 py-3 font-semibold">{formatPrice(p.amount, p.currency)}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.status==='paid'?'bg-green-50 text-green-700':'bg-amber-50 text-amber-700'}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-text-muted text-xs">{new Date(p.purchased_at).toLocaleDateString()}</td></tr>
              ))}
              {purchases.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-text-light">No purchases</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand">Customers</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border rounded-full text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-brand">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-surface text-sm placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-brand/20" />
      </div>
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Customer</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Phone</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Purchases</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total Spent</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Joined</th>
          </tr></thead>
          <tbody className="divide-y divide-border-light">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-bg transition-colors cursor-pointer" onClick={() => viewCustomer(c)}>
                <td className="px-4 py-3"><div className="font-medium text-brand">{c.full_name || 'Unnamed'}</div><div className="text-xs text-text-light">{c.email}</div></td>
                <td className="px-4 py-3 text-text-muted">{c.phone || 'â'}</td>
                <td className="px-4 py-3 text-text-muted">{c.total_purchases || 0}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(c.total_spent || 0, 'UGX')}</td>
                <td className="px-4 py-3 text-text-muted text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
