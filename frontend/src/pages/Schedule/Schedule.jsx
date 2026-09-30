import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Calendar as CalIcon, ArrowRight } from 'lucide-react'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import { getSchedule } from '../../services/api'

export default function Schedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const params = filter !== 'all' ? { category: filter } : {}
    setLoading(true)
    getSchedule(params)
      .then(data => setSchedule(data.schedule || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  // Group by date
  const grouped = schedule.reduce((acc, item) => {
    const date = item.date || 'TBA'
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  const statusColors = {
    scheduled: 'var(--clr-text-secondary)',
    ongoing: 'var(--clr-emerald)',
    completed: 'var(--clr-text-muted)',
    postponed: 'var(--clr-gold)',
    cancelled: 'var(--clr-primary)',
  }

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section">
        <div className="container-sm">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="section-title">Event Schedule</h1>
            <p className="section-subtitle">Stay updated with event timings and venues</p>
          </motion.div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {['all', 'cultural', 'sports'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
                {f === 'all' ? 'All Events' : f}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--clr-text-secondary)' }}>
              <p>No schedule entries found. The schedule will be published soon!</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <motion.div key={date} style={{ marginBottom: '2.5rem' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <CalIcon size={18} style={{ color: 'var(--clr-primary)' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--ff-heading)' }}>{date}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.map((item, i) => (
                    <motion.div key={item.id || i} className="card"
                      style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}
                      initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${item.category}`}>{item.category}</span>
                          {item.division && <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>{item.division}</span>}
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.3rem' }}>{item.event_name}</h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--clr-text-secondary)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} />{item.start_time} – {item.end_time}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} />{item.venue}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: statusColors[item.status] || 'var(--clr-text-secondary)', letterSpacing: '0.05em' }}>
                          {item.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <SignatureCTA to="/register" theme="primary" size="lg" icon={ArrowRight}>
              Register Free For Your Favorite Events
            </SignatureCTA>
          </div>
        </div>
      </section>
    </div>
  )
}
