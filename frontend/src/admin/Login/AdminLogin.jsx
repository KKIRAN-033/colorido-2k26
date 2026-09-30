import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { adminLogin } from '../../services/api'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const data = await adminLogin({ email, password })
      login(data.access_token, data.email)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-primary)', marginBottom: '0.5rem' }}>
            <Sparkles size={20} />
            <span style={{ fontFamily: 'var(--ff-heading)', fontWeight: 800, fontSize: '1.3rem' }}>COLORIDO</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--ff-heading)' }}>Admin Login</h1>
        </div>

        <form className="card" style={{ padding: '2rem' }} onSubmit={handleSubmit}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(233,69,96,0.1)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', color: 'var(--clr-primary)', fontSize: '0.85rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@colorido.in" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
