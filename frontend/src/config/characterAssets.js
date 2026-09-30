/**
 * COLORIDO 2K26 — CENTRALIZED AVENGERS CHARACTER ASSET REGISTRY
 * 
 * SINGLE SOURCE OF TRUTH for all character image paths, animation configs,
 * event mappings, and visual effect definitions.
 * 
 * All images are locally stored in /public/characters/<character-slug>/
 * Do NOT hardcode character image paths in individual components.
 */

// ─── CHARACTER IMAGE ASSETS ────────────────────────────────────────────

export const characterAssets = {
  ironMan: {
    primary: '/characters/iron-man/tekraft.png',
    intro: '/characters/iron-man/intro.png',
    success: '/characters/iron-man/success.png',
    tekraft: '/characters/iron-man/tekraft.png',
  },
  spiderMan: {
    standing: '/characters/spider-man/standing.png',
    webShoot: '/characters/spider-man/web-shoot.png',
    action: '/characters/spider-man/action.png',
  },
  vision: {
    primary: '/characters/vision/primary.png',
    alternate: '/characters/vision/alternate.png',
  },
  starLord: {
    primary: '/characters/star-lord/primary.png',
    action: '/characters/star-lord/action1.png',
  },
  rocket: {
    primary: '/characters/rocket/primary.png',
    action: '/characters/rocket/action.png',
  },
  blackWidow: {
    standing: '/characters/black-widow/standing.png',
    action: '/characters/black-widow/action.png',
  },
  scarletWitch: {
    standing: '/characters/scarlet-witch/standing.png',
    power: '/characters/scarlet-witch/power.png',
  },
  doctorStrange: {
    standing: '/characters/doctor-strange/standing.png',
    magic: '/characters/doctor-strange/magic.png',
  },
  loki: {
    primary: '/characters/loki/primary.png',
    standing: '/characters/loki/standing.png',
  },
  blackPanther: {
    primary: '/characters/black-panther/primary.png',
    action: '/characters/black-panther/action.png',
  },
  captainAmerica: {
    primary: '/characters/captain-america/primary.png',
    action: '/characters/captain-america/action.png',
  },
  hulk: {
    primary: '/characters/hulk/primary.png',
    standing: '/characters/hulk/standing.png',
    action: '/characters/hulk/action.png',
  },
  thor: {
    primary: '/characters/thor/primary.png',
    lightning: '/characters/thor/lightning.png',
    action: '/characters/thor/action.png',
  },
  captainMarvel: {
    primary: '/characters/captain-marvel/primary.png',
    power: '/characters/captain-marvel/power.png',
  },
  hawkeye: {
    primary: '/characters/hawkeye/primary.png',
    action: '/characters/hawkeye/action.png',
  },
  antMan: {
    primary: '/characters/ant-man/primary.png',
    action: '/characters/ant-man/action.png',
  },
}

// ─── CHARACTER ID → ASSET KEY MAPPING ──────────────────────────────────

const CHARACTER_ASSET_MAP = {
  avenger_iron_man: 'ironMan',
  avenger_spiderman: 'spiderMan',
  avenger_vision: 'vision',
  avenger_star_lord: 'starLord',
  avenger_rocket_groot: 'rocket',
  avenger_black_widow: 'blackWidow',
  avenger_scarlet_witch: 'scarletWitch',
  avenger_doctor_strange: 'doctorStrange',
  avenger_loki: 'loki',
  avenger_black_panther: 'blackPanther',
  avenger_captain_america: 'captainAmerica',
  avenger_hulk: 'hulk',
  avenger_thor: 'thor',
  avenger_captain_marvel: 'captainMarvel',
  avenger_hawkeye: 'hawkeye',
  avenger_ant_man: 'antMan',
}

export const CHARACTER_BG_TYPES = {
  ironMan: 'transparent',
  spiderMan: 'transparent',
  vision: 'transparent',
  starLord: 'transparent',
  rocket: 'transparent',
  blackWidow: 'transparent',
  scarletWitch: 'transparent',
  doctorStrange: 'transparent',
  loki: 'transparent',
  blackPanther: 'transparent',
  captainAmerica: 'transparent',
  hulk: 'transparent',
  thor: 'transparent',
  captainMarvel: 'transparent',
  hawkeye: 'transparent',
  antMan: 'transparent',
}

export function getCharacterBgType(characterId) {
  const key = CHARACTER_ASSET_MAP[characterId] || characterId
  return CHARACTER_BG_TYPES[key] || 'transparent'
}

