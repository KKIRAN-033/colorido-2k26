import { useState, useEffect } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { getEvents, adminCreateEvent, adminUpdateEvent, adminDeleteEvent } from '../../services/api'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const defaultEvent = {
  name: '', slug: '', category: 'cultural', division: '', sub_category: '', description: '', rules: '',
  eligibility: '', participation_type: 'solo', max_participants: '', max_team_size: '', min_team_size: '',
  venue: 'TBA', registration_open: true, event_number: '', display_order: 0,
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...defaultEvent })

  const fetchEvents = () => {
    setLoading(true)
    getEvents().then(data => setEvents(data.events || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvents() }, [])

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleCreate = async () => {
    try {
      const data = { ...form }
      if (!data.slug) data.slug = autoSlug(data.name)
      data.max_participants = data.max_participants ? parseInt(data.max_participants) : null
      data.max_team_size = data.max_team_size ? parseInt(data.max_team_size) : null
      data.min_team_size = data.min_team_size ? parseInt(data.min_team_size) : null
      data.event_number = data.event_number ? parseInt(data.event_number) : null
      data.display_order = parseInt(data.display_order) || 0
      await adminCreateEvent(data)
      setShowForm(false); setForm({ ...defaultEvent }); fetchEvents()
    } catch (err) { alert(err.response?.data?.detail || 'Failed to create event') }
  }

  const handleUpdate = async () => {
    try {
      const data = { ...form }
      data.max_participants = data.max_participants ? parseInt(data.max_participants) : null
      data.max_team_size = data.max_team_size ? parseInt(data.max_team_size) : null
      data.min_team_size = data.min_team_size ? parseInt(data.min_team_size) : null
      await adminUpdateEvent(editing.id, data)
      setEditing(null); setShowForm(false); setForm({ ...defaultEvent }); fetchEvents()
    } catch (err) { alert(err.response?.data?.detail || 'Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    try { await adminDeleteEvent(id); fetchEvents() } catch { alert('Failed to delete') }
  }

  const openEdit = (event) => {
    setForm({ ...event, max_participants: event.max_participants || '', max_team_size: event.max_team_size || '', min_team_size: event.min_team_size || '', event_number: event.event_number || '' })
    setEditing(event); setShowForm(true)
  }

  const openCreate = () => { setForm({ ...defaultEvent }); setEditing(null); setShowForm(true) }

  return (
    <AdminLayout title="Events">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={16} /> Add Event</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit Event' : 'Create Event'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={e => { updateForm('name', e.target.value); if (!editing) updateForm('slug', autoSlug(e.target.value)) }} /></div>
            <div className="form-group"><label className="form-label">Slug</label>
              <input className="form-input" value={form.slug} onChange={e => updateForm('slug', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => updateForm('category', e.target.value)}><option>cultural</option><option>sports</option></select></div>
            <div className="form-group"><label className="form-label">Division</label>
              <input className="form-input" value={form.division || ''} onChange={e => updateForm('division', e.target.value)} placeholder="e.g., boys, girls, solo, group" /></div>
            <div className="form-group"><label className="form-label">Sub-category</label>
              <input className="form-input" value={form.sub_category || ''} onChange={e => updateForm('sub_category', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Participation Type</label>
              <select className="form-select" value={form.participation_type} onChange={e => updateForm('participation_type', e.target.value)}><option>solo</option><option>team</option></select></div>
            <div className="form-group"><label className="form-label">Max Participants</label>
              <input className="form-input" type="number" value={form.max_participants} onChange={e => updateForm('max_participants', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Venue</label>
              <input className="form-input" value={form.venue} onChange={e => updateForm('venue', e.target.value)} /></div>
            {form.participation_type === 'team' && <>
              <div className="form-group"><label className="form-label">Min Team Size</label>
                <input className="form-input" type="number" value={form.min_team_size} onChange={e => updateForm('min_team_size', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Max Team Size</label>
                <input className="form-input" type="number" value={form.max_team_size} onChange={e => updateForm('max_team_size', e.target.value)} /></div>
            </>}
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => updateForm('description', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Rules</label>
            <textarea className="form-textarea" value={form.rules} onChange={e => updateForm('rules', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Eligibility</label>
            <textarea className="form-textarea" value={form.eligibility} onChange={e => updateForm('eligibility', e.target.value)} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.registration_open} onChange={e => updateForm('registration_open', e.target.checked)} style={{ accentColor: 'var(--clr-primary)' }} />
              Registration Open
            </label>
          </div>
          <button className="btn btn-primary" onClick={editing ? handleUpdate : handleCreate}>
            {editing ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>#</th><th>Name</th><th>Category</th><th>Division</th><th>Type</th><th>Reg Open</th><th>Actions</th></tr></thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td style={{ color: 'var(--clr-text-muted)' }}>{event.event_number || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{event.name}</td>
                  <td><span className={`badge badge-${event.category}`}>{event.category}</span></td>
                  <td>{event.division || '—'}</td>
                  <td>{event.participation_type}</td>
                  <td>{event.registration_open ? <span className="badge badge-success">Open</span> : <span className="badge badge-urgent">Closed</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(event)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--clr-primary)' }} onClick={() => handleDelete(event.id)}><Trash2 size={14} /></button>
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
