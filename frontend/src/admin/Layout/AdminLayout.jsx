import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import {
  LayoutDashboard, Calendar, Users, Megaphone, Trophy, Image, Heart, Clock,
  LogOut, Sparkles, MessageSquare
} from 'lucide-react'

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/admin/events', label: 'Events', icon: <Calendar size={18} /> },
  { path: '/admin/registrations', label: 'Registrations', icon: <Users size={18} /> },
  { path: '/admin/schedule', label: 'Schedule', icon: <Clock size={18} /> },
  { path: '/admin/announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
  { path: '/admin/results', label: 'Results', icon: <Trophy size={18} /> },
  { path: '/admin/gallery', label: 'Gallery', icon: <Image size={18} /> },
  { path: '/admin/sponsors', label: 'Sponsors', icon: <Heart size={18} /> },
]

export default function AdminLayout({ children, title }) {
  const { isAuthenticated, logout, adminEmail } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin/login')
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-primary)', marginBottom: '0.25rem' }}>
            <Sparkles size={18} />
            <span style={{ fontFamily: 'var(--ff-heading)', fontWeight: 800, fontSize: '1.15rem' }}>COLORIDO</span>
          </Link>
          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Admin Panel</span>
        </div>

        <nav>
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--clr-border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: '0.75rem' }}>{adminEmail}</div>
          <button className="admin-nav-link" onClick={handleLogout} style={{ color: 'var(--clr-primary)', width: '100%' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {title && (
          <div className="admin-header">
            <h1 className="admin-title">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
