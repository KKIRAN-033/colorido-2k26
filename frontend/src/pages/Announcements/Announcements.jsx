import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, AlertTriangle, Info, ArrowRight } from 'lucide-react'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import { getAnnouncements } from '../../services/api'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnnouncements()
      .then(data => setAnnouncements(data.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const priorityConfig = {
    urgent: { icon: <AlertTriangle size={16} />, color: 'var(--clr-primary)', bg: 'rgba(233,69,96,0.08)' },
    high: { icon: <Bell size={16} />, color: 'var(--clr-gold)', bg: 'rgba(251,191,36,0.08)' },
    normal: { icon: <Info size={16} />, color: 'var(--clr-text-secondary)', bg: 'transparent' },
    low: { icon: <Info size={16} />, color: 'var(--clr-text-muted)', bg: 'transparent' },
  }

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section">
        <div className="container-sm">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="section-title">Announcements</h1>
            <p className="section-subtitle">Stay updated with the latest COLORIDO 2K26 news</p>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--clr-text-secondary)' }}>
              <Bell size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No announcements yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((ann, i) => {
                const cfg = priorityConfig[ann.priority] || priorityConfig.normal
                return (
                  <motion.div key={ann.id} className="card" style={{ padding: '1.5rem 2rem', background: cfg.bg, borderLeft: `3px solid ${cfg.color}` }}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: cfg.color }}>{cfg.icon}</span> {ann.title}
                      </h3>
                      {ann.priority !== 'normal' && ann.priority !== 'low' && (
                        <span className={`badge ${ann.priority === 'urgent' ? 'badge-urgent' : ''}`} style={{ flexShrink: 0 }}>
                          {ann.priority}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', whiteSpace: 'pre-line' }}>{ann.content}</p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                      {ann.created_at ? new Date(ann.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <SignatureCTA to="/register" theme="primary" size="lg" icon={ArrowRight}>
              Secure Your Arena Pass
            </SignatureCTA>
          </div>
        </div>
      </section>
    </div>
  )
}
