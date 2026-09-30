import { useState, useEffect } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { adminGetSponsors, adminCreateSponsor, adminUpdateSponsor, adminDeleteSponsor } from '../../services/api'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const defaultItem = { name: '', tier: 'partner', logo_url: '', website: '', description: '', display_order: 0 }

export default function AdminSponsors() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...defaultItem })

  const fetch_ = () => { setLoading(true); adminGetSponsors().then(d => setItems(d.sponsors || d || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { fetch_() }, [])

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const save = async () => {
    try {
      const data = { ...form, display_order: parseInt(form.display_order) || 0 }
      if (editing) await adminUpdateSponsor(editing.id, data)
      else await adminCreateSponsor(data)
      setShowForm(false); setEditing(null); setForm({ ...defaultItem }); fetch_()
    } catch (err) { alert(err.response?.data?.detail || 'Save failed') }
  }

  const del = async (id) => { if (confirm('Delete this sponsor?')) { try { await adminDeleteSponsor(id); fetch_() } catch { alert('Failed') } } }
  const edit = (item) => { setForm({ ...item }); setEditing(item); setShowForm(true) }

  const tierColors = { title: 'var(--clr-gold)', platinum: '#e5e7eb', gold: 'var(--clr-gold)', silver: '#9ca3af', partner: 'var(--clr-text-muted)' }

  return (
    <AdminLayout title="Sponsors">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ ...defaultItem }); setEditing(null); setShowForm(true) }}><Plus size={16} /> Add Sponsor</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit' : 'Add'} Sponsor</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={e => u('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Tier</label>
              <select className="form-select" value={form.tier} onChange={e => u('tier', e.target.value)}>
                <option>title</option><option>platinum</option><option>gold</option><option>silver</option><option>partner</option>
              </select></div>
            <div className="form-group"><label className="form-label">Logo URL</label>
              <input className="form-input" value={form.logo_url || ''} onChange={e => u('logo_url', e.target.value)} placeholder="https://..." /></div>
            <div className="form-group"><label className="form-label">Website</label>
              <input className="form-input" value={form.website || ''} onChange={e => u('website', e.target.value)} placeholder="https://..." /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description || ''} onChange={e => u('description', e.target.value)} style={{ minHeight: '80px' }} /></div>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : items.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-secondary)' }}>No sponsors yet.</div>
      ) : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Tier</th><th>Website</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.logo_url && <img src={item.logo_url} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px' }} />}
                      {item.name}
                    </div>
                  </td>
                  <td><span className="badge" style={{ color: tierColors[item.tier], border: `1px solid ${tierColors[item.tier]}40`, textTransform: 'capitalize' }}>{item.tier}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>
                    {item.website ? <a href={item.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clr-primary)' }}>{item.website}</a> : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => edit(item)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--clr-primary)' }} onClick={() => del(item.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
