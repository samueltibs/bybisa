import { useEffect, useState, useRef } from 'react'
import { Plus, Edit, Trash2, X, Upload, Eye, Globe, FileText, Check, AlertCircle, Image } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import { formatPrice, generateSlug } from '@/lib/utils'

type StatusFilter = 'all' | 'draft' | 'published'
interface AdditionalFile { file_url: string; file_name: string; file_size: number; file_type: string }
interface Collection { id: string; name: string; description: string | null }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadingAdditional, setUploadingAdditional] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const additionalInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '', description: '', short_description: '', price: '', compare_at_price: '',
    currency: 'UGX', category: 'template', file_type: 'pdf', is_active: true, is_featured: false, tags: '',
    file_name: '', file_url: '', file_size: 0,
    cover_image_url: '',
    additional_files: [] as AdditionalFile[],
    collection_id: '',
  })

  useEffect(() => { loadProducts(); loadCollections() }, [statusFilter])

  async function loadProducts() {
    let q = supabase.from('bybisa_products').select('*').order('created_at', { ascending: false })
    if (statusFilter === 'published') q = q.eq('publish_status', 'published')
    if (statusFilter === 'draft') q = q.neq('publish_status', 'published')
    const { data } = await q
    setProducts(data || [])
  }

  async function loadCollections() {
    const { data } = await supabase.from('product_collections').select('*').order('name')
    setCollections(data || [])
  }

  function openNew() {
    setEditing(null); setError(''); setSuccess('')
    setForm({ title: '', description: '', short_description: '', price: '', compare_at_price: '',
      currency: 'UGX', category: 'template', file_type: 'pdf', is_active: true, is_featured: false, tags: '',
      file_name: '', file_url: '', file_size: 0, cover_image_url: '', additional_files: [], collection_id: '' })
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p); setError(''); setSuccess('')
    const a = p as any
    setForm({
      title: p.title, description: p.description || '', short_description: p.short_description || '',
      price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
      currency: p.currency, category: p.category, file_type: p.file_type || 'pdf',
      is_active: p.is_active, is_featured: p.is_featured, tags: (p.tags || []).join(', '),
      file_name: a.file_name || '', file_url: a.file_url || '', file_size: a.file_size || 0,
      cover_image_url: a.cover_image_url || '',
      additional_files: a.additional_files || [],
      collection_id: a.collection_id || '',
    })
    setShowForm(true)
  }
  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingCover(true); setError('')
    const path = 'covers/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const { error: err } = await supabase.storage.from('products').upload(path, file)
    if (err) { setError('Cover upload failed: ' + err.message); setUploadingCover(false); return }
    const { data: pub } = supabase.storage.from('products').getPublicUrl(path)
    setForm(f => ({ ...f, cover_image_url: pub.publicUrl }))
    setUploadingCover(false); setSuccess('Cover uploaded')
    setTimeout(() => setSuccess(''), 2000)
  }

  async function uploadProductFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingFile(true); setError('')
    const path = 'files/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const { error: err } = await supabase.storage.from('products').upload(path, file)
    if (err) { setError('File upload failed: ' + err.message); setUploadingFile(false); return }
    setForm(f => ({ ...f, file_name: file.name, file_url: path, file_size: file.size }))
    setUploadingFile(false); setSuccess('File uploaded: ' + file.name)
    setTimeout(() => setSuccess(''), 2000)
  }

  async function uploadAdditionalFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingAdditional(true); setError('')
    const path = 'files/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const { error: err } = await supabase.storage.from('products').upload(path, file)
    if (err) { setError('Upload failed: ' + err.message); setUploadingAdditional(false); return }
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    setForm(f => ({ ...f, additional_files: [...f.additional_files, { file_url: path, file_name: file.name, file_size: file.size, file_type: ext }] }))
    setUploadingAdditional(false)
  }

  function removeAdditionalFile(idx: number) {
    setForm(f => ({ ...f, additional_files: f.additional_files.filter((_, i) => i !== idx) }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.price || isNaN(Number(form.price))) { setError('Valid price is required'); return }
    setSaving(true); setError('')
    const payload: Record<string, unknown> = {
      title: form.title.trim(), slug: editing?.slug || generateSlug(form.title.trim()),
      description: form.description.trim() || null, short_description: form.short_description.trim() || null,
      price: Number(form.price), compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      currency: form.currency, category: form.category, file_type: form.file_type,
      is_active: form.is_active, is_featured: form.is_featured,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      file_name: form.file_name || null, file_url: form.file_url || null, file_size: form.file_size || null,
      cover_image_url: form.cover_image_url || null,
      additional_files: form.additional_files,
      collection_id: form.collection_id || null,
    }
    if (!editing) payload.publish_status = 'draft'
    try {
      const { error: err } = editing
        ? await supabase.from('bybisa_products').update(payload).eq('id', editing.id)
        : await supabase.from('bybisa_products').insert(payload)
      if (err) { setError('Save failed: ' + err.message); setSaving(false); return }
      setShowForm(false); setEditing(null); await loadProducts()
    } catch (err: any) { setError('Error: ' + (err?.message || 'Try again')) }
    setSaving(false)
  }

  async function handlePublish(id: string) { await supabase.from('bybisa_products').update({ publish_status: 'published', is_active: true }).eq('id', id); loadProducts() }
  async function handleUnpublish(id: string) { await supabase.from('bybisa_products').update({ publish_status: 'draft' }).eq('id', id); loadProducts() }
  async function handleDelete(id: string) { if (!confirm('Delete?')) return; await supabase.from('bybisa_products').delete().eq('id', id); loadProducts() }
  const statusBadge = (s: string) => s === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
  const ic = "w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
  const lc = "block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1.5"
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-extrabold text-brand">Products</h1><p className="text-xs text-text-muted mt-1">{products.length} total</p></div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light"><Plus className="w-4 h-4" /> Add Product</button>
      </div>
      <div className="flex gap-2 mb-6">
        {(['all','published','draft'] as StatusFilter[]).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusFilter===f?'bg-brand text-white':'bg-surface border border-border text-text-muted hover:text-brand'}`}>{f==='all'?'All':f==='published'?'Published':'Drafts'}</button>
        ))}
      </div>
      <div className="bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Product</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Price</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Status</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Cover</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">File</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Date</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border-light">
            {products.map(p => { const a = p as any; return (
              <tr key={p.id} className="hover:bg-bg">
                <td className="px-4 py-3"><span className="font-medium text-brand cursor-pointer hover:underline" onClick={() => openEdit(p)}>{p.title}</span><div className="text-[10px] text-text-light uppercase tracking-wider">{p.category}</div></td>
                <td className="px-4 py-3 font-semibold">{formatPrice(p.price, p.currency)}</td>
                <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadge(a.publish_status||'draft')}`}>{a.publish_status||'draft'}</span></td>
                <td className="px-4 py-3">{a.cover_image_url ? <img src={a.cover_image_url} alt="" className="w-10 h-10 rounded object-cover" /> : <span className="text-[10px] text-text-light">None</span>}</td>
                <td className="px-4 py-3">{a.file_name ? <span className="flex items-center gap-1 text-[10px] text-green-700"><FileText className="w-3 h-3" />Yes</span> : <span className="text-[10px] text-text-light">No</span>}</td>
                <td className="px-4 py-3 text-xs text-text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setPreviewProduct(p)} className="p-1.5 text-text-muted hover:text-blue-600" title="Preview"><Eye className="w-4 h-4" /></button>
                  {a.publish_status!=='published' ? <button onClick={() => handlePublish(p.id)} className="p-1.5 text-text-muted hover:text-green-600" title="Publish"><Globe className="w-4 h-4" /></button> : <button onClick={() => handleUnpublish(p.id)} className="p-1.5 text-green-600 hover:text-amber-600" title="Unpublish"><Globe className="w-4 h-4" /></button>}
                  <button onClick={() => openEdit(p)} className="p-1.5 text-text-muted hover:text-brand"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>)})}
            {products.length===0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-light">No products</td></tr>}
          </tbody>
        </table>
      </div>

      {previewProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-4"><h2 className="text-lg font-extrabold text-brand">Preview</h2><button onClick={() => setPreviewProduct(null)}><X className="w-5 h-5 text-text-muted" /></button></div>
            <div className="aspect-square rounded-lg bg-[#F0ECE8] mb-4 overflow-hidden">
              {(previewProduct as any).cover_image_url ? <img src={(previewProduct as any).cover_image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-2"><span className="text-brand font-extrabold text-lg">{previewProduct.title.charAt(0)}</span></div><p className="text-xs text-brand/60 uppercase tracking-wider">{previewProduct.title}</p></div></div>}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{previewProduct.category}</span>
            <h3 className="text-xl font-extrabold text-brand mt-1">{previewProduct.title}</h3>
            <p className="text-2xl font-extrabold text-brand mt-2">{formatPrice(previewProduct.price, previewProduct.currency)}</p>
            {previewProduct.short_description && <p className="text-sm text-text-muted mt-3">{previewProduct.short_description}</p>}
            <p className="text-[10px] text-text-light text-center mt-4">Preview only</p>
          </div>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-6"><h2 className="text-lg font-extrabold text-brand">{editing ? 'Edit Product' : 'New Product'}</h2><button onClick={() => {setShowForm(false);setError('')}}><X className="w-5 h-5 text-text-muted" /></button></div>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2"><Check className="w-4 h-4 flex-shrink-0" />{success}</div>}
            <div className="space-y-4">
              <div><label className={lc}>Title *</label><input className={ic} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
              <div><label className={lc}>Short Description</label><input className={ic} value={form.short_description} onChange={e => setForm(f => ({...f, short_description: e.target.value}))} /></div>
              <div><label className={lc}>Description</label><textarea rows={3} className={ic} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>Price *</label><input type="number" step="0.01" className={ic} value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} /></div>
                <div><label className={lc}>Compare At Price</label><input type="number" step="0.01" className={ic} value={form.compare_at_price} onChange={e => setForm(f => ({...f, compare_at_price: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={lc}>Currency</label><select className={ic} value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}><option value="UGX">UGX</option><option value="USD">USD</option></select></div>
                <div><label className={lc}>Category</label><select className={ic} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}><option value="template">Template</option><option value="guide">Guide</option><option value="formula">Formula</option><option value="course">Course</option><option value="bundle">Bundle</option></select></div>
                <div><label className={lc}>Collection</label><select className={ic} value={form.collection_id} onChange={e => setForm(f => ({...f, collection_id: e.target.value}))}><option value="">None</option>{collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </div>

              <div><label className={lc}>Cover Image</label>
                {form.cover_image_url && <img src={form.cover_image_url} alt="" className="w-20 h-20 rounded object-cover mb-2" />}
                <input ref={coverInputRef} type="file" onChange={uploadCover} accept=".png,.jpg,.jpeg,.webp" className="hidden" />
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover} className="w-full px-4 py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-text-muted hover:border-brand flex items-center justify-center gap-2"><Image className="w-4 h-4" />{uploadingCover ? 'Uploading...' : form.cover_image_url ? 'Replace Cover' : 'Upload Cover Image'}</button>
              </div>

              <div><label className={lc}>Product File</label>
                {form.file_name && <div className="mb-2 p-2 bg-green-50 rounded-lg flex items-center gap-2 text-sm text-green-700"><FileText className="w-4 h-4" /><span className="truncate">{form.file_name}</span><span className="text-xs ml-auto">{form.file_size ? (form.file_size>1048576?(form.file_size/1048576).toFixed(1)+' MB':Math.round(form.file_size/1024)+' KB') : ''}</span></div>}
                <input ref={fileInputRef} type="file" onChange={uploadProductFile} accept=".pdf,.xlsx,.xls,.csv,.zip,.docx,.pptx,.png,.jpg" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile} className="w-full px-4 py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-text-muted hover:border-brand flex items-center justify-center gap-2"><Upload className="w-4 h-4" />{uploadingFile ? 'Uploading...' : form.file_name ? 'Replace File' : 'Upload Product File'}</button>
              </div>

              <div><label className={lc}>Additional Files</label>
                {form.additional_files.map((af, i) => (
                  <div key={i} className="mb-1 p-2 bg-bg rounded-lg flex items-center gap-2 text-sm"><FileText className="w-3 h-3 text-text-muted" /><span className="truncate flex-1">{af.file_name}</span><button onClick={() => removeAdditionalFile(i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button></div>
                ))}
                <input ref={additionalInputRef} type="file" onChange={uploadAdditionalFile} accept=".pdf,.xlsx,.xls,.csv,.zip,.docx,.pptx,.png,.jpg" className="hidden" />
                <button type="button" onClick={() => additionalInputRef.current?.click()} disabled={uploadingAdditional} className="w-full px-3 py-2 border border-dashed border-border rounded-lg text-xs text-text-muted hover:border-brand flex items-center justify-center gap-1"><Plus className="w-3 h-3" />{uploadingAdditional ? 'Uploading...' : 'Add Another File'}</button>
              </div>

              <div><label className={lc}>File Type</label><select className={ic} value={form.file_type} onChange={e => setForm(f => ({...f, file_type: e.target.value}))}><option value="pdf">PDF</option><option value="xlsx">XLSX</option><option value="docx">DOCX</option><option value="zip">ZIP</option><option value="pptx">PPTX</option></select></div>
              <div><label className={lc}>Tags (comma separated)</label><input className={ic} value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} /></div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} />Active</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))} />Featured</label>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full px-4 py-3 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product (as Draft)'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}