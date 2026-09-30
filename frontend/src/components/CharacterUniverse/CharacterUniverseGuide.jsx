import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, Sparkles, Trophy, UserCheck, Compass } from 'lucide-react'
import CharacterAvatar from './CharacterAvatar'
import { MASTER_GUIDE, CHARACTERS, getCharacterBySlug, getCharacterById, IRON_MAN_GLOBAL } from '../../characters/charactersData'
import './CharacterUniverseGuide.css'

export default function CharacterUniverseGuide({
  activeCharacter = MASTER_GUIDE,
  context = 'welcome', // 'welcome' | 'cultural' | 'sports' | 'register' | 'celebrate'
  onDismiss,
  customMessage,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [character, setCharacter] = useState(activeCharacter)
  const [isOpen, setIsOpen] = useState(false)
  const [animState, setAnimState] = useState('enter') // 'idle' | 'enter' | 'exit' | 'talk' | 'point' | 'react' | 'celebrate' | 'navigate'
  const [dismissed, setDismissed] = useState(false)

  // Dynamically resolve character based on active route
  useEffect(() => {
    if (activeCharacter && activeCharacter !== MASTER_GUIDE) {
      setCharacter(activeCharacter)
      return
    }

    const path = location.pathname
    if (path.startsWith('/events/')) {
      const slug = path.replace('/events/', '').split('/')[0]
      const eventChar = getCharacterBySlug(slug)
      if (eventChar) setCharacter(eventChar)
    } else if (path === '/cultural') {
      const char = getCharacterById('avenger_scarlet_witch') || getCharacterById('avenger_vision')
      if (char) setCharacter(char)
    } else if (path === '/sports') {
      const char = getCharacterById('avenger_thor') || getCharacterById('avenger_hulk')
      if (char) setCharacter(char)
    } else if (path === '/register') {
      const params = new URLSearchParams(location.search)
      const eventSlug = params.get('event')
      if (eventSlug) {
        const eventChar = getCharacterBySlug(eventSlug)
        if (eventChar) setCharacter(eventChar)
        else setCharacter(IRON_MAN_GLOBAL)
      } else {
        setCharacter(IRON_MAN_GLOBAL)
      }
    } else {
      setCharacter(MASTER_GUIDE)
    }
  }, [location, activeCharacter])

  // Context-specific dialogue
  const getContextMessage = () => {
    if (customMessage) return customMessage
    const path = location.pathname

    if (context === 'celebrate') return "🎉 ASTONISHING! You are officially registered in the COLORIDO 2K26 Universe! Keep your ID safe!"
    if (path.startsWith('/events/')) {
      return `Welcome to the ${character.assignedEvent || 'battleground'} protocol! I am ${character.name}. Check the event regulations or claim your entry pass!`
    }
    if (path === '/cultural' || context === 'cultural') {
      return "🎨 The Cultural Arena is humming with creative power! Explore Fine Arts, Music, Dance, and Dramatics!"
    }
    if (path === '/sports' || context === 'sports') {
      return "⚡ The Colosseum gates are open! Check out Basketball, Volleyball, Table Tennis, Throwball, and TenniKoit!"
    }
    if (path === '/register' || context === 'register') {
      return "✍️ Lock in your credential entry pass! 100% certified free registration across all 16 arena disciplines."
    }
    return character.quote || MASTER_GUIDE.quote
  }


  // Guide starts closed and docked — user can tap anytime to open
  useEffect(() => {
    // Keep docked, trigger subtle entrance animation
    setAnimState('idle')
  }, [])

  // Switch to idle state after talk animation
  useEffect(() => {
    if (animState === 'talk') {
      const timer = setTimeout(() => setAnimState('idle'), 4000)
      return () => clearTimeout(timer)
    }
  }, [animState])

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true)
      setAnimState('talk')
    } else {
      setIsOpen(false)
    }
  }

  const handleAction = (path) => {
    setAnimState('navigate')
    setTimeout(() => {
      navigate(path)
      setIsOpen(false)
    }, 350)
  }

  if (dismissed) return null

  return (
    <div className="char-universe-guide-dock no-print">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="char-speech-bubble"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          >
            <div className="char-speech-header">
              <div className="char-name-badge" style={{ color: character.themeColor || '#c084fc' }}>
                {character.name} — {character.title?.split('&')[0]}
              </div>
              <button
                className="char-bubble-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close message"
              >
                <X size={14} />
              </button>
            </div>

            <p className="char-speech-text">
              "{getContextMessage()}"
            </p>

            <div className="char-speech-actions">
              <button
                className="char-speech-action-btn"
                onClick={() => handleAction('/register')}
              >
                <UserCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
                Register
              </button>
              <button
                className="char-speech-action-btn"
                onClick={() => handleAction('/cultural')}
              >
                <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
                Cultural
              </button>
              <button
                className="char-speech-action-btn"
                onClick={() => handleAction('/sports')}
              >
                <Trophy size={12} style={{ display: 'inline', marginRight: 4 }} />
                Sports
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Avatar Floating Trigger */}
      <motion.button
        className="char-guide-trigger"
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <span className="char-guide-badge-pill">
          {isOpen ? 'Tap to close' : 'Ask Guide'}
        </span>
        <CharacterAvatar
          character={character}
          size={64}
          state={animState}
          showRing={true}
        />
      </motion.button>
    </div>
  )
}
