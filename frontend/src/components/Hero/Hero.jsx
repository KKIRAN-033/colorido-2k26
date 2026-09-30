import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, ShieldCheck, Flame, Trophy, Play, Film } from 'lucide-react'
import { getCharacterPrimaryImage } from '../../config/characterAssets'
import SignatureCTA from '../SignatureCTA/SignatureCTA'
import './Hero.css'

export default function Hero() {
  const canvasRef = useRef(null)
  const heroRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Countdown to Colorido 2K26 (October 15, 2026)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const targetDate = new Date('2026-10-15T09:00:00')
    const updateCountdown = () => {
      const now = new Date()
      const diff = targetDate - now
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      }
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // Mouse parallax tracker
  const handleMouseMove = (e) => {
    if (!heroRef.current || window.innerWidth < 768) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  // Particle canvas (bioluminescent motes + soft dust)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2.2 + 0.4
        this.speedX = (Math.random() - 0.5) * 0.35
        this.speedY = -Math.random() * 0.4 - 0.1 // gentle upward drift
        this.opacity = Math.random() * 0.6 + 0.1
        const colors = ['#ec4899', '#06b6d4', '#8b5cf6', '#fbbf24', '#f43f5e', '#ffffff']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.y < -10) this.y = canvas.height + 10
        if (this.x < -10) this.x = canvas.width + 10
        if (this.x > canvas.width + 10) this.x = -10
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.shadowColor = this.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
    }

    const count = window.innerWidth < 768 ? 40 : 85
    for (let i = 0; i < count; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Connect nearby particles (Desktop only - heavy performance cost on mobile)
      if (window.innerWidth >= 768) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 110) {
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.strokeStyle = `rgba(139, 92, 246, ${0.05 * (1 - dist / 110)})`
              ctx.lineWidth = 0.6
              ctx.stroke()
            }
          }
        }
      }

      particles.forEach(p => {
        p.update()
        p.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced) animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section
      className="hero"
      ref={heroRef}
      onMouseMove={handleMouseMove}
    >
      {/* 1. Deep atmospheric background layers */}
      <div className="hero-bg-deep" />
      <div className="hero-bg-gradient" />
      
      {/* 2. Volumetric light rays */}
      <div className="hero-light-rays">
        <div className="hero-ray hero-ray-1" />
        <div className="hero-ray hero-ray-2" />
        <div className="hero-ray hero-ray-3" />
      </div>

      {/* 3. Noise texture overlay */}
      <div className="hero-noise" />

      {/* 4. Canvas particle & dust system */}
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* 5. Ambient glowing orbs */}
      <motion.div
        className="hero-orb hero-orb-1"
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="hero-orb hero-orb-2"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="hero-orb hero-orb-3"
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 6. Central 3D Celestial Portal Rings (Background Depth) */}
      <div
        className="hero-portal-stage"
        style={{
          transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 20}px, 0)`
        }}
      >
        <div className="portal-ring portal-ring-outer" />
        <div className="portal-ring portal-ring-middle" />
        <div className="portal-ring portal-ring-inner" />
        <div className="portal-core-glow" />
      </div>

      {/* 7. Foreground Content with Mouse Parallax */}
      <div
        className="hero-content"
        style={{
          transform: `translate3d(${-mousePos.x * 15}px, ${-mousePos.y * 12}px, 0)`
        }}
      >
        {/* Pre-title badge */}
        <motion.div
          className="hero-pretitle"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Sparkles size={14} className="hero-sparkle-icon" />
          <span>NATIONAL-LEVEL CULTURAL & SPORTS FESTIVAL</span>
          <span className="hero-bullet">•</span>
          <span className="free-badge">
            <ShieldCheck size={14} /> 100% FREE ENTRY
          </span>
          <span className="hero-bullet">•</span>
          <button
            className="hero-replay-btn no-print"
            onClick={() => window.replayColoridoIntro?.()}
            title="Replay Iron Man Opening Cinematic"
          >
            <Play size={11} fill="currentColor" /> Cinematic Intro
          </button>
        </motion.div>

        {/* Main Title — Majestic, cinematic serif/sans hybrid */}
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero-title-color">COLOR</span>
          <span className="hero-title-ido">IDO</span>
        </motion.h1>

        {/* Year badge — Sleek glowing neon capsule */}
        <motion.div
          className="hero-year-wrap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6, type: 'spring', stiffness: 180 }}
        >
          <div className="hero-year-badge">
            <span className="hero-year-text">2K26</span>
            <span className="hero-year-sub">ANNUAL EDITION</span>
          </div>
        </motion.div>

        {/* Cinematic Tagline */}
        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          16 CHAMPIONSHIPS <span className="hero-tagline-sep">×</span> 2 GRAND ARENAS <span className="hero-tagline-sep">×</span> OCTOBER 15–17, 2026
        </motion.p>

        {/* Frosted Glass Countdown Timer */}
        <motion.div
          className="hero-countdown"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
        >
          {[
            { val: timeLeft.days, label: 'DAYS' },
            { val: timeLeft.hours, label: 'HOURS' },
            { val: timeLeft.minutes, label: 'MINUTES' },
            { val: timeLeft.seconds, label: 'SECONDS' },
          ].map((item, idx) => (
            <div key={idx} className="hero-countdown-item">
              <div className="hero-countdown-val">
                {String(item.val).padStart(2, '0')}
              </div>
              <div className="hero-countdown-label">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* High-Impact Signature CTAs */}
        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          <SignatureCTA to="/register" theme="primary" size="lg" icon={ArrowRight}>
            Register Free — Instant Badge
          </SignatureCTA>
          <SignatureCTA to="/cultural" theme="amber" size="md" icon={Flame}>
            Cultural Arena (10)
          </SignatureCTA>
          <SignatureCTA to="/sports" theme="cyan" size="md" icon={Trophy}>
            Sports Colosseum (6)
          </SignatureCTA>
        </motion.div>
      </div>

      {/* 8. Bottom Scroll Indicator */}
      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        <div className="hero-scroll-line" />
        <span>Scroll to Explore Arenas</span>
      </motion.div>

      {/* 9. Bottom seamless gradient fade */}
      <div className="hero-bottom-fade" />
    </section>
  )
}
