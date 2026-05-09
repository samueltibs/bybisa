import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order: '', max_uses: '', expires_at: '' })

  useEffect(() => { loadCoupons() }, [])

  async function loadCoupons() {
    const { data } = await supabase.from('bybisa_coupons').select('*').order('created_at', { ascending: false })
    setCoupons(data || [])
  }

  async function handleSave() {
    await supabase.from('bybisa_coupons').insert({
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      min_order: form.min_order ? parseFloat(form.min_order) : 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: true,
    })
    setShowForm(false)
    setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order: '', max_uses: '', expires_at: '' })
    loadCoupons()
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('bybisa_coupons').update({ is_active: !active }).eq('id', id)
    loadCoupons()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return
    await supabase.from('bybisa_coupons').delete().eq('id', id)
    loadCoupons()
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1.5"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Code</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Discount</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Uses</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Status</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border-light">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-bg transition-colors">
                <td className="px-4 py-3 font-bold text-brand tracking-wider">{c.code}</td>
                <td className="px-4 py-3 text-text-muted">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `UGX ${c.discount_value}`}</td>
                <td className="px-4 py-3 text-text-muted">{c.uses_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c.id, c.is_active)} className={`text-[10px] font-bold uppercase tracking-wider ${c.is_active ? 'text-success' : 'text-text-light'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-brand">New Coupon</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div><label className={labelClass}>Code</label><input className={inputClass} value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))} placeholder="SAVE20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Type</label><select className={inputClass} value={form.discount_type} onChange={e => setForm(f => ({...f, discount_type: e.target.value}))}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
                <div><label className={labelClass}>Value</label><input type="number" className={inputClass} value={form.discount_value} onChange={e => setForm(f => ({...f, discount_value: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Min Order</label><input type="number" className={inputClass} value={form.min_order} onChange={e => setForm(f => ({...f, min_order: e.target.value}))} /></div>
                <div><label className={labelClass}>Max Uses</label><input type="number" className={inputClass} value={form.max_uses} onChange={e => setForm(f => ({...f, max_uses: e.target.value}))} /></div>
              </div>
              <div><label className={labelClass}>Expires At</label><input type="date" className={inputClass} value={form.expires_at} onChange={e => setForm(f => ({...f, expires_at: e.target.value}))} /></div>
              <button onClick={handleSave} className="w-full px-4 py-3 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light">Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
