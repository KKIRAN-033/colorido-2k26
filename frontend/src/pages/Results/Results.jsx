import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, ArrowRight } from 'lucide-react'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import { getResults } from '../../services/api'

export default function Results() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const params = filter !== 'all' ? filter : undefined
    setLoading(true)
    getResults(params)
      .then(data => setResults(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  // Group by event
  const grouped = results.reduce((acc, r) => {
    const key = r.event_name || 'Unknown'
    if (!acc[key]) acc[key] = { event_name: key, category: r.category, division: r.division, results: [] }
    acc[key].results.push(r)
    return acc
  }, {})

  const positionIcons = { '1st': <Trophy size={18} style={{ color: 'var(--clr-gold)' }} />, '2nd': <Medal size={18} style={{ color: '#c0c0c0' }} />, '3rd': <Award size={18} style={{ color: '#cd7f32' }} /> }

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section">
        <div className="container-sm">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="section-title">Results</h1>
            <p className="section-subtitle">Event results and winners of COLORIDO 2K26</p>
          </motion.div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {['all', 'cultural', 'sports'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--clr-text-secondary)' }}>
              <Trophy size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No results published yet. Check back after events!</p>
            </div>
          ) : (
            Object.values(grouped).map((group, gi) => (
              <motion.div key={gi} className="card" style={{ padding: '1.5rem 2rem', marginBottom: '1.25rem' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{group.event_name}</h3>
                  <span className={`badge badge-${group.category}`}>{group.category}</span>
                  {group.division && <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{group.division}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {group.results.sort((a, b) => a.position.localeCompare(b.position)).map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--clr-bg-alt)' }}>
                      {positionIcons[r.position] || <span style={{ width: '18px' }} />}
                      <span style={{ fontWeight: 700, width: '40px', fontSize: '0.9rem', color: 'var(--clr-primary)' }}>{r.position}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.participant_name}{r.team_name ? ` (${r.team_name})` : ''}</div>
                        {r.college && <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)' }}>{r.college}</div>}
                      </div>
                      {r.score && <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{r.score}</span>}
                    </div>
                  ))}
                </div>
                {group.results[0]?.remarks && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>{group.results[0].remarks}</p>
                )}
              </motion.div>
            ))
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <SignatureCTA to="/register" theme="primary" size="lg" icon={ArrowRight}>
              Compete For The 2K26 Podium
            </SignatureCTA>
          </div>
        </div>
      </section>
    </div>
  )
}
