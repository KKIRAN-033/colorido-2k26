import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { characterAssets, handleCharacterImageError } from '../../config/characterAssets'
import './SpidermanWebCTA.css'

export default function SpidermanWebCTA({
  children,
  to,
  href,
  target,
  onClick,
  theme = 'primary', // 'primary' | 'secondary' | 'ghost' | 'cyan' | 'gold' | 'amber' | 'emerald' | 'danger'
  size = 'md',       // 'xs' | 'sm' | 'md' | 'lg'
  icon: Icon,
  className = '',
  style = {},
  disabled = false,
  type = 'button',
  fullWidth = false,
  title,
}) {
  const navigate = useNavigate()
  const buttonRef = useRef(null)
  const [animState, setAnimState] = useState('idle') // 'idle' | 'swinging' | 'pulled' | 'released'
  const [spideyCoords, setSpideyCoords] = useState(null)

  // Pure Web Audio synthesized "THWIP" web-shooter sound effect (100% legal)
  const playThwipSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    } catch (_) {}
  }, [])

  const executeAction = (e) => {
    if (onClick) onClick(e)
    if (to) navigate(to)
    if (href) {
      const cleanHref = typeof href === 'string' ? href.trim() : ''
      const isSafe = /^(\/|https?:\/\/|mailto:|tel:|#)/i.test(cleanHref)
      if (isSafe) {
        if (target === '_blank') {
          window.open(cleanHref, '_blank', 'noopener,noreferrer')
        } else {
          window.location.href = cleanHref
        }
      }
    }
    const btn = buttonRef.current
    if (type === 'submit' && !onClick && btn && btn.form) {
      if (typeof btn.form.requestSubmit === 'function') {
        btn.form.requestSubmit()
      } else {
        btn.form.submit()
      }
    }
  }

  const handleTrigger = (e) => {
    if (disabled || animState !== 'idle') return

    // Reduced motion check
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      executeAction(e)
      return
    }

    const btn = buttonRef.current
    if (!btn) {
      executeAction(e)
      return
    }

    const rect = btn.getBoundingClientRect()
    const targetX = rect.left + rect.width / 2
    const targetY = rect.top + rect.height / 2

    // Spider-Man position relative to viewport
    // If button is near right edge, place Spidey to the upper left; else upper right
    const placeLeft = targetX > window.innerWidth - 180
    const spideyX = placeLeft
      ? Math.max(20, targetX - 160)
      : Math.min(window.innerWidth - 120, targetX + 130)

    // Ensure Spidey is always inside viewport vertically
    const spideyY = Math.max(25, Math.min(window.innerHeight - 130, targetY - 145))

    setSpideyCoords({ targetX, targetY, spideyX, spideyY })
    setAnimState('swinging')
    playThwipSound()

    // 1. Web attaches & pulls button (180ms)
    setTimeout(() => {
      setAnimState('pulled')
    }, 180)

    // 2. Web release & Spidey exit (420ms)
    setTimeout(() => {
      setAnimState('released')
    }, 420)

    // 3. Execution of action (580ms)
    setTimeout(() => {
      setAnimState('idle')
      setSpideyCoords(null)
      executeAction(e)
    }, 580)
  }

  return (
    <div
      className={`spiderman-cta-container ${fullWidth ? 'full-width' : ''} ${className}`}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <button
        ref={buttonRef}
        type={type}
        title={title}
        disabled={disabled}
        style={style}
        className={`spiderman-cta-button ${theme} ${size} ${
          animState === 'pulled' ? 'is-web-pulled' : animState === 'released' ? 'is-released' : ''
        }`}
        onClick={handleTrigger}
      >
        {/* Web Splat Decal on button face when web attaches */}
        {animState === 'pulled' && (
          <svg className="web-splat-decal" viewBox="0 0 100 100">
            <path
              d="M50 50 L20 10 M50 50 L80 10 M50 50 L95 50 M50 50 L85 90 M50 50 L15 90 M50 50 L5 50 M35 30 Q50 20 65 30 Q75 50 65 70 Q50 80 35 70 Q25 50 35 30 Z"
              stroke="#ffffff"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}

        {Icon && <Icon size={size === 'lg' ? 22 : size === 'sm' || size === 'xs' ? 15 : 18} />}
        <span>{children}</span>
      </button>

      {/* Spider-Man Web Sling Portal Overlay — USES SUPPLIED IMAGE */}
      {spideyCoords && (animState === 'swinging' || animState === 'pulled') &&
        createPortal(
          <>
            {/* Dynamic Web Filament SVG */}
            <svg className="spidey-web-line-svg">
              <path
                className="web-string-path"
                d={`M ${spideyCoords.spideyX + 35} ${spideyCoords.spideyY + 45} Q ${(spideyCoords.spideyX + spideyCoords.targetX) / 2 + 15} ${(spideyCoords.spideyY + spideyCoords.targetY) / 2 - 25} ${spideyCoords.targetX} ${spideyCoords.targetY}`}
              />
            </svg>

            {/* Spider-Man — Supplied Character Image */}
            <div
              className="spidey-swing-overlay"
              style={{ pointerEvents: 'none' }}
            >
              <div
                className="spidey-swing-actor"
                style={{
                  left: spideyCoords.spideyX,
                  top: spideyCoords.spideyY,
                  transform: animState === 'pulled' ? 'scale(1.12) rotate(-12deg)' : 'scale(1) rotate(0deg)',
                }}
              >
                <div className="spidey-halo-glow" />
                <img
                  src={characterAssets.spiderMan.webShoot}
                  alt="Spider-Man web-shooting for COLORIDO 2K26"
                  className="spidey-swing-image"
                  onError={handleCharacterImageError}
                  draggable="false"
                />
                {/* Web line from hand */}
                <div className="spidey-web-thread" />
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}
