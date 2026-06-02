import { useEffect, useState, useRef } from 'react'
import { Plus, Edit, Trash2, X, Upload, Eye, Globe, FileText, Check, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import { formatPrice, generateSlug } from '@/lib/utils'

type StatusFilter = 'all' | 'draft' | 'published'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '', description: '', short_description: '', price: '', compare_at_price: '',
    currency: 'UGX', category: 'template', file_type: 'pdf', is_active: true, is_featured: false, tags: '',
    file_name: '', file_url: '', file_size: 0,
  })

  useEffect(() => { loadProducts() }, [statusFilter])

  async function loadProducts() {
    let query = supabase.from('bybisa_products').select('*').order('created_at', { ascending: false })
    if (statusFilter === 'published') query = query.eq('publish_status', 'published')
    if (statusFilter === 'draft') query = query.neq('publish_status', 'published')
    const { data } = await query
    setProducts(data || [])
  }

  function openNew() {
    setEditing(null)
    setError('')
    setSuccess('')
    setForm({ title: '', description: '', short_description: '', price: '', compare_at_price: '',
      currency: 'UGX', category: 'template', file_type: 'pdf', is_active: true, is_featured: false, tags: '',
      file_name: '', file_url: '', file_size: 0 })
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setError('')
    setSuccess('')
    setForm({
      title: p.title, description: p.description || '', short_description: p.short_description || '',
      price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
      currency: p.currency, category: p.category, file_type: p.file_type || 'pdf',
      is_active: p.is_active, is_featured: p.is_featured, tags: (p.tags || []).join(', '),
      file_name: (p as any).file_name || '', file_url: (p as any).file_url || '', file_size: (p as any).file_size || 0,
    })
    setShowForm(true)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true)
    setError('')

    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadErr } = await supabase.storage.from('products').upload(path, file)
    if (uploadErr) {
      setError('File upload failed: ' + uploadErr.message)
      setUploadingFile(false)
      return
    }

    setForm(f => ({ ...f, file_name: file.name, file_url: path, file_size: file.size }))
    setUploadingFile(false)
    setSuccess('File uploaded: ' + file.name)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) { setError('Valid price is required'); return }

    setSaving(true)
    setError('')

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug: editing?.slug || generateSlug(form.title.trim()),
      description: form.description.trim() || null,
      short_description: form.short_description.trim() || null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      currency: form.currency,
      category: form.category,
      file_type: form.file_type,
      is_active: form.is_active,
      is_featured: form.is_featured,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      file_name: form.file_name || null,
      file_url: form.file_url || null,
      file_size: form.file_size || null,
    }

    if (!editing) {
      payload.publish_status = 'draft'
    }

    try {
      if (editing) {
        const { error: err } = await supabase.from('bybisa_products').update(payload).eq('id', editing.id)
        if (err) { setError('Save failed: ' + err.message); setSaving(false); return }
      } else {
        const { error: err } = await supabase.from('bybisa_products').insert(payload)
        if (err) { setError('Create failed: ' + err.message); setSaving(false); return }
      }
      setShowForm(false)
      setEditing(null)
      await loadProducts()
    } catch (err: any) {
      setError('Error: ' + (err?.message || 'Please try again'))
    }
    setSaving(false)
  }

  async function handlePublish(id: string) {
    await supabase.from('bybisa_products').update({ publish_status: 'published', is_active: true }).eq('id', id)
    loadProducts()
  }

  async function handleUnpublish(id: string) {
    await supabase.from('bybisa_products').update({ publish_status: 'draft' }).eq('id', id)
    loadProducts()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product permanently?')) return
    const { error } = await supabase.from('bybisa_products').delete().eq('id', id)
    if (error) { alert('Delete failed: ' + error.message); return }
    loadProducts()
  }

  const statusBadge = (status: string) => {
    if (status === 'published') return 'bg-green-50 text-green-700'
    if (status === 'preview') return 'bg-blue-50 text-blue-700'
    return 'bg-amber-50 text-amber-700'
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1.5"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand">Products</h1>
          <p className="text-xs text-text-muted mt-1">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'published', 'draft'] as StatusFilter[]).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusFilter === f ? 'bg-brand text-white' : 'bg-surface border border-border text-text-muted hover:text-brand'}`}>
            {f === 'all' ? 'All' : f === 'published' ? 'Published' : 'Drafts'}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Product</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Price</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Category</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Status</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">File</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Created</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border-light">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-bg transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-brand cursor-pointer hover:underline" onClick={() => openEdit(p)}>{p.title}</span>
                </td>
                <td className="px-4 py-3 font-semibold">{formatPrice(p.price, p.currency)}</td>
                <td className="px-4 py-3"><span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{p.category}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadge((p as any).publish_status || 'draft')}`}>
                    {(p as any).publish_status || 'draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(p as any).file_name ? (
                    <span className="flex items-center gap-1 text-[10px] text-green-700"><FileText className="w-3 h-3" /> Yes</span>
                  ) : (
                    <span className="text-[10px] text-text-light">No file</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setPreviewProduct(p)} className="p-1.5 text-text-muted hover:text-blue-600" title="Preview"><Eye className="w-4 h-4" /></button>
                  {(p as any).publish_status !== 'published' ? (
                    <button onClick={() => handlePublish(p.id)} className="p-1.5 text-text-muted hover:text-green-600" title="Publish"><Globe className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => handleUnpublish(p.id)} className="p-1.5 text-green-600 hover:text-amber-600" title="Unpublish"><Globe className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => openEdit(p)} className="p-1.5 text-text-muted hover:text-brand" title="Edit"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-text-muted hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-light">No products</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Preview modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-brand">Preview</h2>
              <button onClick={() => setPreviewProduct(null)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="aspect-square rounded-lg bg-border-light mb-4 flex items-center justify-center">
              {previewProduct.preview_image_url ? (
                <img src={previewProduct.preview_image_url} alt="" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <FileText className="w-16 h-16 text-text-light" strokeWidth={1} />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{previewProduct.category}</span>
            <h3 className="text-xl font-extrabold text-brand mt-1">{previewProduct.title}</h3>
            <p className="text-2xl font-extrabold text-brand mt-2">{formatPrice(previewProduct.price, previewProduct.currency)}</p>
            {previewProduct.compare_at_price && previewProduct.compare_at_price > previewProduct.price && (
              <p className="text-sm text-text-light line-through">{formatPrice(previewProduct.compare_at_price, previewProduct.currency)}</p>
            )}
            {previewProduct.short_description && <p className="text-sm text-text-muted mt-3">{previewProduct.short_description}</p>}
            {previewProduct.description && <p className="text-sm text-text-muted mt-2 whitespace-pre-line">{previewProduct.description}</p>}
            <div className="mt-4 flex gap-3">
              <button className="flex-1 px-4 py-3 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider">Add to Cart</button>
              <button className="flex-1 px-4 py-3 bg-accent text-white rounded-full text-xs font-semibold uppercase tracking-wider">Buy Now</button>
            </div>
            <p className="text-[10px] text-text-light text-center mt-3">This is a preview â buttons are disabled</p>
          </div>
        </div>
      )}

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-brand">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => { setShowForm(false); setError('') }}><X className="w-5 h-5 text-text-muted" /></button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2"><Check className="w-4 h-4 flex-shrink-0" />{success}</div>}

            <div className="space-y-4">
              <div><label className={labelClass}>Title *</label><input className={inputClass} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
              <div><label className={labelClass}>Short Description</label><input className={inputClass} value={form.short_description} onChange={e => setForm(f => ({...f, short_description: e.target.value}))} /></div>
              <div><label className={labelClass}>Description</label><textarea rows={4} className={inputClass} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Price *</label><input type="number" step="0.01" className={inputClass} value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} /></div>
                <div><label className={labelClass}>Compare At Price</label><input type="number" step="0.01" className={inputClass} value={form.compare_at_price} onChange={e => setForm(f => ({...f, compare_at_price: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelClass}>Currency</label><select className={inputClass} value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}><option value="UGX">UGX</option><option value="USD">USD</option></select></div>
                <div><label className={labelClass}>Category</label><select className={inputClass} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}><option value="template">Template</option><option value="guide">Guide</option><option value="formula">Formula</option><option value="course">Course</option><option value="bundle">Bundle</option></select></div>
                <div><label className={labelClass}>File Type</label><select className={inputClass} value={form.file_type} onChange={e => setForm(f => ({...f, file_type: e.target.value}))}><option value="pdf">PDF</option><option value="xlsx">XLSX</option><option value="docx">DOCX</option><option value="zip">ZIP</option><option value="pptx">PPTX</option></select></div>
              </div>

              {/* File Upload */}
              <div>
                <label className={labelClass}>Upload Digital Product File</label>
                {form.file_name && (
                  <div className="mb-2 p-2 bg-green-50 rounded-lg flex items-center gap-2 text-sm text-green-700">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{form.file_name}</span>
                    <span className="text-xs text-green-600 ml-auto">{form.file_size ? (form.file_size / 1024 > 1024 ? (form.file_size / 1048576).toFixed(1) + ' MB' : Math.round(form.file_size / 1024) + ' KB') : ''}</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" onChange={handleFileUpload} accept=".pdf,.xlsx,.xls,.csv,.zip,.docx,.pptx,.png,.jpg,.jpeg" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                  className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg text-sm text-text-muted hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploadingFile ? 'Uploading...' : form.file_name ? 'Replace File' : 'Choose File'}
                </button>
              </div>

              <div><label className={labelClass}>Tags (comma separated)</label><input className={inputClass} value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} /></div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} /> Active</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))} /> Featured</label>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full px-4 py-3 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product (as Draft)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}