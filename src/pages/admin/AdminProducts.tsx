import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import { formatPrice, generateSlug } from '@/lib/utils'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', short_description: '', price: '', compare_at_price: '',
    currency: 'UGX', category: 'template', file_type: 'pdf', is_active: true, is_featured: false, tags: '',
  })

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    const { data } = await supabase.from('bybisa_products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  function openNew() {
    setEditing(null)
    setForm({ title: '', description: '', short_description: '', price: '', compare_at_price: '',
      currency: 'UGX', category: 'template', file_type: 'pdf', is_active: true, is_featured: false, tags: '' })
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      title: p.title, description: p.description || '', short_description: p.short_description || '',
      price: p.price.toString(), compare_at_price: p.compare_at_price?.toString() || '',
      currency: p.currency, category: p.category, file_type: p.file_type || 'pdf',
      is_active: p.is_active, is_featured: p.is_featured, tags: (p.tags || []).join(', '),
    })
    setShowForm(true)
  }

  async function handleSave() {
    const data = {
      title: form.title,
      slug: editing?.slug || generateSlug(form.title),
      description: form.description || null,
      short_description: form.short_description || null,
      price: parseFloat(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      currency: form.currency,
      category: form.category,
      file_type: form.file_type,
      is_active: form.is_active,
      is_featured: form.is_featured,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }

    if (editing) {
      await supabase.from('bybisa_products').update(data).eq('id', editing.id)
    } else {
      await supabase.from('bybisa_products').insert(data)
    }

    setShowForm(false)
    loadProducts()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('bybisa_products').delete().eq('id', id)
    loadProducts()
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1.5"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand">Products</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Product list */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Product</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Category</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Price</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-bg transition-colors">
                <td className="px-4 py-3 font-medium text-brand">{p.title}</td>
                <td className="px-4 py-3 text-text-muted uppercase text-xs tracking-wider">{p.category}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(p.price, p.currency)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${p.is_active ? 'text-success' : 'text-text-light'}`}>
                    {p.is_active ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-text-muted hover:text-brand"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-text-muted hover:text-red-500 ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-brand">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div><label className={labelClass}>Title</label><input className={inputClass} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
              <div><label className={labelClass}>Short Description</label><input className={inputClass} value={form.short_description} onChange={e => setForm(f => ({...f, short_description: e.target.value}))} /></div>
              <div><label className={labelClass}>Description</label><textarea rows={4} className={inputClass} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Price</label><input type="number" className={inputClass} value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} /></div>
                <div><label className={labelClass}>Compare At Price</label><input type="number" className={inputClass} value={form.compare_at_price} onChange={e => setForm(f => ({...f, compare_at_price: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelClass}>Currency</label><select className={inputClass} value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}><option value="UGX">UGX</option><option value="USD">USD</option></select></div>
                <div><label className={labelClass}>Category</label><select className={inputClass} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}><option value="template">Template</option><option value="guide">Guide</option><option value="formula">Formula</option><option value="course">Course</option><option value="bundle">Bundle</option></select></div>
                <div><label className={labelClass}>File Type</label><select className={inputClass} value={form.file_type} onChange={e => setForm(f => ({...f, file_type: e.target.value}))}><option value="pdf">PDF</option><option value="xlsx">XLSX</option><option value="docx">DOCX</option><option value="zip">ZIP</option><option value="pptx">PPTX</option></select></div>
              </div>
              <div><label className={labelClass}>Tags (comma separated)</label><input className={inputClass} value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} /> Active</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))} /> Featured</label>
              </div>
              <button onClick={handleSave} className="w-full px-4 py-3 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light">
                {editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
