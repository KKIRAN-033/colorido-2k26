import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { characterAssets, handleCharacterImageError } from '../../config/characterAssets'
import './OpeningCinematic.css'

export default function OpeningCinematic({ onComplete }) {
  const overlayRef = useRef(null)
  const ironManRef = useRef(null)
  const logoRef = useRef(null)
  const shockwaveRef = useRef(null)
  const vortexRef = useRef(null)
  const canvasRef = useRef(null)
  const [completed, setCompleted] = useState(false)

  // Pure Web Audio API synthesized cinematic sound effects (100% legal, no external MP3s)
  const playSynthesizedAudio = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()

      // 1. Low cinematic drone / repulsor hum
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sawtooth'
      osc1.frequency.setValueAtTime(65, ctx.currentTime)
      osc1.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 1.8)
      gain1.gain.setValueAtTime(0.01, ctx.currentTime)
      gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.6)
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.2)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 3.5)

      // 2. High-energy repulsor flare & sonic boom at 1.8s
      setTimeout(() => {
        if (ctx.state === 'closed') return
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(320, ctx.currentTime)
        osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.8)
        gain2.gain.setValueAtTime(0.25, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start()
        osc2.stop(ctx.currentTime + 1.3)
      }, 1800)
    } catch (_) {
      // Audio autoplay policy fallback
    }
  }, [])

  // Canvas atmospheric particle dust
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fbbf24'

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.y > canvas.height) p.y = 0
        if (p.x < 0 || p.x > canvas.width) p.x = Math.random() * canvas.width
        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animId = requestAnimationFrame(render)
    }
    render()

    return () => cancelAnimationFrame(animId)
  }, [])

  // GSAP Cinematic Sequence
  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      handleFinish()
      return
    }

    playSynthesizedAudio()

    const tl = gsap.timeline({
      onComplete: handleFinish,
    })

    // Initial positioning — Iron Man streaks in directly from the dark cosmos
    gsap.set(ironManRef.current, {
      scale: 0.2,
      x: 150,
      y: -250,
      opacity: 0,
      rotationX: 15,
      rotationZ: -5,
      filter: 'blur(3px)',
    })
    gsap.set(vortexRef.current, { opacity: 0, scale: 0.8 })
    gsap.set(logoRef.current, { opacity: 0, scale: 0.85, y: 30 })
    gsap.set(shockwaveRef.current, { opacity: 0, scale: 0.2 })

    // Scene 1: Iron Man flies in directly without early blinding light
    tl.to(
      ironManRef.current,
      {
        opacity: 1,
        scale: 1.05,
        x: 0,
        y: 0,
        rotationX: 0,
        rotationZ: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out',
      },
      '+=0.1'
    )

    // Subtle background energy only appears as Iron Man arrives
    tl.to(
      vortexRef.current,
      {
        opacity: 0.4,
        scale: 1.1,
        duration: 0.8,
        ease: 'power2.out',
      },
      '-=0.4'
    )

    // Scene 3: Hero settles with subtle hover
    tl.to(
      ironManRef.current,
      {
        y: -15,
        scale: 1.0,
        duration: 0.6,
        ease: 'power1.inOut',
      },
      '+=0.1'
    )

    // Scene 4: Repulsor Shockwave
    tl.to(
      shockwaveRef.current,
      {
        opacity: 1,
        scale: 2.2,
        duration: 0.7,
        ease: 'power2.out',
      },
      '-=0.3'
    ).to(
      shockwaveRef.current,
      {
        opacity: 0,
        duration: 0.3,
      },
      '-=0.2'
    )

    // Scene 5: COLORIDO 2K26 Typography Reveal
    tl.to(
      logoRef.current,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
      },
      '-=0.5'
    )

    // Hold dramatic freeze frame
    tl.to({}, { duration: 1.2 })

    // Scene 6: Iron Man rocket blast into the sky & reveal site
    tl.to(ironManRef.current, {
      y: -700,
      scale: 0.2,
      opacity: 0,
      filter: 'blur(4px) brightness(2)',
      duration: 0.65,
      ease: 'power3.in',
    })

    tl.to(logoRef.current, {
      opacity: 0,
      scale: 1.15,
      duration: 0.45,
    }, '-=0.3')

    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    })

    return () => {
      tl.kill()
    }
  }, [playSynthesizedAudio])

  const handleFinish = () => {
    setCompleted(true)
    sessionStorage.setItem('colorido_intro_shown', 'true')
    if (onComplete) onComplete()
  }

  if (completed) return null

  return (
    <div ref={overlayRef} className="opening-cinematic-overlay">
      <canvas ref={canvasRef} className="opening-canvas" />
      <div ref={vortexRef} className="opening-vortex" />
      <div ref={shockwaveRef} className="opening-shockwave-ring" />

      {/* IRON MAN FLIGHT — SUPPLIED CHARACTER IMAGE */}
      <div ref={ironManRef} className="ironman-flight-actor">
        {/* Luminous Stark energy halo directly behind character */}
        <div className="ironman-halo-aura" />
        <img
          src={characterAssets.ironMan.intro}
          alt="Iron Man featured for COLORIDO 2K26"
          className="ironman-flight-image"
          onError={handleCharacterImageError}
          draggable="false"
        />
        {/* Arc reactor glow overlay */}
        <div className="ironman-arc-reactor-glow" />
        {/* Dynamic Thruster Jet Plumes */}
        <div className="thruster-plume-left" />
        <div className="thruster-plume-right" />
        {/* Repulsor light streaks */}
        <div className="repulsor-streak repulsor-streak-left" />
        <div className="repulsor-streak repulsor-streak-right" />
      </div>

      {/* TYPOGRAPHY LOGO REVEAL */}
      <div ref={logoRef} className="opening-logo-container">
        <h1 className="opening-main-title">COLORIDO 2K26</h1>
        <p className="opening-tagline">
          AVENGERS ASSEMBLE • NATIONAL MULTIVERSE
        </p>
      </div>

      {/* SKIP INTRO ACTION */}
      <button className="opening-skip-btn" onClick={handleFinish}>
        Skip Intro [Esc]
      </button>
    </div>
  )
}