/**
 * Get all image assets for a character by their character ID.
 * Returns the asset object from characterAssets.
 */
export function getCharacterImages(characterId) {
  const key = CHARACTER_ASSET_MAP[characterId]
  return key ? characterAssets[key] : null
}

/**
 * Get the primary display image for a character.
 * Prefers: primary → standing → intro → first available image.
 */
export function getCharacterPrimaryImage(characterId) {
  const images = getCharacterImages(characterId)
  if (!images) return null
  return images.primary || images.standing || images.intro || Object.values(images)[0] || null
}

/**
 * Get a specific pose/variant image for a character.
 * Falls back to primary if the requested pose doesn't exist.
 */
export function getCharacterImage(characterId, pose = 'primary') {
  const images = getCharacterImages(characterId)
  if (!images) return null
  return images[pose] || images.primary || images.standing || images.intro || Object.values(images)[0] || null
}

// ─── CHARACTER ANIMATION CONFIGURATIONS ────────────────────────────────

export const characterAnimationConfig = {
  ironMan: {
    entrance: 'flyIn',
    idle: 'arcReactorPulse',
    hover: 'hudScan',
    effects: ['arcReactorGlow', 'repulsorLight', 'hudGrid'],
    colorTheme: { primary: '#e11d48', secondary: '#fbbf24', glow: 'rgba(225, 29, 72, 0.6)' },
    particleColor: '#fbbf24',
  },
  spiderMan: {
    entrance: 'swingIn',
    idle: 'spideySense',
    hover: 'webReady',
    click: 'webAttach',
    effects: ['webLine', 'motionTrail'],
    colorTheme: { primary: '#ef4444', secondary: '#3b82f6', glow: 'rgba(239, 68, 68, 0.6)' },
    particleColor: '#ef4444',
  },
  vision: {
    entrance: 'materialize',
    idle: 'mindStoneGlow',
    hover: 'holographicPulse',
    effects: ['geometricFragments', 'mindStoneBeam', 'holographicParticles'],
    colorTheme: { primary: '#eab308', secondary: '#06b6d4', glow: 'rgba(234, 179, 8, 0.55)' },
    particleColor: '#eab308',
  },
  starLord: {
    entrance: 'rhythmicDrop',
    idle: 'musicPulse',
    hover: 'danceBeat',
    effects: ['musicWaves', 'lightStreaks'],
    colorTheme: { primary: '#ec4899', secondary: '#3b82f6', glow: 'rgba(236, 72, 153, 0.55)' },
    particleColor: '#ec4899',
  },
  rocket: {
    entrance: 'blastIn',
    idle: 'mechanicalHum',
    hover: 'weaponReady',
    effects: ['sparks', 'hudFragments'],
    colorTheme: { primary: '#84cc16', secondary: '#f59e0b', glow: 'rgba(132, 204, 22, 0.6)' },
    particleColor: '#84cc16',
  },
  blackWidow: {
    entrance: 'lateralSlide',
    idle: 'combatReady',
    hover: 'stanceShift',
    effects: ['redStreak', 'controlledMotion'],
    colorTheme: { primary: '#f43f5e', secondary: '#38bdf8', glow: 'rgba(244, 63, 94, 0.55)' },
    particleColor: '#f43f5e',
  },
  scarletWitch: {
    entrance: 'chaosEmerge',
    idle: 'energyFloat',
    hover: 'hexPulse',
    effects: ['redEnergy', 'floatingParticles', 'energyWave'],
    colorTheme: { primary: '#ef4444', secondary: '#f43f5e', glow: 'rgba(239, 68, 68, 0.6)' },
    particleColor: '#ef4444',
  },
  doctorStrange: {
    entrance: 'portalOpen',
    idle: 'mandalaRotate',
    hover: 'magicCircle',
    effects: ['orangeRing', 'portalParticles', 'circularGeometry'],
    colorTheme: { primary: '#f59e0b', secondary: '#ea580c', glow: 'rgba(245, 158, 11, 0.6)' },
    particleColor: '#f59e0b',
  },
  loki: {
    entrance: 'illusionReveal',
    idle: 'shimmer',
    hover: 'mirrorSplit',
    effects: ['greenGoldLight', 'illusionDistort'],
    colorTheme: { primary: '#10b981', secondary: '#eab308', glow: 'rgba(16, 185, 129, 0.55)' },
    particleColor: '#10b981',
  },
  blackPanther: {
    entrance: 'vibraniumReveal',
    idle: 'kineticGlow',
    hover: 'regalPush',
    effects: ['vibraniumPulse', 'purpleGlow'],
    colorTheme: { primary: '#a855f7', secondary: '#06b6d4', glow: 'rgba(168, 85, 247, 0.55)' },
    particleColor: '#a855f7',
  },
  captainAmerica: {
    entrance: 'shieldSlam',
    idle: 'steadyReady',
    hover: 'shieldGlint',
    effects: ['shieldCircle', 'patrioticLight'],
    colorTheme: { primary: '#3b82f6', secondary: '#ef4444', glow: 'rgba(59, 130, 246, 0.55)' },
    particleColor: '#3b82f6',
  },
  hulk: {
    entrance: 'impactSlam',
    idle: 'heavyBreathe',
    hover: 'groundPound',
    effects: ['dustParticles', 'screenShake', 'greenEnergy'],
    colorTheme: { primary: '#22c55e', secondary: '#15803d', glow: 'rgba(34, 197, 94, 0.6)' },
    particleColor: '#22c55e',
  },
  thor: {
    entrance: 'thunderStrike',
    idle: 'lightningIdle',
    hover: 'stormCharge',
    effects: ['lightning', 'stormParticles', 'energyTrail'],
    colorTheme: { primary: '#38bdf8', secondary: '#f59e0b', glow: 'rgba(56, 189, 248, 0.6)' },
    particleColor: '#38bdf8',
  },
  captainMarvel: {
    entrance: 'cosmicFlyIn',
    idle: 'binaryGlow',
    hover: 'photonCharge',
    effects: ['cosmicEnergy', 'goldBlueTrail'],
    colorTheme: { primary: '#facc15', secondary: '#3b82f6', glow: 'rgba(250, 204, 21, 0.6)' },
    particleColor: '#facc15',
  },
  hawkeye: {
    entrance: 'precisionReveal',
    idle: 'targetLock',
    hover: 'drawBack',
    effects: ['targetReticle', 'arrowTrail'],
    colorTheme: { primary: '#8b5cf6', secondary: '#06b6d4', glow: 'rgba(139, 92, 246, 0.6)' },
    particleColor: '#8b5cf6',
  },
  antMan: {
    entrance: 'scaleUp',
    idle: 'quantumFlicker',
    hover: 'sizeShift',
    effects: ['scaleTransition', 'quantumParticles'],
    colorTheme: { primary: '#ec4899', secondary: '#fbbf24', glow: 'rgba(236, 72, 153, 0.6)' },
    particleColor: '#ec4899',
  },
}

