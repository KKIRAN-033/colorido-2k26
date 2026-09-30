import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Zap, Play } from 'lucide-react'
import { getCharacterBySlug, IRON_MAN_GLOBAL } from '../../characters/charactersData'
import { AVENGERS_MEDIA } from '../../config/avengersAssets'
import './EventHighlightPortal.css'

export default function EventHighlightPortal({ event, onClose, onComplete }) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('entering') // 'entering' | 'action' | 'transition'
  const [videoSrc, setVideoSrc] = useState(null)
  const character = event ? getCharacterBySlug(event.slug) : IRON_MAN_GLOBAL

  // Synthesize event-specific cinematic sound effect
  const playSoundEffect = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      switch (character.eventAction) {
        case 'gamma_smash': {
          // Low deep seismic earthquake rumble
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(140, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8)
          gain.gain.setValueAtTime(0.4, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 1.1)
          break
        }
        case 'lightning_strike': {
          // Crackling high-voltage thunderclap
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'square'
          osc.frequency.setValueAtTime(800, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.6)
          gain.gain.setValueAtTime(0.3, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.8)
          break
        }
        case 'web_sling': {
          // Quick high-speed web shooter thwip
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(950, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2)
          gain.gain.setValueAtTime(0.25, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.28)
          break
        }
        default: {
          // Cosmic repulsor / mystic energy surge
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(220, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.5)
          gain.gain.setValueAtTime(0.2, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.9)
          break
        }
      }
    } catch (_) {}
  }, [character.eventAction])

  useEffect(() => {
    // Check if user has dropped in a custom character action video
    const customVideo = AVENGERS_MEDIA.characterClips[character.id]
    if (customVideo) {
      fetch(customVideo, { method: 'HEAD' })
        .then(res => {
          if (res.ok) setVideoSrc(customVideo)
        })
        .catch(() => {})
    }

    playSoundEffect()

    // 1. Enter state
    const t1 = setTimeout(() => {
      setPhase('action')
    }, 300)

    // 2. Auto-advance to registration wizard after 1.8s
    const t2 = setTimeout(() => {
      handleProceed()
    }, 2000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [character, playSoundEffect])

  const handleProceed = () => {
    setPhase('transition')
    setTimeout(() => {
      if (onComplete) {
        onComplete(event)
      } else {
        navigate(`/register?event=${event.slug}`)
        if (onClose) onClose()
      }
    }, 300)
  }

  // Render event-specific visual effects
  const renderVisualEffect = () => {
    switch (character.eventAction) {
      case 'gamma_smash':
        return (
          <div className="portal-fx gamma-smash-fx">
            <div className="gamma-shockwave-ring ring-1" />
            <div className="gamma-shockwave-ring ring-2" />
            <div className="gamma-screen-flash" />
          </div>
        )
      case 'lightning_strike':
        return (
          <div className="portal-fx thor-lightning-fx">
            <div className="lightning-bolt bolt-left" />
            <div className="lightning-bolt bolt-center" />
            <div className="lightning-bolt bolt-right" />
            <div className="thor-flash-overlay" />
          </div>
        )
      case 'web_sling':
        return (
          <div className="portal-fx spidey-web-fx">
            <svg className="spidey-full-web-svg" viewBox="0 0 400 400">
              <path d="M200 200 L0 0 M200 200 L400 0 M200 200 L400 400 M200 200 L0 400" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="200" cy="200" r="50" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 4" />
              <circle cx="200" cy="200" r="110" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="8 6" />
              <circle cx="200" cy="200" r="170" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="10 8" />
            </svg>
          </div>
        )
      case 'mind_beam':
        return (
          <div className="portal-fx vision-mindbeam-fx">
            <div className="mind-stone-gem-glow" />
            <div className="solar-energy-beam" />
            <div className="prism-rays" />
          </div>
        )
      case 'mandala_spin':
        return (
          <div className="portal-fx strange-mandala-fx">
            <div className="mandala-outer-ring" />
            <div className="mandala-inner-ring" />
            <div className="mandala-sparks" />
          </div>
        )
      case 'vibranium_pulse':
        return (
          <div className="portal-fx panther-pulse-fx">
            <div className="vibranium-wave wave-1" />
            <div className="vibranium-wave wave-2" />
            <div className="vibranium-claw-marks" />
          </div>
        )
      case 'chaos_hex':
        return (
          <div className="portal-fx wanda-hex-fx">
            <div className="chaos-rune-circle" />
            <div className="crimson-hex-aura" />
          </div>
        )
      case 'shield_ricochet':
        return (
          <div className="portal-fx cap-shield-fx">
            <div className="shield-flight-path" />
            <div className="vibranium-sparks" />
          </div>
        )
      default:
        return (
          <div className="portal-fx ironman-repulsor-fx">
            <div className="repulsor-beam-core" />
            <div className="hud-targeting-reticle" />
          </div>
        )
    }
  }

  return (
    <div className={`event-highlight-portal-backdrop phase-${phase}`}>
      <div className="portal-anamorphic-letterbox-top" />
      <div className="portal-anamorphic-letterbox-bottom" />

      {/* User Custom Video Override if provided */}
      {videoSrc ? (
        <video
          className="portal-video-player"
          src={videoSrc}
          autoPlay
          playsInline
          muted={false}
          onEnded={handleProceed}
        />
      ) : (
        <div className="portal-cinematic-stage">
          {/* Background Ambient Aura */}
          <div
            className="portal-ambient-glow"
            style={{ background: `radial-gradient(circle, ${character.glowColor} 0%, transparent 70%)` }}
          />

          {/* Dynamic Signature Visual Effect */}
          {renderVisualEffect()}

          {/* Cinematic Hero Card */}
          <motion.div
            className="portal-hero-container"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="portal-hero-badge" style={{ color: character.themeColor }}>
              <Sparkles size={16} /> Avenger Portal Protocol: {character.name}
            </div>

            <h2 className="portal-hero-title">
              {event.name}
            </h2>

            <div className="portal-hero-subtitle" style={{ color: character.themeColor }}>
              {character.heroTitle}
            </div>

            <blockquote className="portal-hero-quote">
              "{character.quote}"
            </blockquote>

            {/* Countdown / Proceed action */}
            <div className="portal-footer-action">
              <div className="portal-timer-bar">
                <div className="portal-timer-progress" />
              </div>

              <button className="portal-skip-btn" onClick={handleProceed}>
                Launch Registration <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
