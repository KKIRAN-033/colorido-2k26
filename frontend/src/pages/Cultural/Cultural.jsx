import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Search, Palette, Flame, Music, Crown } from 'lucide-react'
import EventCard from '../../components/EventCard/EventCard'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import { getEvents } from '../../services/api'
import { MASTER_GUIDE } from '../../characters/charactersData'

export default function Cultural() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchCulturalEvents = () => {
    setLoading(true)
    setError(null)
    getEvents('cultural')
      .then(data => {
        setEvents(data.events || [])
      })
      .catch(err => {
        console.error('Failed to load cultural events:', err)
        setError('Unable to connect to event service. Please verify the backend server is running.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCulturalEvents()
  }, [])

  // Categories
  const categories = ['all', 'Fine Arts', 'Music & Band', 'Dance', 'Choreoday', 'Dramatics', 'Fashion Show', 'Tekraft Events', 'Literary']

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.sub_category?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'all' || e.sub_category === activeFilter
    return matchesSearch && matchesFilter
  })

  // Group events by sub_category
  const grouped = filteredEvents.reduce((acc, event) => {
    const key = event.sub_category || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {})

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '2.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f472b6', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.35rem 0.95rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <Palette size={14} /> Cultural Multiverse
            </div>
            <h1 className="section-title">The Cultural Arena</h1>
            <p className="section-subtitle">
              10 National-Level disciplines where imagination, melody, and theatrical grandeur converge.
            </p>

            {/* Search Bar */}
            <div style={{ maxWidth: '480px', margin: '1.5rem auto 2rem', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.75rem', borderRadius: '999px', background: 'rgba(30, 41, 59, 0.6)' }}
                placeholder="Search cultural events by name or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: activeFilter === cat ? 'linear-gradient(135deg, #e94560, #a855f7)' : 'rgba(30, 41, 59, 0.5)',
                    color: activeFilter === cat ? '#ffffff' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat === 'all' ? `All Cultural (${events.length})` : cat}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '0.9rem' }}>Loading cultural disciplines...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '1rem', maxWidth: '520px', margin: '2rem auto' }}>
              <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
              <SignatureCTA
                onClick={fetchCulturalEvents}
                theme="primary"
                size="md"
              >
                Retry Connecting
              </SignatureCTA>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
              <p>No matching cultural events found for your search.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, categoryEvents]) => (
              <div key={category} style={{ marginBottom: '3.5rem' }}>
                <motion.h2
                  style={{
                    fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--ff-heading)',
                    marginBottom: '1.25rem', paddingBottom: '0.65rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: '#ffffff',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span style={{ color: '#ec4899' }}>✦</span> {category}
                </motion.h2>

                <div className="grid-events">
                  {categoryEvents.map((event, i) => (
                    <EventCard key={event.id || event.slug} event={event} index={i} />
                  ))}
                </div>
              </div>
            ))
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <SignatureCTA to="/register" theme="primary" size="lg">
              Register Free For Cultural Arena
            </SignatureCTA>
          </div>
        </div>
      </section>

    </div>
  )
}
