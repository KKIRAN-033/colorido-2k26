import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Users, User, CheckCircle, XCircle,
  Shield, Zap, Award, Sparkles, BookOpen, Clock, Target, Calendar
} from 'lucide-react'
import CharacterManager from '../../components/CharacterManager/CharacterManager'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import SpidermanWebCTA from '../../components/SpidermanCTA/SpidermanWebCTA'
import EventHighlightPortal from '../../components/EventHighlightPortal/EventHighlightPortal'
import { getEvent } from '../../services/api'
import { getCharacterBySlug } from '../../characters/charactersData'

export default function EventDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [highlightSection, setHighlightSection] = useState(null)
  const [showPortal, setShowPortal] = useState(false)
  const charManagerRef = useRef(null)

  const rulesRef = useRef(null)
  const scheduleRef = useRef(null)
  const registerRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getEvent(slug)
      .then(data => {
        setEvent(data)
        // Trigger character entrance after load
        setTimeout(() => {
          charManagerRef.current?.enter()
        }, 300)
      })
      .catch(err => setError(err.response?.data?.detail || 'Event not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ paddingTop: '6rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  )

  if (error || !event) return (
    <div style={{ paddingTop: '6rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#e94560', fontWeight: 800 }}>Event Not Found</h2>
      <SignatureCTA to="/cultural" theme="secondary" size="md">← Back to Events</SignatureCTA>
    </div>
  )

  const isTeam = event.participation_type === 'team'
  const avenger = getCharacterBySlug(event.slug)

  // Character interactive pointing handlers
  const handlePointRules = () => {
    charManagerRef.current?.point()
    setHighlightSection('rules')
    rulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlightSection(null), 3000)
  }

  const handlePointSchedule = () => {
    charManagerRef.current?.highlight()
    setHighlightSection('schedule')
    scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlightSection(null), 3000)
  }

  const handlePointRegister = () => {
    charManagerRef.current?.celebrate()
    setHighlightSection('register')
    registerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlightSection(null), 3000)
  }

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background ambient lighting tailored to character color */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '450px',
            background: `radial-gradient(circle, ${avenger.glowColor || 'rgba(168, 85, 247, 0.25)'} 0%, transparent 70%)`,
            filter: 'blur(95px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container-sm" style={{ maxWidth: '880px' }}>
          <Link
            to={event.category === 'sports' ? '/sports' : '/cultural'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94a3b8',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={16} /> Back to {event.category === 'sports' ? 'Sports Colosseum' : 'Cultural Arena'}
          </Link>

          {/* 1. CINEMATIC CHARACTER SPOTLIGHT & COMMAND DOCK */}
          <motion.div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: `1.5px solid ${avenger.themeColor}55`,
              borderRadius: '2rem',
              padding: '2rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(16px)',
              boxShadow: `0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px ${avenger.themeColor}33`,
              position: 'relative',
              overflow: 'hidden',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              {/* Imperative Character Manager with visual actions */}
              <CharacterManager
                ref={charManagerRef}
                character={avenger}
                size={110}
                showDialogue={false}
              />

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: avenger.themeColor, marginBottom: '0.2rem' }}>
                  Assigned Avenger Champion: {avenger.name}
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                  {avenger.heroTitle || avenger.title}
                </h2>
                <blockquote style={{ fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.92rem', margin: '0 0 1rem 0', borderLeft: `3px solid ${avenger.themeColor}`, paddingLeft: '0.75rem' }}>
                  "{avenger.quote}"
                </blockquote>

                {/* Character Interactive Directing Chips */}
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <SpidermanWebCTA
                    theme="secondary"
                    size="xs"
                    onClick={handlePointRules}
                    icon={Target}
                  >
                    Point to Rules
                  </SpidermanWebCTA>

                  <SpidermanWebCTA
                    theme="secondary"
                    size="xs"
                    onClick={handlePointSchedule}
                    icon={Calendar}
                  >
                    Highlight Schedule
                  </SpidermanWebCTA>

                  {event.registration_open && (
                    <SpidermanWebCTA
                      theme="emerald"
                      size="xs"
                      onClick={handlePointRegister}
                      icon={Zap}
                    >
                      Celebrate & Register
                    </SpidermanWebCTA>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. EVENT TITLE & BADGES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className={`badge badge-${event.category}`}>{event.category}</span>
              {event.division && (
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  {event.division}
                </span>
              )}
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                100% Free Entry Pass
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, fontFamily: 'var(--ff-heading)', marginBottom: '0.5rem', color: '#ffffff' }}>
              {event.name}
            </h1>

            {event.sub_category && event.sub_category !== event.name && (
              <p style={{ color: '#c084fc', fontSize: '1.1rem', fontWeight: 600 }}>{event.sub_category}</p>
            )}
          </motion.div>

          {/* 3. SCHEDULE & QUICK METRICS */}
          <motion.div
            ref={scheduleRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem',
              borderRadius: '1rem',
              padding: '0.5rem',
              transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
              boxShadow: highlightSection === 'schedule' ? `0 0 25px ${avenger.themeColor}` : 'none',
              border: highlightSection === 'schedule' ? `2px solid ${avenger.themeColor}` : '2px solid transparent',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { icon: <MapPin size={20} color="#ec4899" />, label: 'Venue Location', value: event.venue || 'Campus Main Block' },
              { icon: isTeam ? <Users size={20} color="#38bdf8" /> : <User size={20} color="#34d399" />, label: 'Squad Format', value: isTeam ? `Team (${event.min_team_size || 3}-${event.max_team_size || 10} members)` : 'Solo Individual' },
              { icon: event.registration_open ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />, label: 'Registration Status', value: event.registration_open ? 'Open & Free' : 'Closed' },
              { icon: <Shield size={20} color="#fbbf24" />, label: 'Capacity Limit', value: `${event.max_participants || 100} Participants` },
            ].map((info, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem' }}>
                <div>{info.icon}</div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    {info.label}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', marginTop: '2px' }}>
                    {info.value}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* 4. EVENT OVERVIEW */}
          <motion.div
            className="card"
            style={{ padding: '2rem', marginBottom: '1.75rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#ec4899" /> Event Overview
            </h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.98rem', whiteSpace: 'pre-line' }}>
              {event.description?.replace(/\[.*?\]/g, '')}
            </p>
          </motion.div>

          {/* 5. RULES & GUIDELINES (HIGHLIGHTABLE BY CHARACTER) */}
          <motion.div
            ref={rulesRef}
            className="card"
            style={{
              padding: '2rem',
              marginBottom: '1.75rem',
              transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
              boxShadow: highlightSection === 'rules' ? `0 0 30px ${avenger.themeColor}` : 'none',
              border: highlightSection === 'rules' ? `2px solid ${avenger.themeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="#38bdf8" /> Official Competition Rules
            </h2>
            <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {event.rules?.replace(/\[.*?\]/g, '')}
            </div>
          </motion.div>

          {/* 6. ELIGIBILITY */}
          {event.eligibility && (
            <motion.div
              className="card"
              style={{ padding: '2rem', marginBottom: '2.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="#fbbf24" /> Eligibility Criteria
              </h2>
              <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {event.eligibility?.replace(/\[.*?\]/g, '')}
              </p>
            </motion.div>
          )}

          {/* 7. REGISTRATION CTA (SPIDER-MAN WEB SLING SYSTEM) */}
          {event.registration_open && (
            <div
              ref={registerRef}
              style={{
                textAlign: 'center',
                marginTop: '2.5rem',
                padding: '2.5rem',
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '1.75rem',
                border: highlightSection === 'register' ? `2px solid ${avenger.themeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: highlightSection === 'register' ? `0 0 35px ${avenger.themeColor}` : 'none',
                transition: 'all 0.4s ease',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Ready to Enter the Arena?
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Registration is fast, certified, and 100% free of charge.
              </p>
              <SignatureCTA
                onClick={() => setShowPortal(true)}
                theme={event.category === 'sports' ? 'cyan' : 'primary'}
                size="lg"
              >
                Claim Entry Pass for {event.name}
              </SignatureCTA>
            </div>
          )}
        </div>
      </section>

      {/* Pre-Registration Cinematic Hero Highlight Portal */}
      {showPortal && (
        <EventHighlightPortal
          event={event}
          onClose={() => setShowPortal(false)}
          onComplete={() => navigate(`/register?event=${event.slug}`)}
        />
      )}
    </div>
  )
}

