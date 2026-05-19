import { useEffect, useState } from 'react'
import { Plus, Trash2, X, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

const CATEGORIES = ['marketing', 'hosting', 'tools', 'supplies', 'shipping', 'design', 'other']

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ category: 'other', description: '', amount: '', currency: 'UGX', date: new Date().toISOString().split('T')[0], payment_method: '', notes: '' })

  useEffect(() => { loadExpenses() }, [filter])

  async function loadExpenses() {
    let query = supabase.from('bybisa_expenses').select('*').order('date', { ascending: false })
    if (filter !== 'all') query = query.eq('category', filter)
    const { data } = await query
    setExpenses(data || [])
  }

  async function handleSave() {
    await supabase.from('bybisa_expenses').insert({
      category: form.category, description: form.description || null,
      amount: parseFloat(form.amount) || 0, currency: form.currency,
      date: form.date, payment_method: form.payment_method || null, notes: form.notes || null,
    })
    setShowForm(false)
    setForm({ category: 'other', description: '', amount: '', currency: 'UGX', date: new Date().toISOString().split('T')[0], payment_method: '', notes: '' })
    loadExpenses()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this expense?')) return
    await supabase.from('bybisa_expenses').delete().eq('id', id)
    loadExpenses()
  }

  function exportCSV() {
    const header = 'Date,Category,Description,Amount,Currency,Payment Method,Notes\n'
    const rows = expenses.map(e => `"${e.date}","${e.category}","${e.description || ''}",${e.amount},"${e.currency}","${e.payment_method || ''}","${e.notes || ''}"`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bybisa-expenses.csv'; a.click()
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const byCategory = CATEGORIES.map(cat => ({
    cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1.5"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand">Expenses</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border rounded-full text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-brand">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider">
            <Plus className="w-4 h-4" /> Log Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total Expenses</span>
          <p className="text-xl font-extrabold text-brand mt-1">{formatPrice(totalExpenses, 'UGX')}</p>
        </div>
        {byCategory.slice(0, 3).map(c => (
          <div key={c.cat} className="bg-surface border border-border rounded-lg p-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{c.cat}</span>
            <p className="text-xl font-extrabold text-brand mt-1">{formatPrice(c.total, 'UGX')}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${filter === cat ? 'bg-brand text-white' : 'bg-surface border border-border text-text-muted hover:text-brand'}`}>
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Expenses table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Date</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Category</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Description</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Amount</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border-light">
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-bg">
                <td className="px-4 py-3 text-text-muted">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-4 py-3"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-bg text-text-muted">{e.category}</span></td>
                <td className="px-4 py-3 text-text-muted">{e.description || 'â'}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(e.amount, e.currency)}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(e.id)} className="p-1.5 text-text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-text-light">No expenses recorded</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-brand">Log Expense</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Category</label><select className={inputClass} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={labelClass}>Date</label><input type="date" className={inputClass} value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
              </div>
              <div><label className={labelClass}>Description</label><input className={inputClass} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="What was this for?" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Amount</label><input type="number" className={inputClass} value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0" /></div>
                <div><label className={labelClass}>Currency</label><select className={inputClass} value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}><option value="UGX">UGX</option><option value="USD">USD</option></select></div>
              </div>
              <div><label className={labelClass}>Payment Method</label><input className={inputClass} value={form.payment_method} onChange={e => setForm(f => ({...f, payment_method: e.target.value}))} placeholder="Mobile money, bank, cash..." /></div>
              <div><label className={labelClass}>Notes</label><input className={inputClass} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
              <button onClick={handleSave} className="w-full px-4 py-3 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light">Save Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
