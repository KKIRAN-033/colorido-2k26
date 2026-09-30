import { useState, useEffect } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { adminGetResults, adminCreateResult, adminUpdateResult, adminDeleteResult } from '../../services/api'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const defaultItem = { event_name: '', event_id: '', category: 'cultural', division: '', position: '1st', participant_name: '', team_name: '', college: '', score: '', remarks: '' }

export default function AdminResults() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...defaultItem })

  const fetch_ = () => { setLoading(true); adminGetResults().then(d => setItems(d.results || d || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { fetch_() }, [])

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const save = async () => {
    try {
      if (editing) await adminUpdateResult(editing.id, form)
      else await adminCreateResult(form)
      setShowForm(false); setEditing(null); setForm({ ...defaultItem }); fetch_()
    } catch (err) { alert(err.response?.data?.detail || 'Save failed') }
  }

  const del = async (id) => { if (confirm('Delete?')) { try { await adminDeleteResult(id); fetch_() } catch { alert('Failed') } } }
  const edit = (item) => { setForm({ ...item }); setEditing(item); setShowForm(true) }

  return (
    <AdminLayout title="Results">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ ...defaultItem }); setEditing(null); setShowForm(true) }}><Plus size={16} /> Add Result</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit' : 'Add'} Result</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Event Name *</label>
              <input className="form-input" value={form.event_name} onChange={e => u('event_name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => u('category', e.target.value)}><option>cultural</option><option>sports</option></select></div>
            <div className="form-group"><label className="form-label">Division</label>
              <input className="form-input" value={form.division || ''} onChange={e => u('division', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Position *</label>
              <select className="form-select" value={form.position} onChange={e => u('position', e.target.value)}>
                <option>1st</option><option>2nd</option><option>3rd</option><option>Special</option>
              </select></div>
            <div className="form-group"><label className="form-label">Participant/Captain Name *</label>
              <input className="form-input" value={form.participant_name} onChange={e => u('participant_name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Team Name</label>
              <input className="form-input" value={form.team_name || ''} onChange={e => u('team_name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">College</label>
              <input className="form-input" value={form.college || ''} onChange={e => u('college', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Score</label>
              <input className="form-input" value={form.score || ''} onChange={e => u('score', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Remarks</label>
            <input className="form-input" value={form.remarks || ''} onChange={e => u('remarks', e.target.value)} /></div>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Event</th><th>Category</th><th>Position</th><th>Name</th><th>Team</th><th>College</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.event_name}</td>
                  <td><span className={`badge badge-${item.category}`}>{item.category}</span></td>
                  <td style={{ fontWeight: 700, color: item.position === '1st' ? 'var(--clr-gold)' : 'var(--clr-text)' }}>{item.position}</td>
                  <td>{item.participant_name}</td>
                  <td style={{ color: 'var(--clr-text-secondary)' }}>{item.team_name || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{item.college || '—'}</td>
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
