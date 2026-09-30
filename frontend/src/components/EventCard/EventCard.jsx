import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Users, User, ArrowRight, CheckCircle2, Shield } from 'lucide-react'
import CharacterAvatar from '../CharacterUniverse/CharacterAvatar'
import SignatureCTA from '../SignatureCTA/SignatureCTA'
import EventHighlightPortal from '../EventHighlightPortal/EventHighlightPortal'
import { getCharacterBySlug } from '../../characters/charactersData'
import './EventCard.css'

export default function EventCard({ event, index = 0 }) {
  const navigate = useNavigate()
  const [showPortal, setShowPortal] = useState(false)
  const isTeam = event.participation_type === 'team'
  const avenger = getCharacterBySlug(event.slug)
  const isRegistrationOpen = event.registration_open !== false

  return (
    <>
      <motion.div
        className={`event-card ${event.category}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '150px' }}
        transition={{ delay: (index % 3) * 0.06, duration: 0.35 }}
        style={{
          '--card-theme': avenger.themeColor,
          '--card-glow': avenger.glowColor,
        }}
      >
        {/* Top Featured Avenger Strip */}
        <div className="event-avenger-strip">
          <div className="avenger-badge-peek">
            <CharacterAvatar character={avenger} size={38} showRing={true} />
            <div>
              <span className="avenger-label-micro">Featured Avenger</span>
              <div className="avenger-name-small" style={{ color: avenger.themeColor }}>
                {avenger.name}
              </div>
              <span className="avenger-power-small">{avenger.title}</span>
            </div>
          </div>
          <div className="event-card-number-badge">
            #{String(event.event_number || index + 1).padStart(2, '0')}
          </div>
        </div>

        {/* Title & Badges */}
        <h3 className="event-card-title">{event.name}</h3>

        <div className="event-card-subhead">
          <span className={`event-pill event-pill-${event.category}`}>
            {event.category}
          </span>
          {event.gender && (
            <span className="event-pill event-pill-gender">
              {event.gender}
            </span>
          )}
          {event.division && (
            <span className="event-pill event-pill-division">
              {event.division}
            </span>
          )}
          <span className="free-tag">
            <CheckCircle2 size={12} /> Free Entry
          </span>
          <span className={`reg-status-pill ${isRegistrationOpen ? 'reg-open' : 'reg-closed'}`}>
            {isRegistrationOpen ? '● Reg Open' : '○ Closed'}
          </span>
        </div>

        {/* Description Snippet */}
        <p className="event-card-desc">
          {event.description?.replace(/\[.*?\]/g, '').slice(0, 110)}...
        </p>

        {/* Stats & Event Info Bar */}
        <div className="event-card-stats">
          <span className="event-stat-item">
            {isTeam ? <Users size={14} color="#38bdf8" /> : <User size={14} color="#f472b6" />}
            <span>{isTeam ? `Team (${event.min_team_size || 3}-${event.max_team_size || 10})` : 'Solo Performer'}</span>
          </span>
          <Link to={`/events/${event.slug}#rules`} className="event-stat-link">
            Rules
          </Link>
          <Link to={`/events/${event.slug}#schedule`} className="event-stat-link">
            Schedule
          </Link>
        </div>

        {/* Footer CTA Actions */}
        <div className="event-card-actions">
          <SignatureCTA
            to={`/events/${event.slug}`}
            theme="ghost"
            size="sm"
            icon={ArrowRight}
          >
            Details
          </SignatureCTA>

          {isRegistrationOpen && (
            <SignatureCTA
              onClick={() => setShowPortal(true)}
              theme={event.category === 'sports' ? 'cyan' : 'primary'}
              size="sm"
            >
              Register Free
            </SignatureCTA>
          )}
        </div>
      </motion.div>

      {/* Hero Pre-Registration Cinematic Highlight Portal */}
      {showPortal && (
        <EventHighlightPortal
          event={event}
          onClose={() => setShowPortal(false)}
          onComplete={() => navigate(`/register?event=${event.slug}`)}
        />
      )}
    </>
  )
}

