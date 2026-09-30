import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { IRON_MAN_GLOBAL, CHARACTERS } from '../../characters/charactersData'
import CharacterAvatar from '../CharacterUniverse/CharacterAvatar'
import { getCharacterPrimaryImage } from '../../config/characterAssets'
import './CharacterManager.css'

const CharacterManager = forwardRef(function CharacterManager(
  {
    character = IRON_MAN_GLOBAL,
    initialState = 'idle',
    size = 80,
    showDialogue = false,
    dialogueText = '',
    onStateChange,
    className = '',
  },
  ref
) {
  const [state, setState] = useState(initialState) // 'enter' | 'exit' | 'idle' | 'talk' | 'point' | 'react' | 'highlight' | 'celebrate' | 'navigate'
  const [speech, setSpeech] = useState(dialogueText || character?.quote || '')
  const [speaking, setSpeaking] = useState(showDialogue)

  // Reusable CharacterManager imperative controller methods
  useImperativeHandle(ref, () => ({
    enter: () => {
      setState('enter')
      onStateChange?.('enter')
      setTimeout(() => setState('idle'), 600)
    },
    exit: () => {
      setState('exit')
      onStateChange?.('exit')
    },
    idle: () => {
      setState('idle')
      onStateChange?.('idle')
    },
    talk: (text) => {
      if (text) setSpeech(text)
      setSpeaking(true)
      setState('talk')
      onStateChange?.('talk')
      setTimeout(() => {
        setState('idle')
      }, 4000)
    },
    point: () => {
      setState('point')
      onStateChange?.('point')
      setTimeout(() => setState('idle'), 2500)
    },
    react: () => {
      setState('react')
      onStateChange?.('react')
      setTimeout(() => setState('idle'), 800)
    },
    highlight: (actionName) => {
      setState('highlight')
      onStateChange?.('highlight')
      setTimeout(() => setState('idle'), 1800)
    },
    celebrate: () => {
      setState('celebrate')
      onStateChange?.('celebrate')
    },
    navigate: (callback) => {
      setState('exit')
      onStateChange?.('navigate')
      setTimeout(() => {
        if (callback) callback()
      }, 400)
    },
  }))

  const color = character.themeColor || '#e11d48'
  const accent = character.accentColor || '#38bdf8'
  const heroId = character.id || 'avenger_iron_man'

  // Render iconic Avenger visuals
  const renderHeroVisual = () => {
    switch (heroId) {
      case 'avenger_iron_man':
      case 'avenger_iron_man_tekraft':
        return (
          <>
            <circle cx="50" cy="50" r="32" fill="#7f1d1d" stroke="#eab308" strokeWidth="3" />
            <path d="M35 38 L65 38 L60 76 L50 82 L40 76 Z" fill="#eab308" />
            <path d="M38 52 L45 52 L42 70 L38 65 Z" fill="#b91c1c" />
            <path d="M62 52 L55 52 L58 70 L62 65 Z" fill="#b91c1c" />
            <rect x="42" y="50" width="6" height="3" fill="#38bdf8" />
            <rect x="52" y="50" width="6" height="3" fill="#38bdf8" />
            {/* Mini chest arc glow */}
            <circle cx="50" cy="80" r="5" fill="#38bdf8" />
          </>
        )

      case 'avenger_doctor_strange':
        return (
          <>
            {/* Cloak of Levitation high collar */}
            <path d="M22 65 Q50 20 78 65 L70 85 L30 85 Z" fill="#b91c1c" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="50" cy="46" r="22" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
            {/* Eye of Agamotto amulet */}
            <ellipse cx="50" cy="68" rx="8" ry="6" fill="#f59e0b" />
            <circle cx="50" cy="68" r="3" fill="#22c55e" />
            {/* Graying temples hair */}
            <path d="M35 32 Q50 22 65 32 L62 44 Q50 38 38 44 Z" fill="#334155" />
            <path d="M36 38 L40 40 M64 38 L60 40" stroke="#ffffff" strokeWidth="2" />
          </>
        )

      case 'avenger_thor':
        return (
          <>
            <circle cx="50" cy="48" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            {/* Asgardian Winged Helmet */}
            <path d="M30 42 L18 20 L28 28 Z" fill="#94a3b8" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M70 42 L82 20 L72 28 Z" fill="#94a3b8" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M32 36 Q50 24 68 36 L64 48 Q50 42 36 48 Z" fill="#64748b" />
            {/* Glowing Lightning Eyes */}
            <circle cx="43" cy="48" r="2.5" fill="#38bdf8" />
            <circle cx="57" cy="48" r="2.5" fill="#38bdf8" />
            {/* Mjolnir Hammer head peek */}
            <rect x="74" y="60" width="16" height="10" rx="2" fill="#94a3b8" stroke="#38bdf8" strokeWidth="1" />
          </>
        )

      case 'avenger_hulk':
        return (
          <>
            {/* Gamma Hulk Muscle Face */}
            <circle cx="50" cy="50" r="28" fill="#15803d" stroke="#22c55e" strokeWidth="3" />
            {/* Dark messy hair */}
            <path d="M30 35 Q50 18 70 35 L68 44 Q50 36 32 44 Z" fill="#14532d" />
            {/* Heavy Brow & Green Eyes */}
            <path d="M36 45 L48 48 M64 45 L52 48" stroke="#052e16" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="43" cy="52" r="2.5" fill="#86efac" />
            <circle cx="57" cy="52" r="2.5" fill="#86efac" />
            {/* Clenched Grin */}
            <path d="M42 66 L58 66" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </>
        )

      case 'avenger_captain_america':
        return (
          <>
            <circle cx="50" cy="48" r="24" fill="#1d4ed8" stroke="#ef4444" strokeWidth="2.5" />
            {/* Iconic 'A' on forehead */}
            <text x="50" y="38" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" fontFamily="sans-serif">A</text>
            {/* Chin strap */}
            <path d="M36 48 L42 66 L58 66 L64 48" stroke="#92400e" strokeWidth="2.5" fill="none" />
            {/* Mini Shield in corner */}
            <circle cx="76" cy="72" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <circle cx="76" cy="72" r="9" fill="#1d4ed8" />
            <polygon points="76,66 78,71 83,71 79,74 81,78 76,75 72,78 74,74 70,71 75,71" fill="#ffffff" />
          </>
        )

      case 'avenger_black_panther':
        return (
          <>
            {/* Sleek Vibranium Cowl */}
            <circle cx="50" cy="50" r="26" fill="#0f0728" stroke="#a855f7" strokeWidth="2.5" />
            {/* Cat Ears */}
            <polygon points="32,32 38,18 44,28" fill="#581c87" stroke="#a855f7" strokeWidth="1.5" />
            <polygon points="68,32 62,18 56,28" fill="#581c87" stroke="#a855f7" strokeWidth="1.5" />
            {/* Silver/Purple Eye Slits */}
            <path d="M36 48 L46 51" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round" />
            <path d="M64 48 L54 51" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round" />
            {/* Vibranium Claw Teeth Necklace */}
            <path d="M35 68 L40 73 L45 68 L50 74 L55 68 L60 73 L65 68" stroke="#c084fc" strokeWidth="2.5" fill="none" />
          </>
        )

      case 'avenger_scarlet_witch':
        return (
          <>
            {/* Chaos Magic Red Tiara */}
            <path d="M30 40 L40 22 L50 34 L60 22 L70 40 L65 48 L35 48 Z" fill="#b91c1c" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="50" cy="52" r="22" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
            {/* Auburn hair flowing */}
            <path d="M28 45 Q20 65 30 82 M72 45 Q80 65 70 82" stroke="#991b1b" strokeWidth="3" fill="none" />
            {/* Crimson Glowing Eyes */}
            <circle cx="43" cy="53" r="3" fill="#f87171" />
            <circle cx="57" cy="53" r="3" fill="#f87171" />
          </>
        )

      case 'avenger_loki':
        return (
          <>
            <circle cx="50" cy="52" r="22" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
            {/* Golden Curved Horns */}
            <path d="M35 42 Q15 25 18 10 Q28 15 38 32" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            <path d="M65 42 Q85 25 82 10 Q72 15 62 32" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            {/* Emerald Cape Crest */}
            <circle cx="43" cy="54" r="2.5" fill="#34d399" />
            <circle cx="57" cy="54" r="2.5" fill="#34d399" />
            <path d="M43 65 Q50 69 57 65" stroke="#eab308" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )

      case 'avenger_star_lord':
        return (
          <>
            <circle cx="50" cy="50" r="25" fill="#312e81" stroke="#ec4899" strokeWidth="2" />
            {/* Orange glowing headphones */}
            <rect x="18" y="42" width="7" height="16" rx="3" fill="#f97316" />
            <rect x="75" y="42" width="7" height="16" rx="3" fill="#f97316" />
            <path d="M22 45 A 28 28 0 0 1 78 45" stroke="#f97316" strokeWidth="3" fill="none" />
            {/* Red Lenses Mask */}
            <circle cx="42" cy="50" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
            <circle cx="58" cy="50" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
            {/* Oxygen Rebreather grid */}
            <path d="M42 64 L58 64 M45 68 L55 68" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          </>
        )

      case 'avenger_black_widow':
        return (
          <>
            <circle cx="50" cy="50" r="25" fill="#18181b" stroke="#f43f5e" strokeWidth="2.5" />
            {/* Crimson Red Hourglass emblem */}
            <polygon points="45,30 55,30 47,40 53,40 45,50 55,50" fill="#e11d48" />
            {/* Fierce eyes */}
            <circle cx="42" cy="52" r="2.5" fill="#38bdf8" />
            <circle cx="58" cy="52" r="2.5" fill="#38bdf8" />
            {/* Electro shock baton in hand */}
            <line x1="75" y1="35" x2="85" y2="75" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          </>
        )

      case 'avenger_falcon':
        return (
          <>
            <circle cx="50" cy="50" r="25" fill="#431407" stroke="#f97316" strokeWidth="2" />
            {/* Redwing Flight Visor */}
            <rect x="34" y="44" width="32" height="9" rx="2" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.5" />
            {/* Mechanical Wing silhouettes behind */}
            <path d="M25 45 L5 25 L18 55 Z" fill="#ea580c" />
            <path d="M75 45 L95 25 L82 55 Z" fill="#ea580c" />
          </>
        )

      case 'avenger_hawkeye':
        return (
          <>
            <circle cx="50" cy="50" r="25" fill="#2e1065" stroke="#8b5cf6" strokeWidth="2" />
            {/* Purple Archer Quiver arrow */}
            <line x1="30" y1="70" x2="70" y2="30" stroke="#c084fc" strokeWidth="2.5" />
            <polygon points="70,30 65,36 68,39" fill="#c084fc" />
            {/* Crosshair Target over left eye */}
            <circle cx="42" cy="48" r="6" fill="none" stroke="#a855f7" strokeWidth="1.5" />
            <line x1="42" y1="40" x2="42" y2="56" stroke="#a855f7" strokeWidth="1" />
            <line x1="34" y1="48" x2="50" y2="48" stroke="#a855f7" strokeWidth="1" />
            <circle cx="58" cy="48" r="2.5" fill="#ffffff" />
          </>
        )

      case 'avenger_captain_marvel':
        return (
          <>
            {/* Cosmic Halo & Golden Hair */}
            <circle cx="50" cy="50" r="25" fill="#1e3a8a" stroke="#facc15" strokeWidth="3" />
            {/* Eight-pointed Hala Star on chest */}
            <polygon points="50,28 53,35 60,38 53,41 50,48 47,41 40,38 47,35" fill="#facc15" />
            {/* Photon Eye glow */}
            <circle cx="43" cy="52" r="3" fill="#fde047" />
            <circle cx="57" cy="52" r="3" fill="#fde047" />
          </>
        )

      case 'avenger_shang_chi':
        return (
          <>
            <circle cx="50" cy="50" r="25" fill="#083344" stroke="#06b6d4" strokeWidth="2.5" />
            {/* Ten Rings Orbiting */}
            <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 3" />
            <circle cx="42" cy="50" r="2.5" fill="#ffffff" />
            <circle cx="58" cy="50" r="2.5" fill="#ffffff" />
            {/* Dragon scale collar */}
            <path d="M38 65 Q50 72 62 65" stroke="#ef4444" strokeWidth="3" fill="none" />
          </>
        )

      case 'avenger_wasp':
        return (
          <>
            <circle cx="50" cy="50" r="25" fill="#4c0519" stroke="#ec4899" strokeWidth="2" />
            {/* Translucent Bio-Wings */}
            <ellipse cx="30" cy="30" rx="8" ry="16" fill="rgba(236,72,153,0.3)" stroke="#f472b6" strokeWidth="1" transform="rotate(-30 30 30)" />
            <ellipse cx="70" cy="30" rx="8" ry="16" fill="rgba(236,72,153,0.3)" stroke="#f472b6" strokeWidth="1" transform="rotate(30 70 30)" />
            {/* Bio-Electric Sting Eyes */}
            <ellipse cx="43" cy="50" rx="4" ry="2" fill="#fbbf24" />
            <ellipse cx="57" cy="50" rx="4" ry="2" fill="#fbbf24" />
          </>
        )

      default:
        // Default Iron Man / Stark Armor
        return (
          <>
            <circle cx="50" cy="50" r="28" fill="#7f1d1d" stroke="#eab308" strokeWidth="2.5" />
            <rect x="42" y="48" width="6" height="3" fill="#38bdf8" />
            <rect x="52" y="48" width="6" height="3" fill="#38bdf8" />
          </>
        )
    }
  }

  // Render event-specific signature visual highlight action
  const renderSignatureHighlight = () => {
    switch (character.eventAction) {
      case 'mandala_spin':
        return <div className="action-effect-mandala" />
      case 'lightning_strike':
        return <div className="action-effect-lightning" />
      case 'gamma_smash':
        return <div className="action-effect-gamma" />
      case 'repulsor_blast':
        return <div className="action-effect-repulsor" />
      case 'shield_ricochet':
        return <div className="action-effect-shield" />
      default:
        return <div className="action-effect-repulsor" />
    }
  }

  return (
    <div className={`character-manager-root state-${state} ${className}`} style={{ width: size, height: size }}>
      {/* Speech Balloon when talking */}
      {speaking && (
        <div className="hero-speech-balloon">
          <div className="hero-balloon-name" style={{ color }}>
            {character.name}
          </div>
          <p className="hero-balloon-text">"{speech}"</p>
        </div>
      )}

      {/* Aura Flare */}
      <div
        className="hero-aura-flare"
        style={{ background: character.glowColor || 'rgba(225, 29, 72, 0.6)' }}
      />

      {/* Signature Highlight Action Effect */}
      {state === 'highlight' && renderSignatureHighlight()}

      {/* Actor Stage */}
      <div className="hero-actor-stage" style={{ width: size, height: size }}>
        {getCharacterPrimaryImage(character.id) ? (
          <CharacterAvatar
            character={character}
            size={size}
            showRing={true}
            state={state}
          />
        ) : (
          <svg viewBox="0 0 100 100" width={size} height={size}>
            {renderHeroVisual()}
          </svg>
        )}
      </div>
    </div>
  )
})

export default CharacterManager
