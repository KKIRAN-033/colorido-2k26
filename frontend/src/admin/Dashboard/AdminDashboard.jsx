import { useState, useEffect } from 'react'
import AdminLayout from '../Layout/AdminLayout'
import { adminGetDashboard } from '../../services/api'
import { Users, Calendar, Megaphone, Trophy, Image, Heart } from 'lucide-react'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats || {}

  const statCards = [
    { label: 'Total Registrations', value: stats.total_registrations || 0, icon: <Users size={22} />, color: 'var(--clr-primary)' },
    { label: 'Cultural Registrations', value: stats.cultural_registrations || 0, icon: <Users size={22} />, color: 'var(--clr-accent-light)' },
    { label: 'Sports Registrations', value: stats.sports_registrations || 0, icon: <Users size={22} />, color: 'var(--clr-cyan)' },
    { label: 'Confirmed', value: stats.confirmed_registrations || 0, icon: <Users size={22} />, color: 'var(--clr-emerald)' },
    { label: 'Events', value: stats.total_events || 0, icon: <Calendar size={22} />, color: 'var(--clr-gold)' },
    { label: 'Announcements', value: stats.published_announcements || 0, icon: <Megaphone size={22} />, color: '#8b5cf6' },
    { label: 'Results', value: stats.published_results || 0, icon: <Trophy size={22} />, color: '#f59e0b' },
    { label: 'Gallery', value: stats.total_gallery || 0, icon: <Image size={22} />, color: '#ec4899' },
    { label: 'Sponsors', value: stats.total_sponsors || 0, icon: <Heart size={22} />, color: '#14b8a6' },
    { label: 'Unread Messages', value: stats.unread_messages || 0, icon: <Megaphone size={22} />, color: 'var(--clr-primary)' },
  ]

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          <div className="admin-stat-grid">
            {statCards.map((stat, i) => (
              <div key={i} className="admin-stat">
                <div style={{ color: stat.color, marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div className="admin-stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="admin-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Registrations */}
          {data?.recent_registrations?.length > 0 && (
            <div className="admin-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--ff-heading)' }}>Recent Registrations</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>Reg ID</th><th>Name</th><th>Event</th><th>College</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.recent_registrations.map((reg, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.85rem', color: 'var(--clr-primary)' }}>{reg.registration_id}</td>
                      <td>{reg.participant_name}</td>
                      <td>{reg.event_name}</td>
                      <td style={{ color: 'var(--clr-text-secondary)' }}>{reg.college}</td>
                      <td><span className="badge badge-success">{reg.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}
