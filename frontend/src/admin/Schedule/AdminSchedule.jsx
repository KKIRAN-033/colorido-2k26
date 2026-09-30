import { useState, useEffect } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { getSchedule, adminCreateSchedule, adminUpdateSchedule, adminDeleteSchedule } from '../../services/api'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const defaultItem = { event_name: '', event_id: '', category: 'cultural', division: '', date: '', start_time: '', end_time: '', venue: 'TBA', status: 'scheduled' }

export default function AdminSchedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...defaultItem })

  const fetch_ = () => { setLoading(true); getSchedule().then(d => setSchedule(d.schedule || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { fetch_() }, [])

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const save = async () => {
    try {
      if (editing) await adminUpdateSchedule(editing.id, form)
      else await adminCreateSchedule(form)
      setShowForm(false); setEditing(null); setForm({ ...defaultItem }); fetch_()
    } catch (err) { alert(err.response?.data?.detail || 'Save failed') }
  }

  const del = async (id) => { if (confirm('Delete?')) { try { await adminDeleteSchedule(id); fetch_() } catch { alert('Failed') } } }
  const edit = (item) => { setForm({ ...item }); setEditing(item); setShowForm(true) }

  return (
    <AdminLayout title="Schedule">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ ...defaultItem }); setEditing(null); setShowForm(true) }}><Plus size={16} /> Add Entry</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit' : 'Add'} Schedule Entry</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Event Name *</label>
              <input className="form-input" value={form.event_name} onChange={e => u('event_name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => u('category', e.target.value)}><option>cultural</option><option>sports</option></select></div>
            <div className="form-group"><label className="form-label">Division</label>
              <input className="form-input" value={form.division || ''} onChange={e => u('division', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Date *</label>
              <input className="form-input" type="date" value={form.date} onChange={e => u('date', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Start Time</label>
              <input className="form-input" value={form.start_time} onChange={e => u('start_time', e.target.value)} placeholder="10:00 AM" /></div>
            <div className="form-group"><label className="form-label">End Time</label>
              <input className="form-input" value={form.end_time} onChange={e => u('end_time', e.target.value)} placeholder="12:00 PM" /></div>
            <div className="form-group"><label className="form-label">Venue</label>
              <input className="form-input" value={form.venue} onChange={e => u('venue', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => u('status', e.target.value)}>
                <option>scheduled</option><option>ongoing</option><option>completed</option><option>postponed</option><option>cancelled</option>
              </select></div>
          </div>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Event</th><th>Category</th><th>Date</th><th>Time</th><th>Venue</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {schedule.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.event_name}</td>
                  <td><span className={`badge badge-${item.category}`}>{item.category}</span></td>
                  <td>{item.date}</td>
                  <td style={{ fontSize: '0.85rem' }}>{item.start_time} – {item.end_time}</td>
                  <td style={{ fontSize: '0.85rem' }}>{item.venue}</td>
                  <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{item.status}</td>
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
