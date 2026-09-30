import { useState, useEffect } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { adminGetGallery, adminCreateGallery, adminDeleteGallery } from '../../services/api'
import { Plus, Trash2, X, Upload } from 'lucide-react'

export default function AdminGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetch_ = () => { setLoading(true); adminGetGallery().then(d => setImages(d.images || d || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { fetch_() }, [])

  const handleUpload = async () => {
    if (!file || !title) { alert('Title and image are required'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('image', file)
      formData.append('title', title)
      formData.append('category', category)
      await adminCreateGallery(formData)
      setShowForm(false); setTitle(''); setFile(null); setCategory('general'); fetch_()
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed')
    } finally { setUploading(false) }
  }

  const del = async (id) => { if (confirm('Delete this image?')) { try { await adminDeleteGallery(id); fetch_() } catch { alert('Failed') } } }

  return (
    <AdminLayout title="Gallery">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={16} /> Upload Image</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>Upload Image</h3>
            <button onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Title *</label>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Image title" /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="general">General</option><option value="cultural">Cultural</option><option value="sports">Sports</option><option value="behind-the-scenes">Behind the Scenes</option>
              </select></div>
          </div>
          <div className="form-group">
            <label className="form-label">Image *</label>
            <div style={{
              border: '2px dashed var(--clr-border)', borderRadius: 'var(--radius-md)', padding: '2rem',
              textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
            }} onClick={() => document.getElementById('gallery-upload').click()}>
              <Upload size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--clr-text-muted)' }} />
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                {file ? file.name : 'Click to select image'}
              </p>
              <input id="gallery-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : images.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-secondary)' }}>No gallery images yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {images.map(img => (
            <div key={img.id} className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
              {img.image_url || img.thumbnail_url ? (
                <img src={img.thumbnail_url || img.image_url} alt={img.title}
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '150px', background: 'var(--clr-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text-muted)' }}>No image</div>
              )}
              <div style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{img.title}</span>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--clr-primary)' }} onClick={() => del(img.id)}><Trash2 size={14} /></button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{img.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
