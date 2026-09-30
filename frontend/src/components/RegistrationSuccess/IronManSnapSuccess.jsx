import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Printer, Download, Copy, Check, ShieldCheck, Sparkles, RefreshCw, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import SpidermanWebCTA from '../SpidermanCTA/SpidermanWebCTA'
import { downloadRegistrationPdf } from '../../services/api'
import { AVENGERS_MEDIA, verifyMediaAvailability } from '../../config/avengersAssets'
import './IronManSnapSuccess.css'

export default function IronManSnapSuccess({ registration, onReset }) {
  // Phases: 'entering' | 'stones_charging' | 'dialogue' | 'snapped' | 'badge_revealed'
  const [phase, setPhase] = useState('entering')
  const [activeStone, setActiveStone] = useState(-1)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [videoSrc, setVideoSrc] = useState(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [soundMuted, setSoundMuted] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Web Audio synthesized sound effects
  const playSnapAudio = useCallback(() => {
    if (soundMuted) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // High-frequency snap click
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(2600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)

      // Sub-bass cosmic gamma shockwave
      setTimeout(() => {
        if (ctx.state === 'closed') return
        const subOsc = ctx.createOscillator()
        const subGain = ctx.createGain()
        subOsc.type = 'sawtooth'
        subOsc.frequency.setValueAtTime(110, ctx.currentTime)
        subOsc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 1.2)
        subGain.gain.setValueAtTime(0.35, ctx.currentTime)
        subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4)
        subOsc.connect(subGain)
        subGain.connect(ctx.destination)
        subOsc.start()
        subOsc.stop(ctx.currentTime + 1.5)
      }, 40)
    } catch (_) {}
  }, [soundMuted])

  // Play Infinity Stone charge hum
  const playStoneChargeAudio = useCallback((stoneIndex) => {
    if (soundMuted) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const freqs = [220, 277, 330, 370, 440, 554] // Ascending harmonics
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freqs[stoneIndex] || 300, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime((freqs[stoneIndex] || 300) * 1.5, ctx.currentTime + 0.25)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.32)
    } catch (_) {}
  }, [soundMuted])

  // 1. Check for drop-in video in public folder
  useEffect(() => {
    verifyMediaAvailability(AVENGERS_MEDIA.snapScene.video).then(available => {
      if (available) {
        setVideoSrc(AVENGERS_MEDIA.snapScene.video)
      }
    })
  }, [])

  // 2. Main choreography sequence
  const startCinematicSequence = useCallback(() => {
    setPhase('entering')
    setActiveStone(-1)

    if (videoSrc && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
      return
    }

    // Stage 1: Entrance -> Stones Charging (1s)
    const t1 = setTimeout(() => {
      setPhase('stones_charging')
      // Stones light up one by one
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          setActiveStone(i)
          playStoneChargeAudio(i)
        }, i * 220)
      }
    }, 900)

    // Stage 2: Dialogue "And I... am... Iron Man" (2.4s)
    const t2 = setTimeout(() => {
      setPhase('dialogue')
    }, 2400)

    // Stage 3: THE SNAP! (4.0s)
    const t3 = setTimeout(() => {
      playSnapAudio()
      setPhase('snapped')
    }, 4000)

    // Stage 4: Holographic Badge Reveal (4.8s)
    const t4 = setTimeout(() => {
      setPhase('badge_revealed')
    }, 4800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [videoSrc, playSnapAudio, playStoneChargeAudio])

  useEffect(() => {
    const cleanup = startCinematicSequence()
    return () => {
      if (cleanup) cleanup()
    }
  }, [startCinematicSequence])

  // Ambient dust/embers particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    const width = (canvas.width = canvas.offsetWidth)
    const height = (canvas.height = canvas.offsetHeight)

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -Math.random() * 1.2 - 0.2,
      size: Math.random() * 2.5 + 0.5,
      color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444',
      alpha: Math.random() * 0.7 + 0.3,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.y < 0) p.y = height
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0

        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  const handleCopyId = () => {
    if (!registration?.registration_id) return
    navigator.clipboard.writeText(registration.registration_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => window.print()

  const generateClientPassImage = (reg) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 760
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Dark sci-fi gradient background
      const grad = ctx.createLinearGradient(0, 0, 1200, 760)
      grad.addColorStop(0, '#060a12')
      grad.addColorStop(0.5, '#0d1527')
      grad.addColorStop(1, '#161226')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 1200, 760)

      // Outer gold & crimson border
      ctx.lineWidth = 4
      ctx.strokeStyle = '#f59e0b'
      ctx.strokeRect(24, 24, 1152, 712)

      ctx.lineWidth = 1.5
      ctx.strokeStyle = '#ef4444'
      ctx.strokeRect(32, 32, 1136, 696)

      // Corner tech accents
      const drawCorner = (x, y, dx, dy) => {
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(x, y + dy * 30)
        ctx.lineTo(x, y)
        ctx.lineTo(x + dx * 30, y)
        ctx.stroke()
      }
      drawCorner(44, 44, 1, 1)
      drawCorner(1156, 44, -1, 1)
      drawCorner(44, 716, 1, -1)
      drawCorner(1156, 716, -1, -1)

      // Top Banner
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 36px "Orbitron", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('COLORIDO 2K26 — AVENGERS ARENA', 600, 90)

      ctx.fillStyle = '#38bdf8'
      ctx.font = '600 20px sans-serif'
      ctx.fillText('OFFICIAL CREDENTIAL ENTRY PASS • FREE ADMISSION CONFIRMED', 600, 130)

      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(80, 155)
      ctx.lineTo(1120, 155)
      ctx.stroke()

      // Left Column - Details
      ctx.textAlign = 'left'
      const rows = [
        ['REGISTRATION ID', reg.registration_id || 'N/A', '#f59e0b'],
        ['PARTICIPANT NAME', (reg.participant_name || 'N/A').toUpperCase(), '#ffffff'],
        ['REGISTERED EVENT', reg.event_name || 'N/A', '#38bdf8'],
        ['CATEGORY / DIVISION', `${(reg.event_category || 'General').toUpperCase()} • ${reg.event_division || 'Open'}`, '#e2e8f0'],
        ['INSTITUTION / COLLEGE', reg.college || 'N/A', '#ffffff'],
        ['REGISTERED EMAIL', reg.email || 'N/A', '#94a3b8'],
        ['CONTACT PHONE', reg.phone || 'N/A', '#94a3b8'],
      ]
      if (reg.team_name) {
        rows.push(['TEAM / SQUAD NAME', reg.team_name.toUpperCase(), '#c084fc'])
      }

      let startY = 210
      rows.forEach(([label, val, valColor]) => {
        ctx.fillStyle = '#64748b'
        ctx.font = 'bold 15px sans-serif'
        ctx.fillText(label, 90, startY)

        ctx.fillStyle = valColor || '#ffffff'
        ctx.font = 'bold 22px sans-serif'
        ctx.fillText(val, 90, startY + 28)

        startY += 58
      })

      // Right Card - Verified Seal & Status
      ctx.fillStyle = 'rgba(22, 163, 74, 0.12)'
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(750, 200, 360, 210, 12)
      } else {
        ctx.rect(750, 200, 360, 210)
      }
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 22px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('ENTRY STATUS: VERIFIED', 930, 250)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px sans-serif'
      ctx.fillText('100% FREE ENTRY', 930, 305)

      ctx.fillStyle = '#86efac'
      ctx.font = '15px sans-serif'
      ctx.fillText('No Registration Fee Required', 930, 345)
      ctx.fillText('Colorido 2K26 Festival Committee', 930, 375)

      // Instructions block
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(750, 440, 360, 190, 10)
      } else {
        ctx.rect(750, 440, 360, 190)
      }
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('ENTRY GUIDELINES', 775, 475)

      ctx.fillStyle = '#cbd5e1'
      ctx.font = '14px sans-serif'
      ctx.fillText('1. Present this Pass on phone or printout.', 775, 510)
      ctx.fillText('2. Valid College Photo ID is mandatory.', 775, 540)
      ctx.fillText('3. Report to Arena 30 mins before event slot.', 775, 570)
      ctx.fillText('4. Free entry valid across campus zones.', 775, 600)

      // Footer
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.beginPath()
      ctx.moveTo(80, 675)
      ctx.lineTo(1120, 675)
      ctx.stroke()

      ctx.fillStyle = '#64748b'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('COLORIDO 2K26 NATIONAL FESTIVAL • AUTHORIZED FESTIVAL COMMITTEE CREDENTIAL PASS', 600, 705)

      // Convert to standard PNG image and download
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `COLORIDO_${reg.registration_id}_OfficialPass.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (err) {
      console.error('Canvas fallback pass download failed', err)
    }
  }

  const handleDownload = async () => {
    if (!registration) return
    setDownloading(true)
    try {
      if (registration.registration_id) {
        const response = await downloadRegistrationPdf(registration.registration_id)
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `COLORIDO_${registration.registration_id}_OfficialPass.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        return
      }
    } catch (err) {
      console.warn('Backend PDF generation unavailable, generating standard high-res image pass fallback:', err)
      generateClientPassImage(registration)
    } finally {
      setDownloading(false)
    }
  }

  // Stone details for animation
  const STONES = [
    { name: 'Power', color: '#c084fc', glow: '#a855f7', cx: 152, cy: 60 },
    { name: 'Space', color: '#38bdf8', glow: '#0284c7', cx: 158, cy: 57 },
    { name: 'Reality', color: '#f43f5e', glow: '#e11d48', cx: 165, cy: 58 },
    { name: 'Soul', color: '#fb923c', glow: '#ea580c', cx: 170, cy: 63 },
    { name: 'Time', color: '#4ade80', glow: '#16a34a', cx: 168, cy: 70 },
    { name: 'Mind', color: '#fde047', glow: '#ca8a04', cx: 160, cy: 65, r: 4.5 },
  ]

  return (
    <div className={`snap-cinematic-container ${phase === 'snapped' ? 'screen-shake' : ''}`}>
      {/* 2.39:1 Anamorphic Scope Letterbox Bars */}
      <div className="cinema-letterbox-bar cinema-letterbox-top" />
      <div className="cinema-letterbox-bar cinema-letterbox-bottom" />

      {/* Atmospheric Particles Canvas */}
      <canvas ref={canvasRef} className="snap-particles-canvas" />

      {/* Background Cosmic Energy Vortex */}
      <div className="snap-energy-vortex" />

      {/* Blinding Screen White Flash at the moment of the snap */}
      <div className={`snap-white-flash ${phase === 'snapped' ? 'flash-active' : ''}`} />

      {/* TOP CONTROLS (Mute / Replay) */}
      <div className="snap-top-hud no-print">
        <button
          className="hud-pill-btn"
          onClick={() => setSoundMuted(!soundMuted)}
          title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{soundMuted ? 'Muted' : 'Audio ON'}</span>
        </button>

        <button
          className="hud-pill-btn"
          onClick={startCinematicSequence}
          title="Replay Climax Scene"
        >
          <RotateCcw size={14} />
          <span>Replay Climax</span>
        </button>
      </div>

      {/* CINEMATIC VIEWPORT (RAW VIDEO OR FULL GSAP/SVG ACTOR) */}
      <div className="snap-cinema-viewport">
        {videoSrc ? (
          <div className="snap-video-wrapper">
            <video
              ref={videoRef}
              src={videoSrc}
              playsInline
              autoPlay
              muted={soundMuted}
              className="snap-movie-video-player"
              onEnded={() => setPhase('badge_revealed')}
              onPlay={() => setVideoLoaded(true)}
              onError={() => {
                setVideoSrc(null)
                startCinematicSequence()
              }}
            />
          </div>
        ) : (
          <div className="snap-ironman-actor">
            {/* Luminous Stark Nano-Gauntlet Energy Halo */}
            <div className="snap-ironman-halo-aura" />
            <img
              src="/characters/iron-man/success.png?v=2"
              alt="Iron Man celebrating COLORIDO 2K26 registration success"
              className="snap-ironman-image"
              draggable="false"
              onError={(e) => {
                if (!e.target.dataset.fallbackPng) {
                  e.target.dataset.fallbackPng = 'true'
                  e.target.src = '/characters/iron-man/success.jpeg?v=2'
                  console.warn('[CharacterAssetFallback] Trying success.jpeg fallback')
                } else if (!e.target.dataset.fallbackIntro) {
                  e.target.dataset.fallbackIntro = 'true'
                  e.target.src = '/characters/iron-man/intro.png'
                  console.warn('[CharacterAssetFallback] Missing: iron-man success image, using intro.png')
                }
              }}
            />
            {/* Energy burst behind character */}
            <div className={`snap-energy-burst ${(phase === 'snapped' || phase === 'badge_revealed') ? 'burst-active' : ''}`} />
            {/* Gamma energy veins effect */}
            {(phase === 'stones_charging' || phase === 'dialogue' || phase === 'snapped') && (
              <div className="snap-gamma-veins" />
            )}
          </div>
        )}
      </div>

      {/* CLIMAX DIALOGUE SUBTITLES */}
      <motion.div
        className="snap-dialogue-sub"
        key={phase}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {phase === 'entering' && (
          <span className="subtitle-faint">“I am inevitable...”</span>
        )}
        {phase === 'stones_charging' && (
          <span className="subtitle-surge">“And I...”</span>
        )}
        {phase === 'dialogue' && (
          <span className="subtitle-heroic">“...am... IRON MAN.”</span>
        )}
        {(phase === 'snapped' || phase === 'badge_revealed') && (
          <span className="subtitle-confirmed">
            ✨ “I AM IRON MAN.” • ENTRY PASS CONFIRMED
          </span>
        )}
      </motion.div>

      {/* HOLOGRAPHIC FESTIVAL PASS CREDENTIAL */}
      <AnimatePresence>
        {(phase === 'snapped' || phase === 'badge_revealed') && (
          <motion.div
            className="hologram-credential-badge"
            initial={{ opacity: 0, y: 45, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          >
            <div className="credential-header">
              <div>
                <div className="credential-event-logo">COLORIDO 2K26</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                  Official Avengers Arena Pass • Certified Free Entry
                </div>
              </div>
              <div>
                <span className="credential-status-pill">
                  <ShieldCheck size={14} /> CONFIRMED
                </span>
              </div>
            </div>

            <div className="credential-id-plate">
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', fontWeight: 800 }}>
                Unique Event Pass Number
              </div>
              <div className="credential-id-number">
                {registration?.registration_id}
              </div>
            </div>

            <div className="credential-grid">
              <div>
                <div className="credential-field-label">Champion / Participant</div>
                <div className="credential-field-value">{registration?.participant_name}</div>
              </div>
              <div>
                <div className="credential-field-label">Assigned Arena Event</div>
                <div className="credential-field-value">{registration?.event_name}</div>
              </div>
              <div>
                <div className="credential-field-label">College / University</div>
                <div className="credential-field-value">{registration?.college}</div>
              </div>
              <div>
                <div className="credential-field-label">Discipline / Division</div>
                <div className="credential-field-value">
                  {registration?.event_category?.toUpperCase()} {registration?.event_division ? `(${registration.event_division})` : ''}
                </div>
              </div>
              {registration?.team_name && (
                <div style={{ gridColumn: 'span 2' }}>
                  <div className="credential-field-label">Squad Team Name</div>
                  <div className="credential-field-value">{registration.team_name}</div>
                </div>
              )}
            </div>

            {/* Barcode Strip */}
            <div className="credential-barcode-block">
              <div className="credential-barcode-lines">
                {[5, 2, 7, 3, 4, 2, 6, 4, 3, 7, 2, 5, 3, 6, 2, 4, 7, 3, 2, 5, 4, 6, 2, 5, 3].map((w, i) => (
                  <div key={i} className="credential-bar" style={{ width: `${w}px` }} />
                ))}
              </div>
              <div className="certified-seal">
                <Sparkles size={14} /> 100% Free Pass • Authorized by Stark Industries & Festival Committee
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* USER ACTIONS (NO-PRINT) */}
      {(phase === 'snapped' || phase === 'badge_revealed') && (
        <div className="no-print" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem', zIndex: 30 }}>
          <SpidermanWebCTA
            theme="secondary"
            size="md"
            onClick={handleCopyId}
            icon={copied ? Check : Copy}
          >
            {copied ? 'ID Copied!' : 'Copy Reg ID'}
          </SpidermanWebCTA>

          <SpidermanWebCTA
            theme="secondary"
            size="md"
            onClick={handlePrint}
            icon={Printer}
          >
            Print Official Pass
          </SpidermanWebCTA>

          <SpidermanWebCTA
            theme="secondary"
            size="md"
            onClick={handleDownload}
            disabled={downloading}
            icon={Download}
          >
            {downloading ? 'Preparing Pass (PDF)...' : 'Download Pass (PDF)'}
          </SpidermanWebCTA>

          {onReset && (
            <SpidermanWebCTA
              theme="ghost"
              size="md"
              onClick={onReset}
              icon={RefreshCw}
            >
              Register Another Event
            </SpidermanWebCTA>
          )}

          <SpidermanWebCTA to="/" theme="primary" size="md">
            Return to Multiverse Hub
          </SpidermanWebCTA>
        </div>
      )}
    </div>
  )
}

