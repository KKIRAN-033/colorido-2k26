import { useState, useEffect } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { adminGetRegistrations, adminUpdateRegistration, adminExportRegistrations, adminExportSinglePdf } from '../../services/api'
import { Search, Download, Printer, FileText, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [detail, setDetail] = useState(null)

  const fetchRegistrations = () => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (search) params.search = search
    if (categoryFilter) params.category = categoryFilter
    if (statusFilter) params.status = statusFilter
    adminGetRegistrations(params)
      .then(data => {
        setRegistrations(data.registrations || [])
        setTotal(data.total || 0)
        setPages(data.pages || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRegistrations() }, [page, categoryFilter, statusFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchRegistrations()
  }

  const handleExport = async (format) => {
    try {
      const params = {}
      if (categoryFilter) params.category = categoryFilter
      if (statusFilter) params.status = statusFilter
      const response = await adminExportRegistrations(format, params)
      const blob = format === 'csv' ? new Blob([response.data], { type: 'text/csv' }) : response.data
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `COLORIDO_Registrations.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed: ' + (err.message || 'Unknown error'))
    }
  }

  const handlePrintRegistration = (reg) => {
    setDetail(reg)
    setTimeout(() => window.print(), 300)
  }

  const handleDownloadPdf = async (reg) => {
    try {
      const response = await adminExportSinglePdf(reg.id)
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `COLORIDO_${reg.registration_id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('PDF download failed')
    }
  }

  const handleStatusChange = async (reg, newStatus) => {
    try {
      await adminUpdateRegistration(reg.id, { status: newStatus })
      fetchRegistrations()
    } catch (err) {
      alert('Update failed')
    }
  }

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <AdminLayout title="Registrations">
      {/* Filters */}
      <div className="admin-filters no-print">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: '2.25rem' }} placeholder="Search by name, email, phone, ID, college..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="admin-filter-group">
          <label>Category</label>
          <select className="form-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
            style={{ minWidth: '130px' }}>
            <option value="">All</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
          </select>
        </div>

        <div className="admin-filter-group">
          <label>Status</label>
          <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            style={{ minWidth: '130px' }}>
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Export & Bulk Actions */}
      <div className="admin-actions no-print" style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>
          {total} registration{total !== 1 ? 's' : ''}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv')}><Download size={14} /> CSV</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('xlsx')}><Download size={14} /> Excel</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')}><FileText size={14} /> PDF</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : registrations.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-secondary)' }}>No registrations found.</div>
      ) : (
        <div className="admin-card no-print" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(registrations.map(r => r.id)) : new Set())} /></th>
                <th>Reg ID</th>
                <th>Name</th>
                <th>Event</th>
                <th>College</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id}>
                  <td><input type="checkbox" checked={selected.has(reg.id)} onChange={() => toggleSelect(reg.id)} /></td>
                  <td style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.8rem', color: 'var(--clr-primary)', whiteSpace: 'nowrap' }}>{reg.registration_id}</td>
                  <td style={{ fontWeight: 500 }}>{reg.participant_name}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{reg.event_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{reg.event_category}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>{reg.college}</td>
                  <td style={{ fontSize: '0.85rem' }}>{reg.phone}</td>
                  <td>
                    <select className="form-select" value={reg.status} onChange={e => handleStatusChange(reg, e.target.value)}
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', minWidth: '100px' }}>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="attended">Attended</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="btn btn-ghost btn-sm" title="View" onClick={() => setDetail(reg)}><Eye size={14} /></button>
                      <button className="btn btn-ghost btn-sm" title="Print" onClick={() => handlePrintRegistration(reg)}><Printer size={14} /></button>
                      <button className="btn btn-ghost btn-sm" title="PDF" onClick={() => handleDownloadPdf(reg)}><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="admin-pagination no-print">
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>Page {page} of {pages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}><ChevronRight size={16} /></button>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setDetail(null)}>
          <div className="card print-registration" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
            onClick={e => e.stopPropagation()}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Registration Details</h2>
              <button onClick={() => setDetail(null)}><X size={20} /></button>
            </div>

            <div className="print-only" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e94560' }}>COLORIDO 2K26</h2>
              <p>Registration Details</p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)' }}>Registration ID</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--ff-mono)', color: 'var(--clr-primary)' }}>{detail.registration_id}</div>
            </div>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {[
                ['Name', detail.participant_name], ['Email', detail.email], ['Phone', detail.phone],
                ['College', detail.college], ['Department', detail.department || '—'], ['Year', detail.year || '—'],
                ['Event', detail.event_name], ['Category', detail.event_category], ['Division', detail.event_division || '—'],
                ['Type', detail.participation_type], ['Team', detail.team_name || '—'], ['Status', detail.status],
                ['Registered', detail.created_at ? new Date(detail.created_at).toLocaleString() : '—'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', fontSize: '0.88rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--clr-text-secondary)' }}>{l}</span><span>{v}</span>
                </div>
              ))}
              {detail.team_members?.length > 0 && (
                <div><span style={{ fontWeight: 600, color: 'var(--clr-text-secondary)', fontSize: '0.88rem' }}>Members:</span>
                  <ul style={{ paddingLeft: '1.25rem', listStyle: 'disc', marginTop: '0.25rem' }}>
                    {detail.team_members.map((m, i) => <li key={i} style={{ fontSize: '0.88rem' }}>{m.name} {m.phone ? `(${m.phone})` : ''}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><Printer size={14} /> Print</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadPdf(detail)}><FileText size={14} /> PDF</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