/**
 * Get animation config for a character by ID.
 */
export function getAnimationConfig(characterId) {
  const key = CHARACTER_ASSET_MAP[characterId]
  return key ? characterAnimationConfig[key] : characterAnimationConfig.ironMan
}

// ─── FALLBACK IMAGE ────────────────────────────────────────────────────

export const FALLBACK_CHARACTER_IMAGE = '/characters/iron-man/intro.jpeg'

/**
 * Returns an onError handler for character images that applies a fallback.
 */
export function handleCharacterImageError(e) {
  if (e.target.src !== window.location.origin + FALLBACK_CHARACTER_IMAGE) {
    console.warn(`[CharacterAssetFallback] Missing image: ${e.target.src}`)
    e.target.src = FALLBACK_CHARACTER_IMAGE
    e.target.style.filter = 'grayscale(0.4) brightness(0.7)'
  }
}

// ─── ASSET VALIDATION UTILITY (dev only) ───────────────────────────────

export async function validateAllCharacterAssets() {
  const results = []
  for (const [charKey, assets] of Object.entries(characterAssets)) {
    for (const [pose, path] of Object.entries(assets)) {
      try {
        const res = await fetch(path, { method: 'HEAD' })
        results.push({ character: charKey, pose, path, ok: res.ok })
        if (!res.ok) {
          console.warn(`[CharacterAssetFallback] Missing: ${charKey}/${pose} → ${path}`)
        }
      } catch {
        results.push({ character: charKey, pose, path, ok: false })
        console.warn(`[CharacterAssetFallback] Failed to load: ${charKey}/${pose} → ${path}`)
      }
    }
  }
  const missing = results.filter(r => !r.ok)
  if (missing.length === 0) {
    console.log('[CharacterAssets] ✅ All character assets validated successfully!')
  } else {
    console.warn(`[CharacterAssets] ⚠️ ${missing.length} asset(s) missing:`, missing)
  }
  return results
}
