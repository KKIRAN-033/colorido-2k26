import { useState, useEffect } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { adminGetAnnouncements, adminCreateAnnouncement, adminUpdateAnnouncement, adminDeleteAnnouncement } from '../../services/api'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const defaultItem = { title: '', content: '', priority: 'normal', published: true }

export default function AdminAnnouncements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...defaultItem })

  const fetch_ = () => { setLoading(true); adminGetAnnouncements().then(d => setItems(d.announcements || d || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { fetch_() }, [])

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const save = async () => {
    try {
      if (editing) await adminUpdateAnnouncement(editing.id, form)
      else await adminCreateAnnouncement(form)
      setShowForm(false); setEditing(null); setForm({ ...defaultItem }); fetch_()
    } catch (err) { alert(err.response?.data?.detail || 'Save failed') }
  }

  const del = async (id) => { if (confirm('Delete this announcement?')) { try { await adminDeleteAnnouncement(id); fetch_() } catch { alert('Failed') } } }
  const edit = (item) => { setForm({ ...item }); setEditing(item); setShowForm(true) }

  const priorityColors = { urgent: 'var(--clr-primary)', high: 'var(--clr-gold)', normal: 'var(--clr-text-secondary)', low: 'var(--clr-text-muted)' }

  return (
    <AdminLayout title="Announcements">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ ...defaultItem }); setEditing(null); setShowForm(true) }}><Plus size={16} /> Add Announcement</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit' : 'Create'} Announcement</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} /></button>
          </div>
          <div className="form-group"><label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => u('title', e.target.value)} placeholder="Announcement title" /></div>
          <div className="form-group"><label className="form-label">Content *</label>
            <textarea className="form-textarea" value={form.content} onChange={e => u('content', e.target.value)} placeholder="Announcement content..." style={{ minHeight: '150px' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => u('priority', e.target.value)}>
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'end', paddingBottom: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.published} onChange={e => u('published', e.target.checked)} style={{ accentColor: 'var(--clr-primary)' }} />
                Published
              </label>
            </div>
          </div>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : items.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-secondary)' }}>No announcements yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map(item => (
            <div key={item.id} className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.title}</h3>
                  <span className="badge" style={{ color: priorityColors[item.priority], border: `1px solid ${priorityColors[item.priority]}30`, background: `${priorityColors[item.priority]}10` }}>{item.priority}</span>
                  {!item.published && <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Draft</span>}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--clr-text-secondary)', lineHeight: 1.5 }}>{item.content?.slice(0, 200)}{item.content?.length > 200 ? '...' : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => edit(item)}><Edit2 size={14} /></button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--clr-primary)' }} onClick={() => del(item.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
