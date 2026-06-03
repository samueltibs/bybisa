import { useEffect, useState } from 'react'
import { Plus, Trash2, X, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Collection { id: string; name: string; description: string | null; created_at: string }

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('product_collections').select('*').order('name')
    setCollections(data || [])
  }

  async function handleSave() {
    if (!form.name.trim()) return
    if (editing) {
      await supabase.from('product_collections').update({ name: form.name.trim(), description: form.description.trim() || null }).eq('id', editing.id)
    } else {
      await supabase.from('product_collections').insert({ name: form.name.trim(), description: form.description.trim() || null })
    }
    setShowForm(false); setEditing(null); setForm({ name: '', description: '' }); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this collection?')) return
    await supabase.from('bybisa_products').update({ collection_id: null }).eq('collection_id', id)
    await supabase.from('product_collections').delete().eq('id', id)
    load()
  }

  const ic = "w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
  const lc = "block text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-1.5"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand">Collections</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light"><Plus className="w-4 h-4" /> New Collection</button>
      </div>
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Name</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Description</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Created</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border-light">
            {collections.map(c => (
              <tr key={c.id} className="hover:bg-bg">
                <td className="px-4 py-3 font-medium text-brand">{c.name}</td>
                <td className="px-4 py-3 text-text-muted">{c.description || '-'}</td>
                <td className="px-4 py-3 text-xs text-text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setShowForm(true) }} className="p-1.5 text-text-muted hover:text-brand"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {collections.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-text-light">No collections yet</td></tr>}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-sm p-6">
            <div className="flex justify-between mb-6"><h2 className="text-lg font-extrabold text-brand">{editing ? 'Edit' : 'New'} Collection</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button></div>
            <div className="space-y-4">
              <div><label className={lc}>Name</label><input className={ic} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div><label className={lc}>Description</label><textarea rows={2} className={ic} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <button onClick={handleSave} className="w-full px-4 py-3 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light">{editing ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}