/**
 * COLORIDO 2K26 — AVENGERS ASSET & CINEMATIC MEDIA REGISTRY
 *
 * This configuration supports:
 * 1. Native High-Fidelity Canvas/GSAP Motion Engine (100% legal, zero external dependencies).
 * 2. User Drop-in Clips: Place any video/audio clips in `public/assets/avengers/`
 *    (e.g., `ironman_snap.mp4`, `intro_flight.mp4`, character action clips) to automatically
 *    upgrade the sequence to raw footage!
 */

export const AVENGERS_MEDIA = {
  // Climax Endgame Snap Scene
  snapScene: {
    video: '/assets/avengers/ironman_snap.mp4',
    poster: '/assets/avengers/ironman_snap_poster.webp',
    audio: '/assets/avengers/ironman_snap_audio.mp3',
    fallbackDurationMs: 4000,
  },

  // Opening Cinematic Flight
  openingFlight: {
    video: '/assets/avengers/intro_flight.mp4',
    poster: '/assets/avengers/intro_flight_poster.webp',
    fallbackDurationMs: 4200,
  },

  // Event Portals / Pre-registration Action Clips
  characterClips: {
    avenger_hulk: '/assets/avengers/hulk_smash.mp4',
    avenger_thor: '/assets/avengers/thor_strike.mp4',
    avenger_spiderman: '/assets/avengers/spiderman_sling.mp4',
    avenger_doctor_strange: '/assets/avengers/doctor_strange_portal.mp4',
    avenger_iron_man: '/assets/avengers/ironman_repulsor.mp4',
    avenger_black_panther: '/assets/avengers/black_panther_pulse.mp4',
    avenger_scarlet_witch: '/assets/avengers/scarlet_witch_hex.mp4',
    avenger_vision: '/assets/avengers/vision_mindbeam.mp4',
  },
}

/**
 * Checks asynchronously if a media resource (video/image) exists in the public directory
 */
export async function verifyMediaAvailability(url) {
  if (!url) return false
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (!res.ok) return false
    const contentType = res.headers.get('content-type') || ''
    // SPA fallback returns index.html (text/html) for missing assets in Vite/development
    if (contentType.includes('text/html')) return false
    return true
  } catch (_) {
    return false
  }
}
