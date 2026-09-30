import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowRight, Calendar, BookOpen, CheckCircle2, Trophy, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import CharacterAvatar from './CharacterAvatar'
import SignatureCTA from '../SignatureCTA/SignatureCTA'
import { CHARACTERS } from '../../characters/charactersData'
import './CharacterShowcase.css'

export default function CharacterShowcase() {
  const [activeCategory, setActiveCategory] = useState('all') // 'all' | 'cultural' | 'sports'
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0])

  const allCount = CHARACTERS.length
  const culturalCount = CHARACTERS.filter(c => c.category === 'cultural').length
  const sportsCount = CHARACTERS.filter(c => c.category === 'sports').length

  const filteredCharacters = activeCategory === 'all'
    ? CHARACTERS
    : CHARACTERS.filter(c => c.category === activeCategory)

  return (
    <section className="character-showcase-section" id="avengers">
      {/* Background ambient lighting */}
      <div
        className="showcase-ambient-glow"
        style={{
          background: `radial-gradient(circle at 70% 40%, ${selectedCharacter.glowColor || 'rgba(168,85,247,0.2)'} 0%, transparent 65%)`
        }}
      />

      <div className="character-showcase-container">
        {/* Section Header */}
        <div className="character-showcase-header">
          <div className="character-showcase-badge">
            <Sparkles size={15} />
            COLORIDO 2K26 Event Ambassadors
          </div>
          <h2 className="character-showcase-title">
            Featured Avengers of the Arena
          </h2>
          <p className="character-showcase-desc">
            Explore all 16 official Cultural & Sports championships. Each discipline is championed by an Avenger ambassador guiding your path to championship glory.
          </p>

          {/* Filter Tabs */}
          <div className="character-tabs">
            <button
              className={`character-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Championships ({allCount})
            </button>
            <button
              className={`character-tab-btn ${activeCategory === 'cultural' ? 'active' : ''}`}
              onClick={() => setActiveCategory('cultural')}
            >
              Cultural Arena ({culturalCount})
            </button>
            <button
              className={`character-tab-btn ${activeCategory === 'sports' ? 'active' : ''}`}
              onClick={() => setActiveCategory('sports')}
            >
              Sports Colosseum ({sportsCount})
            </button>
          </div>
        </div>

        {/* 3D Immersive Spotlight Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCharacter.id}
            className="character-spotlight"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              '--spotlight-theme': selectedCharacter.themeColor,
              '--spotlight-glow': selectedCharacter.glowColor,
            }}
          >
            {/* Left Column: Event Narrative & Guidelines */}
            <div className="character-info-col">
              <div className="spotlight-top-meta">
                <span className="spotlight-arena-badge">
                  {selectedCharacter.category === 'cultural' ? '🎨 CULTURAL ARENA' : '⚡ SPORTS COLOSSEUM'}
                  {selectedCharacter.division ? ` • ${selectedCharacter.division.toUpperCase()}` : ''}
                </span>
                <span className="spotlight-free-tag">100% FREE ENTRY</span>
              </div>

              <h3 className="spotlight-event-heading">
                {selectedCharacter.eventName}
              </h3>

              <div
                className="spotlight-ambassador-line"
                style={{ color: selectedCharacter.themeColor }}
              >
                <span>Championed by <strong>{selectedCharacter.name}</strong></span>
                <span className="spotlight-dash">—</span>
                <span>{selectedCharacter.title}</span>
              </div>

              <blockquote className="spotlight-quote" style={{ borderLeftColor: selectedCharacter.themeColor }}>
                "{selectedCharacter.quote}"
              </blockquote>

              {/* Event Description */}
              <div className="spotlight-desc-block">
                <h4 className="spotlight-block-title">Competition Overview</h4>
                <p className="spotlight-event-desc">
                  {selectedCharacter.eventDescription}
                </p>
              </div>

              {/* Rules & Highlights */}
              {selectedCharacter.rules && selectedCharacter.rules.length > 0 && (
                <div className="spotlight-rules-block">
                  <h4 className="spotlight-block-title">
                    <BookOpen size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Official Competition Guidelines
                  </h4>
                  <ul className="spotlight-rules-list">
                    {selectedCharacter.rules.map((rule, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={13} color={selectedCharacter.themeColor} />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Schedule & Venue */}
              {selectedCharacter.schedule && (
                <div className="spotlight-schedule-pill">
                  <Calendar size={15} color="#38bdf8" />
                  <span><strong>Schedule & Venue:</strong> {selectedCharacter.schedule}</span>
                </div>
              )}

              {/* CTAs */}
              <div className="spotlight-actions">
                <SignatureCTA
                  to={`/register?event=${selectedCharacter.slug}`}
                  theme={selectedCharacter.category === 'sports' ? 'cyan' : 'primary'}
                  size="md"
                >
                  Register Free
                </SignatureCTA>

                <SignatureCTA
                  to={`/events/${selectedCharacter.slug}`}
                  theme="secondary"
                  size="md"
                  icon={ArrowRight}
                >
                  Full Event Rulebook
                </SignatureCTA>
              </div>
            </div>

            {/* Right Column: 3D Holographic Stage */}
            <div className="character-visual-col">
              <div className="hologram-stage-podium">
                {/* Background Tech Rings */}
                <div
                  className="hologram-stage-ring ring-outer"
                  style={{ borderColor: `${selectedCharacter.themeColor}44` }}
                />
                <div
                  className="hologram-stage-ring ring-inner"
                  style={{ borderColor: `${selectedCharacter.themeColor}66` }}
                />

                {/* Ambient Aura Flare */}
                <div
                  className="hologram-aura-glow"
                  style={{ background: selectedCharacter.glowColor }}
                />

                {/* Central Hologram Capsule */}
                <div className="hologram-avatar-wrapper">
                  <CharacterAvatar
                    character={selectedCharacter}
                    size={200}
                    state="idle"
                    showRing={true}
                  />
                </div>

                {/* Pedestal Base Glow */}
                <div
                  className="hologram-pedestal-light"
                  style={{ background: `radial-gradient(ellipse at 50% 100%, ${selectedCharacter.themeColor} 0%, transparent 75%)` }}
                />
              </div>

              {/* Character Badge Under Podium */}
              <div className="hologram-id-card">
                <div className="hologram-id-name">{selectedCharacter.name}</div>
                <div className="hologram-id-role" style={{ color: selectedCharacter.themeColor }}>
                  {selectedCharacter.eventName} Ambassador
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Character Roster Grid */}
        <div className="character-roster-header">
          <span>SELECT AN AMBASSADOR TO INSPECT PROTOCOL</span>
        </div>

        <div className="character-roster-grid">
          {filteredCharacters.map((char) => (
            <motion.div
              key={char.id}
              className={`roster-card ${selectedCharacter.id === char.id ? 'active' : ''}`}
              onClick={() => setSelectedCharacter(char)}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.96 }}
              style={{
                borderColor: selectedCharacter.id === char.id ? char.themeColor : undefined,
                boxShadow: selectedCharacter.id === char.id ? `0 10px 30px rgba(0,0,0,0.6), 0 0 18px ${char.glowColor}` : undefined
              }}
            >
              <CharacterAvatar character={char} size={56} showRing={false} />
              <div className="roster-card-info">
                <div className="roster-card-name">{char.name}</div>
                <div className="roster-card-event">{char.eventName}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
