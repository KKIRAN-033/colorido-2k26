import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Search, Activity, Shield } from 'lucide-react'
import EventCard from '../../components/EventCard/EventCard'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import { getEvents } from '../../services/api'

export default function Sports() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [divisionFilter, setDivisionFilter] = useState('all') // 'all' | 'boys' | 'girls'

  const fetchSportsEvents = () => {
    setLoading(true)
    setError(null)
    getEvents('sports')
      .then(data => {
        setEvents(data.events || [])
      })
      .catch(err => {
        console.error('Failed to load sports events:', err)
        setError('Unable to connect to event service. Please verify the backend server is running.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSportsEvents()
  }, [])

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.sub_category?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDivision = divisionFilter === 'all' || e.division === divisionFilter
    return matchesSearch && matchesDivision
  })

  const boysEvents = filteredEvents.filter(e => e.division === 'boys')
  const girlsEvents = filteredEvents.filter(e => e.division === 'girls')

  const totalBoysCount = events.filter(e => e.division === 'boys').length
  const totalGirlsCount = events.filter(e => e.division === 'girls').length

  const divisionTabs = [
    { id: 'all', label: `All Sports (${events.length})` },
    { id: 'boys', label: `Boys Division (${totalBoysCount})` },
    { id: 'girls', label: `Girls Division (${totalGirlsCount})` },
  ]

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background ambient glow - Cyan theme */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)',
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.35rem 0.95rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <Trophy size={14} /> Athletic Colosseum
            </div>
            <h1 className="section-title">The Sports Colosseum</h1>
            <p className="section-subtitle">
              6 National-Level Championships across Basketball, Volleyball, Table Tennis, Throwball, and TenniKoit.
            </p>

            {/* Search Bar */}
            <div style={{ maxWidth: '480px', margin: '1.5rem auto 2rem', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.75rem', borderRadius: '999px', background: 'rgba(30, 41, 59, 0.6)' }}
                placeholder="Search sports events by name or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Division Filter Chips — Dynamically computed */}
            <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center' }}>
              {divisionTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDivisionFilter(tab.id)}
                  style={{
                    padding: '0.45rem 1.25rem',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: divisionFilter === tab.id ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(30, 41, 59, 0.5)',
                    color: divisionFilter === tab.id ? '#ffffff' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '0.9rem' }}>Loading sports championships...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '1rem', maxWidth: '520px', margin: '2rem auto' }}>
              <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
              <SignatureCTA
                onClick={fetchSportsEvents}
                theme="cyan"
                size="md"
              >
                Retry Connecting
              </SignatureCTA>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
              <p>No matching sports tournaments found.</p>
            </div>
          ) : (
            <>
              {/* BOYS DIVISION */}
              {boysEvents.length > 0 && (
                <div style={{ marginBottom: '3.5rem' }}>
                  <motion.h2
                    style={{
                      fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--ff-heading)',
                      marginBottom: '1.25rem', paddingBottom: '0.65rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      color: '#ffffff',
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <span style={{ color: '#06b6d4' }}>⚡</span> Boys Championships
                  </motion.h2>

                  <div className="grid-events">
                    {boysEvents.map((event, i) => (
                      <EventCard key={event.id || event.slug} event={event} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* GIRLS DIVISION */}
              {girlsEvents.length > 0 && (
                <div>
                  <motion.h2
                    style={{
                      fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--ff-heading)',
                      marginBottom: '1.25rem', paddingBottom: '0.65rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      color: '#ffffff',
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <span style={{ color: '#f43f5e' }}>⚡</span> Girls Championships
                  </motion.h2>

                  <div className="grid-events">
                    {girlsEvents.map((event, i) => (
                      <EventCard key={event.id || event.slug} event={event} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <SignatureCTA to="/register" theme="cyan" size="lg">
              Register Free For Sports Arena
            </SignatureCTA>
          </div>
        </div>
      </section>

    </div>
  )
}
